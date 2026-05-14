/**
 * Compose a career-customized ATS prompt from profile + job context + variant instructions.
 * Blocks are built (not statically joined); instructions reference INPUT work history + JD.
 */
import { applyPromptVariables, findUnreplacedPlaceholders } from "./apply-prompt-variables.js";
import {
  buildAtsGlossaryBlock,
  buildAtsInputBlock,
  buildAtsOutputBlock,
} from "./tailored-resume/ats-prompt-blocks.js";

const PROMPT_SECTION_SEPARATOR = "\n\n";

/**
 * @param {{
 *   variables: Record<string, string | number>,
 *   instructionTemplate: string,
 * }} params
 * @returns {{ prompt: string, blocks: { input: string, glossary: string, instructions: string, output: string }, unreplaced: string[] }}
 */
export function composeAtsPrompt({ variables, instructionTemplate }) {
  const inputBlock = buildAtsInputBlock(variables);
  const glossaryBlock = buildAtsGlossaryBlock(variables);
  const instructions = applyPromptVariables(instructionTemplate, variables);
  const outputBlock = buildAtsOutputBlock(variables);

  const unreplaced = [
    ...findUnreplacedPlaceholders(inputBlock),
    ...findUnreplacedPlaceholders(glossaryBlock),
    ...findUnreplacedPlaceholders(instructions),
    ...findUnreplacedPlaceholders(outputBlock),
  ];

  const prompt = [inputBlock, glossaryBlock, instructions, outputBlock].join(PROMPT_SECTION_SEPARATOR);

  return {
    prompt,
    blocks: { input: inputBlock, glossary: glossaryBlock, instructions, output: outputBlock },
    unreplaced: [...new Set(unreplaced)],
  };
}
