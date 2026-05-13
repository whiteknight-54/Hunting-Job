import { SECOND_PROMPT_CATALOG } from "../../lib/second-prompts-registry";
import { methodNotAllowed } from "../../lib/api-response";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  res.status(200).json({ prompts: SECOND_PROMPT_CATALOG });
}
