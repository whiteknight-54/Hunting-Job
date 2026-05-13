/**
 * Application workflows (no auth, no DB).
 *
 * profiles/*.json              — base profile (contact, employers, education)
 * tailored-resume (AI output)  — lib/tailored-resume/ (title, summary, skills, bullets)
 *
 * AUTO   /{slug}         → POST /api/generate
 * MANUAL /manual/{slug}  → manual_prompt | manual_generate | manual_second_prompt
 */
export { WORKFLOW, API_ROUTES } from "./constants";
export { useAutoWorkflow } from "./auto/useAutoWorkflow";
export { useManualWorkflow } from "./manual/useManualWorkflow";
