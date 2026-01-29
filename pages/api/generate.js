import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { getTemplate } from "../../lib/pdf-templates";
import { callAI } from "../../lib/ai-service";
import { getTemplateForProfile, getProfileBySlug } from "../../lib/profile-template-mapping";

// Performance: Cache prompt templates in memory
const promptCache = new Map();

// Pre-compile validation patterns for performance
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

// Pre-compile regex for faster validation
const remoteKeywords = ['remote', 'work from home', 'fully remote', '100% remote', 'remote-first', 'distributed team'];
const juniorKeywords = ['junior role', 'entry level', 'entry-level'];
const internKeywords = [' intern ', 'internship'];

// Helper function for fast keyword checking
const hasAnyKeyword = (text, keywords) => {
  for (const keyword of keywords) {
    if (text.includes(keyword)) return true;
  }
  return false;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { profile: profileSlug, jd, template, provider = "claude", model = null, roleName, companyName = null } = req.body;

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!jd) return res.status(400).send("Job description required");
    if (!roleName || !roleName.trim()) return res.status(400).send("Role name is required");

    // **Job Description Validation: Check if job is remote or hybrid/onsite**
    console.log("Checking job location type...");
    // Cache lowercase conversion - used multiple times
    const jdLower = jd.toLowerCase();
    
    // Optimized validation using helper function
    const isHybrid = hasAnyKeyword(jdLower, hybridKeywords);
    const hasOnsiteKeywords = hasAnyKeyword(jdLower, onsiteKeywords);
    const hasRemoteKeywords = hasAnyKeyword(jdLower, remoteKeywords);
    const hasJuniorKeywords = hasAnyKeyword(jdLower, juniorKeywords);
    const hasInternKeywords = hasAnyKeyword(jdLower, internKeywords);

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


    // Calculate years of experience with improved date parsing - optimized
    const calculateYears = (experience) => {
      if (!experience || experience.length === 0) return 0;

      // Pre-compile regex pattern
      const mmYyyyPattern = /^(\d{1,2})\/(\d{4})\s*$/;
      const presentLower = "present";
      const msPerYear = 1000 * 60 * 60 * 24 * 365;

      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        
        const trimmed = String(dateStr).trim();
        const trimmedLower = trimmed.toLowerCase();
        if (trimmedLower === presentLower) return new Date();
        
        // Handle MM/YYYY format (e.g., "12/2018", "07/2018") - optimized
        const mmYyyyMatch = trimmed.match(mmYyyyPattern);
        if (mmYyyyMatch) {
          return new Date(parseInt(mmYyyyMatch[2], 10), parseInt(mmYyyyMatch[1], 10) - 1, 1);
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

      // Parse all dates and filter out invalid ones - optimized loop
      const validDates = [];
      for (let i = 0; i < experience.length; i++) {
        const date = parseDate(experience[i]?.start_date);
        if (date !== null) validDates.push(date);
      }
      
      if (validDates.length === 0) {
        console.warn("No valid dates found in experience");
        return 0;
      }
      
      // Find earliest date - optimized
      let earliest = validDates[0];
      for (let i = 1; i < validDates.length; i++) {
        if (validDates[i] < earliest) {
          earliest = validDates[i];
        }
      }
      
      const years = (Date.now() - earliest.getTime()) / msPerYear;
      return Math.max(0, Math.round(years));
    };

    const yearsOfExperience = calculateYears(profileData.experience);

    // Prepare variables for prompt template - optimized string building
    const experience = profileData.experience || [];
    const workHistoryParts = [];
    for (let idx = 0; idx < experience.length; idx++) {
      const job = experience[idx];
      const parts = [`${idx + 1}. ${job?.company || 'Unknown Company'}`];
      if (job?.title) parts.push(job.title);
      if (job?.location) parts.push(job.location);
      parts.push(`${job?.start_date || 'N/A'} - ${job?.end_date || 'N/A'}`);
      workHistoryParts.push(parts.join(' | '));
    }
    const workHistory = workHistoryParts.join('\n');

    const educationList = profileData.education || [];
    const educationParts = [];
    for (let i = 0; i < educationList.length; i++) {
      const edu = educationList[i];
      let eduStr = `- ${edu?.degree || 'N/A'}, ${edu?.school || 'N/A'} (${edu?.start_year || ''}-${edu?.end_year || ''})`;
      if (edu?.grade) eduStr += ` | GPA: ${edu.grade}`;
      educationParts.push(eduStr);
    }
    const education = educationParts.join('\n');

    // Load default prompt only (no role detection)
    console.time('prompt-loading');
    const promptCacheKey = `${profileSlug}-default`;

    let promptTemplate;
    if (promptCache.has(promptCacheKey)) {
      promptTemplate = promptCache.get(promptCacheKey);
      console.log("Using cached prompt template");
    } else {
      const defaultPath = path.join(process.cwd(), 'lib', 'prompts', 'default.txt');
      promptTemplate = await fsPromises.readFile(defaultPath, 'utf-8');
      console.log("Using default prompt");
      promptCache.set(promptCacheKey, promptTemplate);
    }
    
    // Process template with variables - optimized single pass replacement
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
    
    // Pre-compile regex patterns for all variables (one-time compilation)
    const variablePatterns = Object.keys(variables).map(key => ({
      pattern: new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
      value: String(variables[key] || '')
    }));
    
    // Single pass replacement with pre-compiled patterns
    let prompt = promptTemplate;
    for (const { pattern, value } of variablePatterns) {
      prompt = prompt.replace(pattern, value);
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
    
    // Check if we have valid JSON even if max_tokens was hit - optimized check
    const hasValidJson = content.indexOf('{') !== -1 && content.indexOf('}') !== -1;
    
    if ((aiResponse.stop_reason === 'max_tokens' || aiResponse.stop_reason === 'length') && hasValidJson) {
      console.warn(`⚠️ WARNING: ${provider.toUpperCase()} hit max_tokens limit, but response appears complete. Attempting to parse...`);
      // Pre-compiled pattern for quick test parse
      const quickCleanPattern = /```(?:json\s*)?/gi;
      // Try to parse - if it works, we don't need to retry
      try {
        const testParse = JSON.parse(content.replace(quickCleanPattern, "").replace(/```\s*/g, "").trim());
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

    // Check if AI is apologizing instead of returning JSON - optimized
    const contentLower = content.toLowerCase();
    if (contentLower.startsWith("i'm sorry") ||
      contentLower.startsWith("i cannot") ||
      contentLower.startsWith("i apologize")) {
      console.error("AI is apologizing instead of returning JSON:", content.substring(0, 200));
      throw new Error("AI refused to generate resume. The prompt may be too complex. Please try again with a shorter job description or simpler requirements.");
    }

    // Performance: Optimized JSON extraction - single pass when possible
    console.time('json-extraction');
    
    // Pre-compiled regex patterns for JSON cleaning
    const codeBlockPattern = /```(?:json|javascript|js)?\s*/gi;
    const prefixPattern = /^(here is|here's|this is|the json is|json:|response:):?\s*/gim;
    
    // Enhanced JSON extraction - handle various formats
    // Remove markdown code blocks (case insensitive) - optimized single pass
    let cleanedContent = content.replace(codeBlockPattern, "").replace(/```\s*/g, "");

    // Remove common prefixes and explanations
    cleanedContent = cleanedContent.replace(prefixPattern, "");
    
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

      // Try to fix common JSON issues - use pre-compiled patterns
      try {
        let fixedContent = content;
        
        // Pre-compiled regex patterns for JSON fixing
        const trailingCommaPattern = /,(\s*[}\]])/g;
        const unescapedNewlinePattern = /("(?:[^"\\]|\\.)*")\s*\n\s*/g;
        const unescapedQuotePattern = /("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*)"([,}])/g;
        const lineCommentPattern = /\/\/.*$/gm;
        const blockCommentPattern = /\/\*[\s\S]*?\*\//g;
        
        // Remove trailing commas before } or ]
        fixedContent = fixedContent.replace(trailingCommaPattern, '$1');
        
        // Fix unescaped newlines in strings
        fixedContent = fixedContent.replace(unescapedNewlinePattern, '$1 ');
        
        // Fix unescaped quotes in string values (but not keys)
        fixedContent = fixedContent.replace(unescapedQuotePattern, (match, key, value, ending) => {
          const escapedValue = value.replace(/"/g, '\\"');
          return `${key}: "${escapedValue}"${ending}`;
        });
        
        // Remove comments (JSON doesn't support comments)
        fixedContent = fixedContent.replace(lineCommentPattern, '');
        fixedContent = fixedContent.replace(blockCommentPattern, '');
        
        // Try parsing again
        resumeContent = JSON.parse(fixedContent);
        console.log("✅ Successfully parsed after fixing common issues");
      } catch (secondError) {
        console.error("Failed to parse even after fixes");
        console.error("Second error:", secondError.message);
        
        // Try one more time with more aggressive fixes - pre-compiled patterns
        try {
          let aggressiveFix = content;
          // Pre-compiled patterns for aggressive fixing
          const controlCharPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;
          const quoteFixPattern = /([^\\])"([^",:}\]]*)"\s*:/g;
          
          // Remove all control characters except newlines and tabs
          aggressiveFix = aggressiveFix.replace(controlCharPattern, '');
          // Fix any remaining issues with quotes
          aggressiveFix = aggressiveFix.replace(quoteFixPattern, '$1"$2":');
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

    // Performance: Generate filename first (before PDF rendering) - optimized
    // Pre-compile sanitization pattern
    const sanitizePattern = /[^A-Za-z0-9_-]/g;
    const spacePattern = /\s+/g;
    
    const nameParts = resumeName ? resumeName.trim().split(/\s+/) : [];
    let baseName;
    if (nameParts.length === 0) {
      baseName = 'resume';
    } else if (nameParts.length === 1) {
      baseName = nameParts[0].replace(sanitizePattern, "");
    } else {
      baseName = `${nameParts[0]}_${nameParts[nameParts.length - 1]}`.replace(sanitizePattern, "");
    }

    // Append role name (required) - optimized
    const sanitizedRoleName = roleName.trim().replace(spacePattern, "_").replace(sanitizePattern, "");
    baseName = `${baseName}_${sanitizedRoleName}`;

    // Append company name if provided - optimized
    if (companyName && companyName.trim()) {
      const sanitizedCompanyName = companyName.trim().replace(spacePattern, "_").replace(sanitizePattern, "");
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
