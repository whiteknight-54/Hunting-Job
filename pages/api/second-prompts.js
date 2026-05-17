import { listSecondPromptTemplateIds } from "../../lib/core/prompts.js";
import { methodNotAllowed, serverError } from "../../lib/core/api-response.js";
import { guardApi } from "../../lib/core/guard-api.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (!(await guardApi(req, res))) return;
  try {
    const prompts = await listSecondPromptTemplateIds();
    res.status(200).json({ prompts });
  } catch (e) {
    console.error(e);
    return serverError(res, "Failed to list second prompts");
  }
}
