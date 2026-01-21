import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { getTemplate } from "../../lib/pdf-templates";
import { callAI } from "../../lib/ai-service";
import { getTemplateForProfile, getProfileBySlug, getPromptForProfile } from "../../lib/profile-template-mapping";
import { loadPromptForProfile } from "../../lib/prompt-loader";

// Performance: Cache prompt templates in memory
const promptCache = new Map();

// Job validation keywords
const hybridKeywords = [
  'hybrid', 'hybrid work', 'hybrid model', 'hybrid schedule',
  'days in office', 'days per week in office', 'in-office days',
  'office presence', 'some days in office'
];

const onsiteKeywords = [
  'on-site', 'onsite', 'on site', 'in-office', 'in office',
  'office based', 'office-based', 'must be located in',
  'must be based in', 'must relocate', 'relocation required',
  'physical presence required', 'in person', 'local candidates',
  'candidates must be in', 'candidates must reside'
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { profile: profileSlug, jd, template, provider = "claude", model = null, roleName, companyName = null } = req.body;

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!jd) return res.status(400).send("Job description required");
    if (!roleName || !roleName.trim()) return res.status(400).send("Role name is required");

    // **Job Description Validation: Check if job is remote or hybrid/onsite**
    console.log("Checking job location type...");
    const jdLower = jd.toLowerCase();
    
    // Check for hybrid indicators
    const isHybrid = hybridKeywords.some(keyword => jdLower.includes(keyword));
    
    // Check for onsite indicators (but exclude if "remote" is also mentioned strongly)
    const hasOnsiteKeywords = onsiteKeywords.some(keyword => jdLower.includes(keyword));
    const hasRemoteKeywords = jdLower.includes('remote') || jdLower.includes('work from home') || 
                               jdLower.includes('fully remote') || jdLower.includes('100% remote') ||
                               jdLower.includes('remote-first') || jdLower.includes('distributed team');
    const hasJuniorKeywords = jdLower.includes('junior role') || jdLower.includes('entry level') ||
                               jdLower.includes('entry-level');
    
    const hasInternKeywords = jdLower.includes(' intern ') || jdLower.includes('internship');

    const isJunior = hasJuniorKeywords && !hasInternKeywords;
    const isIntern = hasInternKeywords && !hasJuniorKeywords;
    const isEntryLevel = isJunior || isIntern;

    // Determine if it's truly onsite (has onsite keywords but not strong remote indicators)
    const isOnsite = hasOnsiteKeywords && !hasRemoteKeywords;
    
    if (isHybrid) {
      console.log("❌ Job is HYBRID - Rejecting");
      return res.status(400).json({ 
        error: "This position is HYBRID (requires some office days). This tool is designed for REMOTE-ONLY positions. Please provide a fully remote job description.",
        locationType: "hybrid"
      });
    }
    
    if (isOnsite) {
      console.log("❌ Job is ONSITE - Rejecting");
      return res.status(400).json({ 
        error: "This position is ONSITE/IN-PERSON. This tool is designed for REMOTE-ONLY positions. Please provide a fully remote job description.",
        locationType: "onsite"
      });
    }

    if (isEntryLevel) {
      console.log("❌ Job is ENTRY LEVEL - Rejecting");
      return res.status(400).json({ 
        error: "This position is ENTRY LEVEL. This tool is designed for MID-LEVEL and SENIOR positions. Please provide a more senior job description.",
        locationType: "entry-level"
      });
    }
    
    console.log("✅ Job appears to be REMOTE - Proceeding");

    // Performance: Start timing
    const startTime = Date.now();
    console.time('total-generation');

    // Get profile configuration from slug
    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile with slug "${profileSlug}" not found`);
    }

    const resumeName = profileConfig.resume;

    // Get template from profile mapping or use provided/default
    const templateName = template || getTemplateForProfile(profileSlug) || "Resume";

    // Validate provider
    if (!["claude", "openai"].includes(provider)) {
      return res.status(400).send(`Unsupported provider: ${provider}. Supported: claude, openai`);
    }

    // Performance: Load profile JSON using async file read (parallelizable)
    console.log(`Loading profile: ${resumeName} (slug: ${profileSlug})`);
    console.time('file-io');
    const profilePath = path.join(process.cwd(), "resumes", `${resumeName}.json`);

    // Use async file read for better performance
    let profileData;
    try {
      const profileContent = await fsPromises.readFile(profilePath, "utf-8");
      profileData = JSON.parse(profileContent);
      console.timeEnd('file-io');
    } catch (error) {
      console.timeEnd('file-io');
      if (error.code === 'ENOENT') {
        return res.status(404).send(`Profile file "${resumeName}.json" not found`);
      }
      throw error;
    }


    // Calculate years of experience with improved date parsing
    const calculateYears = (experience) => {
      if (!experience || experience.length === 0) return 0;

      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        
        const trimmed = String(dateStr).trim();
        if (trimmed.toLowerCase() === "present") return new Date();
        
        // Handle MM/YYYY format (e.g., "12/2018", "07/2018")
        const mmYyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{4})\s*$/);
        if (mmYyyyMatch) {
          const month = parseInt(mmYyyyMatch[1], 10) - 1; // JS months are 0-indexed
          const year = parseInt(mmYyyyMatch[2], 10);
          return new Date(year, month, 1); // First day of the month
        }
        
        // Try standard Date parsing
        const parsed = new Date(trimmed);
        
        // Check if date is valid
        if (isNaN(parsed.getTime())) {
          console.warn(`Failed to parse date: "${dateStr}"`);
          return null;
        }
        
        return parsed;
      };

      // Parse all dates and filter out invalid ones
      const validDates = experience
        .map(job => parseDate(job?.start_date))
        .filter(date => date !== null);
      
      if (validDates.length === 0) {
        console.warn("No valid dates found in experience");
        return 0;
      }
      
      // Find earliest date
      const earliest = validDates.reduce((min, date) => {
        return date < min ? date : min;
      }, validDates[0]);
      
      const years = (new Date() - earliest) / (1000 * 60 * 60 * 24 * 365);
      return Math.max(0, Math.round(years));
    };

    const yearsOfExperience = calculateYears(profileData.experience);

    // Prepare variables for prompt template
    const workHistory = (profileData.experience || []).map((job, idx) => {
      const parts = [`${idx + 1}. ${job?.company || 'Unknown Company'}`];
      if (job?.title) parts.push(job.title);
      if (job?.location) parts.push(job.location);
      parts.push(`${job?.start_date || 'N/A'} - ${job?.end_date || 'N/A'}`);
      return parts.join(' | ');
    }).join('\n');

    const education = (profileData.education || []).map(edu => {
      let eduStr = `- ${edu?.degree || 'N/A'}, ${edu?.school || 'N/A'} (${edu?.start_year || ''}-${edu?.end_year || ''})`;
      if (edu?.grade) eduStr += ` | GPA: ${edu.grade}`;
      return eduStr;
    }).join('\n');

    // Performance: Load prompt template with caching
    console.time('prompt-loading');
    // Cache key is just the profile slug (template doesn't change per profile)
    const promptCacheKey = profileSlug;
    
    let promptTemplate;
    if (promptCache.has(promptCacheKey)) {
      // Use cached prompt template
      promptTemplate = promptCache.get(promptCacheKey);
      console.log("Using cached prompt template");
    } else {
      // Load and cache the raw template (without variable replacements)
      const promptName = getPromptForProfile(profileSlug);
      const templatePath = path.join(process.cwd(), 'lib', 'prompts', `${promptName}.txt`);
      const defaultPath = path.join(process.cwd(), 'lib', 'prompts', 'default.txt');
      
      if (fs.existsSync(templatePath)) {
        promptTemplate = fs.readFileSync(templatePath, 'utf-8');
      } else if (fs.existsSync(defaultPath)) {
        promptTemplate = fs.readFileSync(defaultPath, 'utf-8');
      } else {
        throw new Error(`Prompt template not found for ${profileSlug}`);
      }
      
      // Cache the raw template
      promptCache.set(promptCacheKey, promptTemplate);
    }
    
    // Process template with variables
    const variables = {
      name: profileData.name || "Unknown",
      email: profileData.email || "",
      location: profileData.location || "",
      yearsOfExperience: yearsOfExperience,
      workHistory: workHistory,
      education: education,
      jobDescription: jd,
      experienceCount: (profileData.experience || []).length
    };
    
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, String(value || ''));
    }
    
    console.timeEnd('prompt-loading');

    // Performance: AI call timing
    console.time('ai-call');
    const aiResponse = await callAI(prompt, provider, model);
    console.timeEnd('ai-call');

    // Log token usage to debug if we're hitting limits
    console.log(`${provider.toUpperCase()} API Response Metadata:`);
    console.log("- Provider:", aiResponse.provider);
    console.log("- Model:", aiResponse.model);
    console.log("- Stop reason:", aiResponse.stop_reason);
    console.log("- Input tokens:", aiResponse.usage?.input_tokens);
    console.log("- Output tokens:", aiResponse.usage?.output_tokens);

    // Extract content from AI response (handle both single and multiple content blocks)
    const extractContent = (response) => {
      if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
        throw new Error("AI response has no content");
      }
      // Handle multiple content blocks and join them
      const extracted = (response.content || [])
        .map(part => {
          if (typeof part === 'string') return part;
          if (part?.text) return part.text;
          if (part?.type === 'text' && part?.text) return part.text;
          if (typeof part === 'object') return JSON.stringify(part);
          return String(part || '');
        })
        .join('')
        .trim();
      
      // Log first 500 chars for debugging
      console.log("Raw AI response (first 500 chars):", extracted.substring(0, 500));
      
      return extracted;
    };

    // Performance: Extract content - don't retry on max_tokens if JSON is valid
    let content = extractContent(aiResponse);
    
    // Check if we have valid JSON even if max_tokens was hit
    const hasValidJson = content.includes('{') && content.includes('}');
    
    if ((aiResponse.stop_reason === 'max_tokens' || aiResponse.stop_reason === 'length') && hasValidJson) {
      console.warn(`⚠️ WARNING: ${provider.toUpperCase()} hit max_tokens limit, but response appears complete. Attempting to parse...`);
      // Try to parse - if it works, we don't need to retry
      try {
        const testParse = JSON.parse(content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim());
        if (testParse.title && testParse.summary && testParse.skills && testParse.experience) {
          console.log("✅ Response is complete despite max_tokens - no retry needed");
          // Use the extracted content as-is
        } else {
          throw new Error("Incomplete JSON structure");
        }
      } catch (parseError) {
        // JSON is incomplete, need to retry
        console.error(`⚠️ Response is incomplete. Retrying with reduced requirements...`);
        console.time('ai-call-retry');
        const concisePrompt = prompt
          .replace(/TOTAL: 60-80 skills maximum/g, 'TOTAL: 50-60 skills maximum')
          .replace(/Per category: 8-12 skills/g, 'Per category: 6-10 skills')
          .replace(/6 bullets each/g, '5 bullets each')
          .replace(/5-6 bullets per job/g, '4-5 bullets per job');

        const retryResponse = await callAI(concisePrompt, provider, model);
        console.log("Retry Response Metadata:");
        console.log("- Stop reason:", retryResponse.stop_reason);
        console.log("- Output tokens:", retryResponse.usage?.output_tokens);
        console.timeEnd('ai-call-retry');
        content = extractContent(retryResponse);
      }
    }

    // Check if AI is apologizing instead of returning JSON
    if (content.toLowerCase().startsWith("i'm sorry") ||
      content.toLowerCase().startsWith("i cannot") ||
      content.toLowerCase().startsWith("i apologize")) {
      console.error("AI is apologizing instead of returning JSON:", content.substring(0, 200));
      throw new Error("AI refused to generate resume. The prompt may be too complex. Please try again with a shorter job description or simpler requirements.");
    }

    // Performance: Optimized JSON extraction - single pass when possible
    console.time('json-extraction');
    
    // Enhanced JSON extraction - handle various formats
    // Remove markdown code blocks (case insensitive) - be more aggressive
    let cleanedContent = content.replace(/```json\s*/gi, "")
      .replace(/```javascript\s*/gi, "")
      .replace(/```js\s*/gi, "")
      .replace(/```\s*/g, "");

    // Remove common prefixes and explanations
    cleanedContent = cleanedContent.replace(/^(here is|here's|this is|the json is|json:|response:):?\s*/gim, "");
    
    // Remove any text before the first {
    const firstBrace = cleanedContent.indexOf('{');
    if (firstBrace > 0) {
      cleanedContent = cleanedContent.substring(firstBrace);
    }

    // Find the last } that matches the first { (optimized single pass)
    let braceCount = 0;
    let lastBrace = -1;
    for (let i = 0; i < cleanedContent.length; i++) {
      if (cleanedContent[i] === '{') braceCount++;
      if (cleanedContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastBrace = i;
          break;
        }
      }
    }

    if (lastBrace !== -1) {
      content = cleanedContent.substring(0, lastBrace + 1).trim();
    } else {
      // Fallback to original method
      const fallbackLastBrace = cleanedContent.lastIndexOf('}');
      if (fallbackLastBrace !== -1) {
        content = cleanedContent.substring(0, fallbackLastBrace + 1).trim();
      } else {
        console.timeEnd('json-extraction');
        console.error("No JSON object found in response");
        throw new Error("AI did not return valid JSON format. Please try again.");
      }
    }
    
    console.timeEnd('json-extraction');

    // Performance: Optimized JSON parsing - try direct parse first
    console.time('json-parsing');
    let resumeContent;
    try {
      resumeContent = JSON.parse(content);
      console.timeEnd('json-parsing');
    } catch (parseError) {
      console.error("=== JSON PARSE ERROR ===");
      console.error("Parse error:", parseError.message);
      console.error("Error position:", parseError.message.match(/position (\d+)/)?.[1] || "unknown");
      console.error("Content length:", content.length);
      console.error("First 500 chars:", content.substring(0, 500));
      console.error("Last 500 chars:", content.substring(Math.max(0, content.length - 500)));

      // Try to fix common JSON issues
      try {
        let fixedContent = content;
        
        // Remove trailing commas before } or ]
        fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped newlines in strings
        fixedContent = fixedContent.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*/g, '$1 ');
        
        // Fix unescaped quotes in string values (but not keys)
        fixedContent = fixedContent.replace(/("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*)"([,}])/g, (match, key, value, ending) => {
          const escapedValue = value.replace(/"/g, '\\"');
          return `${key}: "${escapedValue}"${ending}`;
        });
        
        // Remove comments (JSON doesn't support comments)
        fixedContent = fixedContent.replace(/\/\/.*$/gm, '');
        fixedContent = fixedContent.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Try parsing again
        resumeContent = JSON.parse(fixedContent);
        console.log("✅ Successfully parsed after fixing common issues");
      } catch (secondError) {
        console.error("Failed to parse even after fixes");
        console.error("Second error:", secondError.message);
        
        // Try one more time with more aggressive fixes
        try {
          let aggressiveFix = content;
          // Remove all control characters except newlines and tabs
          aggressiveFix = aggressiveFix.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
          // Fix any remaining issues with quotes
          aggressiveFix = aggressiveFix.replace(/([^\\])"([^",:}\]]*)"\s*:/g, '$1"$2":');
          resumeContent = JSON.parse(aggressiveFix);
          console.log("✅ Successfully parsed after aggressive fixes");
        } catch (thirdError) {
          console.timeEnd('json-parsing');
          console.error("All parsing attempts failed");
          throw new Error(`AI returned invalid JSON: ${parseError.message}. The AI response may be malformed. Please try again with a shorter job description.`);
        }
      }
      console.timeEnd('json-parsing');
    }

    // Validate required fields
    if (!resumeContent.title || !resumeContent.summary || !resumeContent.skills || !resumeContent.experience) {
      console.error("Missing required fields in AI response:", Object.keys(resumeContent));
      throw new Error("AI response missing required fields (title, summary, skills, or experience)");
    }

    console.log("✅ AI content generated successfully");
    console.log("Skills categories:", Object.keys(resumeContent.skills).length);
    console.log("Experience entries:", resumeContent.experience.length);

    // Debug: Check if experience has details
    resumeContent.experience.forEach((exp, idx) => {
      console.log(`Experience ${idx + 1}: ${exp.title || 'NO TITLE'} - Details count: ${exp.details?.length || 0}`);
      if (!exp.details || exp.details.length === 0) {
        console.error(`⚠️ WARNING: Experience entry ${idx + 1} has NO DETAILS!`);
      }
    });

    // Get React PDF template component
    // Normalize template name to match registry format
    const normalizedTemplateName = templateName || "Resume";
    const TemplateComponent = getTemplate(normalizedTemplateName);

    if (!TemplateComponent) {
      console.error(`Template not found: ${normalizedTemplateName}`);
      return res.status(404).send(`Template "${normalizedTemplateName}" not found`);
    }

    console.log(`Using template: ${templateName}`);

    // Prepare data for template
    const templateData = {
      name: profileData.name || "Unknown",
      title: resumeContent.title || "Senior Software Engineer",
      email: profileData.email || "",
      phone: null, // Excluded from resume
      location: profileData.location || "",
      linkedin: null, // Excluded from resume
      website: null, // Excluded from resume (may contain GitHub)
      summary: resumeContent.summary || "",
      skills: resumeContent.skills || {},
      experience: (profileData.experience || []).map((job, idx) => ({
        title: job?.title || resumeContent.experience?.[idx]?.title || "Engineer",
        company: job?.company || "Unknown Company",
        location: job?.location || "",
        start_date: job?.start_date || "",
        end_date: job?.end_date || "",
        details: resumeContent.experience?.[idx]?.details || []
      })),
      education: profileData.education || []
    };

    // Performance: Generate filename first (before PDF rendering)
    const nameParts = resumeName ? resumeName.trim().split(/\s+/) : [];
    let baseName;
    if (!nameParts || nameParts.length === 0) baseName = 'resume';
    else if (nameParts.length === 1) baseName = nameParts[0];
    else baseName = `${nameParts[0]}_${nameParts[nameParts.length - 1]}`;
    baseName = baseName.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");

    // Append role name (required)
    const sanitizedRoleName = roleName.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");
    baseName = `${baseName}_${sanitizedRoleName}`;

    // Append company name if provided
    if (companyName && companyName.trim()) {
      const sanitizedCompanyName = companyName.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");
      baseName = `${baseName}_${sanitizedCompanyName}`;
    }

    const fileName = `${baseName}.pdf`;

    // Performance: Stream PDF directly to response (no buffering)
    console.time('pdf-rendering');
    const pdfDocument = React.createElement(TemplateComponent, { data: templateData });
    const pdfStream = await renderToStream(pdfDocument);
    console.timeEnd('pdf-rendering');

    // Set headers before streaming
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Performance: Stream directly to response instead of buffering
    console.time('pdf-streaming');
    for await (const chunk of pdfStream) {
      res.write(chunk);
    }
    res.end();
    console.timeEnd('pdf-streaming');

    // Performance: Log total time
    const totalTime = Date.now() - startTime;
    console.timeEnd('total-generation');
    console.log(`✅ PDF generated successfully in ${(totalTime / 1000).toFixed(2)}s`);


  } catch (err) {
    console.error("PDF generation error:", err);
    
    // Handle specific error types
    if (err?.status === 403) {
      return res.status(500).json({
        error: "PDF generation failed: API access denied (403 Forbidden). Check your API key configuration.",
        details: err?.error?.error?.message || err?.message
      });
    }
    
    // Handle validation errors (already sent response)
    if (err?.statusCode && err.statusCode < 500) {
      return; // Response already sent
    }
    
    // Generic error response
    res.status(500).json({
      error: "PDF generation failed",
      message: err?.message || "Unknown error occurred"
    });
  }
}
