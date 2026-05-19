/** Include in API POST bodies when a temporary local profile override is active. */
export function profileOverrideForApi(profileData, hasProfileOverride) {
  if (!hasProfileOverride || !profileData) return {};
  return { profileOverride: profileData };
}
