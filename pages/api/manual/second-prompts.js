import { listSecondPromptTemplateIds } from "../../../lib/core/prompts.js";
import { methodNotAllowed, serverError } from "../../../lib/core/api-response.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  try {
    const prompts = await listSecondPromptTemplateIds();
    res.status(200).json({ prompts });
  } catch (e) {
    console.error(e);
    return serverError(res, "Failed to list second prompts");
  }
}
