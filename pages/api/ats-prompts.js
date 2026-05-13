import { listAtsPromptTemplateIds } from "../../lib/ats-prompts";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  try {
    const prompts = await listAtsPromptTemplateIds();
    res.status(200).json({ prompts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list ATS prompts" });
  }
}
