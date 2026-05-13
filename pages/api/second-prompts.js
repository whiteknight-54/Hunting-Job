import { SECOND_PROMPT_CATALOG } from "../../lib/second-prompts-registry";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  res.status(200).json({ prompts: SECOND_PROMPT_CATALOG });
}
