import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCareerContext, buildRoleDetailBudget } from "./career-context.js";
import { buildAtsSubstitutionVariables } from "./resume-prompt-variables.js";
import { composeAtsPrompt } from "./compose-ats-prompt.js";
import { readAtsPromptTemplate } from "./ats-prompts.js";

const profileData = {
  name: "Jane Doe",
  email: "jane@example.com",
  location: "Austin, TX",
  experience: [
    {
      company: "Acme",
      title: "Senior Engineer",
      location: "TX",
      start_date: "01/2020",
      end_date: "Present",
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
  screening: {
    notes: "Strong React background.",
    certifications: ["AWS Certified Developer"],
  },
};

describe("career context", () => {
  it("builds per-role detail budget", () => {
    const budget = buildRoleDetailBudget(profileData.experience);
    assert.deepEqual(budget, ["7–8", "6–8"]);
  });

  it("includes progression arc and chronology", () => {
    const ctx = buildCareerContext(profileData);
    assert.match(ctx.careerPath, /Acme/);
    assert.match(ctx.careerPath, /Beta Co/);
    assert.match(ctx.careerGuidance, /experience\[0\]/);
    assert.match(ctx.chronologyRules, /experience\[1\]/);
  });
});

describe("ATS prompt composition", () => {
  it("composes career-customized INPUT, GLOSSARY, instructions, and OUTPUT", async () => {
    const variables = buildAtsSubstitutionVariables(profileData, {
      jobDescription: "Looking for a React engineer.",
    });
    const instructionTemplate = await readAtsPromptTemplate("final");
    const { prompt, blocks, unreplaced } = composeAtsPrompt({ variables, instructionTemplate });

    assert.equal(unreplaced.length, 0);
    assert.match(blocks.input, /INPUT — CANDIDATE & JOB CONTEXT/);
    assert.match(blocks.input, /CAREER PATH/);
    assert.match(blocks.input, /Jane Doe/);
    assert.match(blocks.input, /Acme/);
    assert.match(blocks.glossary, /FIELD GLOSSARY & DATA CONTRACT/);
    assert.match(blocks.glossary, /Root keys ONLY/);
    assert.match(blocks.instructions, /ATS prompt variant: final/);
    assert.match(blocks.output, /STRICT TAILORED RESUME JSON/);
    assert.match(blocks.output, /"experience": \[/);
    assert.match(prompt, /Looking for a React engineer/);
    assert.match(prompt, /Strong React background/);
    assert.match(prompt, /Senior Engineer/);
    assert.doesNotMatch(prompt, /\{\{[a-zA-Z]+\}\}/);
  });

  it("appends application questions into job context", async () => {
    const variables = buildAtsSubstitutionVariables(profileData, {
      jobDescription: "Base JD",
      questions: "Are you authorized to work in the US?",
    });
    const instructionTemplate = await readAtsPromptTemplate("default");
    const { prompt } = composeAtsPrompt({ variables, instructionTemplate });

    assert.match(prompt, /Employer \/ application questions/);
    assert.match(prompt, /Are you authorized to work in the US\?/);
  });

  it("OUTPUT example JSON has one experience entry per profile role", async () => {
    const variables = buildAtsSubstitutionVariables(profileData, {
      jobDescription: "React role",
    });
    const instructionTemplate = await readAtsPromptTemplate("default");
    const { blocks, unreplaced } = composeAtsPrompt({ variables, instructionTemplate });

    assert.equal(unreplaced.length, 0);
    assert.match(blocks.output, /Exactly 2 experience objects/);
    assert.match(blocks.instructions, /CAREER-ALIGNED WRITING RULES/);
  });
});
