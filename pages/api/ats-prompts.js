import { listAtsPromptTemplateIds } from "../../lib/ats-prompts";
import { methodNotAllowed, serverError } from "../../lib/api-response";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  try {
    const prompts = await listAtsPromptTemplateIds();
    res.status(200).json({ prompts });
  } catch (e) {
    console.error(e);
    return serverError(res, "Failed to list ATS prompts");
  }
}
