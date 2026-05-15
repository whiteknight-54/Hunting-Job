import { listTemplateCatalog } from "../../lib/pdf-templates";
import { methodNotAllowed, serverError } from "../../lib/core/api-response.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  try {
    return res.status(200).json(listTemplateCatalog());
  } catch (e) {
    console.error(e);
    return serverError(res, "Failed to list templates");
  }
}
