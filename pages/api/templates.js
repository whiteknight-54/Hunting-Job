import { listTemplateCatalog } from "../../lib/pdf-templates/catalog.js";
import { setStaticListCacheHeaders } from "../../lib/core/http-cache.js";
import { methodNotAllowed, serverError } from "../../lib/core/api-response.js";
import { guardApi } from "../../lib/core/guard-api.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!(await guardApi(req, res))) return;
  try {
    setStaticListCacheHeaders(res);
    return res.status(200).json(listTemplateCatalog());
  } catch (e) {
    console.error(e);
    return serverError(res, "Failed to list templates");
  }
}
