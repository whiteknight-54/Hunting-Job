/**
 * Application workflows (no auth, no DB).
 *
 * public/data/profiles/*.json — base profile (contact, experience[], education)
 * lib/core/resume.js  — tailored JSON parse, validate, merge for PDF
 *
 * AUTO   /auto/{slug}    → POST /api/auto/generate
 * MANUAL /manual/{slug}  → prompt | preview | generate | second_prompt
 */
export { WORKFLOW, API_ROUTES } from "./constants";
export { useAutoWorkflow } from "./auto/useAutoWorkflow";
export { useManualWorkflow } from "./manual/useManualWorkflow";
