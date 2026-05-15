import { getProfileLastTitle } from "../profile-format.js";

/** Build quick-copy field list from profile JSON + optional Drive folder id. */
export function buildQuickCopyFields(profileData, gdriveFolderId = null) {
  if (!profileData) return [];

  const lastCompany = profileData.experience?.[0]?.company || null;
  const lastRole = getProfileLastTitle(profileData);
  const driveFolderLink = gdriveFolderId ? `https://drive.google.com/drive/folders/${gdriveFolderId}` : null;

  return [
    { key: "email", label: "Email", value: profileData.email, iconUrl: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
    { key: "phone", label: "Phone", value: profileData.phone, iconUrl: "https://img.icons8.com/color/96/iphone-x.png" },
    { key: "location", label: "Location", value: profileData.location, iconUrl: "https://img.icons8.com/color/96/google-maps-new.png" },
    { key: "address", label: "Address", value: profileData.address, iconUrl: "https://img.icons8.com/color/96/home.png" },
    { key: "postalCode", label: "Postal Code", value: profileData.postalCode, icon: "✉️" },
    { key: "lastCompany", label: "Last Company", value: lastCompany, icon: "🏢" },
    { key: "lastRole", label: "Last Role", value: lastRole, iconUrl: "https://img.icons8.com/color/96/employee-card.png" },
    { key: "linkedin", label: "LinkedIn", value: profileData.linkedin, iconUrl: "https://www.linkedin.com/favicon.ico" },
    { key: "github", label: "GitHub", value: profileData.github, iconUrl: "https://github.com/favicon.ico" },
    ...(driveFolderLink
      ? [
          {
            key: "driveLink",
            label: "Google Drive",
            value: driveFolderLink,
            iconUrl: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
            alwaysShow: true,
          },
        ]
      : []),
  ].filter((field) => field.value || field.alwaysShow);
}
