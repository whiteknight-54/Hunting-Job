import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readAtsPromptTemplate } from "./ats-prompts.js";
import { buildAtsSubstitutionVariables } from "./resume-prompt-variables.js";
import { applyPromptVariables } from "./apply-prompt-variables.js";
import {
  ATS_PROMPT_GLOSSARY_BLOCK,
  ATS_PROMPT_INPUT_BLOCK,
  ATS_PROMPT_OUTPUT_BLOCK,
} from "./tailored-resume/ats-prompt-blocks.js";

const profileData = {
  name: "Jane Doe",
  title: "Senior Engineer",
  email: "jane@example.com",
  location: "Austin, TX",
  experience: [
    {
      company: "Acme",
      title: "Engineer",
      location: "TX",
      start_date: "01/2020",
      end_date: "Present",
      details: ["Shipped features."],
    },
    {
      company: "Beta Co",
      title: "Junior Engineer",
      location: "TX",
      start_date: "01/2018",
      end_date: "12/2019",
    },
  ],
  education: [{ degree: "BS CS", school: "State U", start_year: "2014", end_year: "2018" }],
};

async function assembleAtsPrompt({ profileData, jobDescription, atsPromptId, questions = "" }) {
  const variables = buildAtsSubstitutionVariables(profileData, { jobDescription, questions });
  const promptTemplate = await readAtsPromptTemplate(atsPromptId);
  const inputBlock = applyPromptVariables(ATS_PROMPT_INPUT_BLOCK, variables);
  const glossaryBlock = applyPromptVariables(ATS_PROMPT_GLOSSARY_BLOCK, variables);
  const instructions = applyPromptVariables(promptTemplate, variables);
  const outputBlock = applyPromptVariables(ATS_PROMPT_OUTPUT_BLOCK, variables);
  return [inputBlock, glossaryBlock, instructions, outputBlock].join("\n\n");
}

describe("ATS prompt assembly", () => {
  it("composes INPUT, GLOSSARY, instructions, and OUTPUT blocks", async () => {
    const prompt = await assembleAtsPrompt({
      profileData,
      jobDescription: "Looking for a React engineer.",
      atsPromptId: "default",
    });

    assert.match(prompt, /INPUT \(profile base/);
    assert.match(prompt, /FIELD GLOSSARY/);
    assert.match(prompt, /OUTPUT \(tailored resume JSON/);
    assert.match(prompt, /ATS prompt variant: default/);
    assert.match(prompt, /Jane Doe/);
    assert.match(prompt, /Acme/);
    assert.match(prompt, /Looking for a React engineer/);
    assert.match(prompt, /Required `experience` array length: 2/);
    assert.match(prompt, /"title":/);
  });

  it("appends application questions into job context only", async () => {
    const prompt = await assembleAtsPrompt({
      profileData,
      jobDescription: "Base JD",
      atsPromptId: "default",
      questions: "Are you authorized to work in the US?",
    });

    assert.match(prompt, /Employer \/ application questions/);
    assert.match(prompt, /Are you authorized to work in the US\?/);
    assert.doesNotMatch(prompt, /Target role:/);
    assert.doesNotMatch(prompt, /Company:/);
  });
});
