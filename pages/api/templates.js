import { listTemplateCatalog } from "../../lib/pdf-templates";
import { methodNotAllowed, serverError } from "../../lib/api-response";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    res.status(200).json(listTemplateCatalog());
  } catch (error) {
    console.error("Error loading templates:", error);
    return serverError(res, "Failed to load templates");
  }
}
