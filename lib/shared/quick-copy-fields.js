import { getProfileLastTitle } from "../profile-format.js";
import { QUICK_COPY_ICONS, quickCopyIconSrc } from "./quick-copy-icons.js";

function fieldIcon(key) {
  const entry = QUICK_COPY_ICONS[key];
  if (!entry) return {};
  return {
    iconKey: key,
    iconUrl: entry.src ? quickCopyIconSrc(entry.src) : null,
    iconRender: entry.render || "img",
    icon: entry.emoji,
  };
}

/** Build quick-copy field list from profile JSON + optional Drive folder id. */
export function buildQuickCopyFields(profileData, gdriveFolderId = null) {
  if (!profileData) return [];

  const lastCompany = profileData.experience?.[0]?.company || null;
  const lastRole = getProfileLastTitle(profileData);
  const driveFolderLink = gdriveFolderId ? `https://drive.google.com/drive/folders/${gdriveFolderId}` : null;

  return [
    { key: "email", label: "Email", value: profileData.email, ...fieldIcon("email") },
    { key: "phone", label: "Phone", value: profileData.phone, ...fieldIcon("phone") },
    { key: "location", label: "Location", value: profileData.location, ...fieldIcon("location") },
    { key: "address", label: "Address", value: profileData.address, ...fieldIcon("address") },
    { key: "postalCode", label: "Postal Code", value: profileData.postalCode, icon: "✉️" },
    { key: "lastCompany", label: "Last Company", value: lastCompany, icon: "🏢" },
    { key: "lastRole", label: "Last Role", value: lastRole, ...fieldIcon("lastRole") },
    { key: "linkedin", label: "LinkedIn", value: profileData.linkedin, ...fieldIcon("linkedin") },
    { key: "github", label: "GitHub", value: profileData.github, ...fieldIcon("github") },
    { key: "website",label: "Website",value: profileData.website,...fieldIcon("website"),openInNewTab: true,},
    { key: "portfolio", label: "Portfolio", value: profileData.portfolio, ...fieldIcon("portfolio"), openInNewTab: true,},
    // ...(driveFolderLink? [{key: "driveLink",label: "Google Drive",value: driveFolderLink,...fieldIcon("driveLink"),alwaysShow: true,openInNewTab: true,},]: []),
  ].filter((field) => field.value || field.alwaysShow);
}
