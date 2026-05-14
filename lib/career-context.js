/**
 * Profile-aware career path analysis for ATS prompt composition.
 * Converts raw profile experience[] into narrative guidance the model must follow.
 */

const SENIORITY_RANK = {
  intern: 1,
  junior: 2,
  associate: 2,
  entry: 2,
  developer: 3,
  engineer: 3,
  specialist: 3,
  analyst: 3,
  consultant: 3,
  senior: 4,
  lead: 5,
  staff: 6,
  principal: 7,
  architect: 6,
  manager: 5,
  director: 7,
};

function parseStartYear(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  const mmYyyy = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyy) return parseInt(mmYyyy[2], 10);
  const year = s.match(/\b(19|20)\d{2}\b/);
  return year ? parseInt(year[0], 10) : null;
}

function inferSeniorityRank(title) {
  const t = String(title || "").toLowerCase();
  let best = 3;
  for (const [word, rank] of Object.entries(SENIORITY_RANK)) {
    if (t.includes(word)) best = Math.max(best, rank);
  }
  return best;
}

function seniorityLabel(rank) {
  if (rank >= 7) return "principal/staff";
  if (rank >= 5) return "lead";
  if (rank >= 4) return "senior";
  if (rank >= 3) return "mid-level";
  return "junior/entry";
}

/** Detail-string budget per role index (0 = most recent). */
export function buildRoleDetailBudget(experience) {
  const n = (experience || []).length;
  if (!n) return [];
  return experience.map((_, i) => {
    if (i === 0) return "7–8";
    if (i === 1) return "6–8";
    return "4–5";
  });
}

function buildChronologyRules(experience) {
  return (experience || [])
    .map((job, i) => {
      const range = `${job?.start_date || "N/A"} – ${job?.end_date || "N/A"}`;
      const startYear = parseStartYear(job?.start_date);
      const era =
        startYear == null
          ? "use historically plausible stacks only"
          : startYear < 2013
            ? "pre-modern cloud era — avoid React 16+, Kubernetes, serverless unless end date supports it"
            : startYear < 2016
              ? "early modern web — React/Angular 2+ plausible; avoid very recent AI/LLM tooling"
              : startYear < 2020
                ? "cloud-native era — containers, CI/CD, mainstream SPA frameworks plausible"
                : "current era — modern cloud, observability, and mainstream stacks plausible";
      return `  experience[${i}] ↔ INPUT role ${i + 1} (${range}): ${era}`;
    })
    .join("\n");
}

/**
 * @returns {{
 *   careerPath: string,
 *   careerGuidance: string,
 *   seniorityArc: string,
 *   roleDetailBudget: string[],
 *   chronologyRules: string,
 * }}
 */
export function buildCareerContext(profileData) {
  const experience = profileData?.experience || [];
  const n = experience.length;

  if (!n) {
    return {
      careerPath: "(no work history in profile)",
      careerGuidance: "No experience entries — cannot produce experience[] output.",
      seniorityArc: "unknown",
      roleDetailBudget: [],
      chronologyRules: "",
    };
  }

  const ranks = experience.map((j) => inferSeniorityRank(j?.title));
  const oldestFirst = [...experience].reverse();
  const progressionLine = oldestFirst
    .map((j) => `${j?.title || "Role"} @ ${j?.company || "Company"}`)
    .join(" → ");

  const careerPathLines = experience.map((job, i) => {
    const rank = ranks[i];
    return [
      `Role ${i + 1} (OUTPUT experience[${i}])`,
      `  Employer: ${job?.company || "Unknown"} | ${job?.title || "Unknown"} | ${job?.location || ""}`.trim(),
      `  Period: ${job?.start_date || "N/A"} – ${job?.end_date || "N/A"}`,
      `  Seniority band: ${seniorityLabel(rank)}`,
    ].join("\n");
  });

  const detailBudget = buildRoleDetailBudget(experience);
  const budgetLines = experience.map(
    (_, i) =>
      `- experience[${i}] (INPUT role ${i + 1}${i === 0 ? ", most recent" : ""}): ${detailBudget[i]} detail strings`
  );

  const careerPath = [
    "CAREER PATH (derived from profile — every OUTPUT experience[i] maps 1:1 to INPUT role i+1):",
    "",
    careerPathLines.join("\n\n"),
    "",
    `Progression arc (oldest → newest): ${progressionLine}`,
  ].join("\n");

  const careerGuidance = [
    "CAREER-ALIGNED WRITING RULES:",
    "- Do not invent employers, titles, locations, or date ranges — those are merged server-side from INPUT.",
    "- Tailor wording and emphasis to job context while staying credible for each role's seniority band and era.",
    "- Most recent role should show the strongest JD keyword alignment; older roles show foundational growth.",
    "- Each role must feel more capable than the previous without repeating the same accomplishments.",
    "",
    "Detail-string budget per OUTPUT experience entry:",
    ...budgetLines,
    "",
    "Technology chronology (respect INPUT dates):",
    buildChronologyRules(experience),
  ].join("\n");

  const ascending =
    ranks.length > 1 && ranks[0] >= ranks[ranks.length - 1] ? "ascending or stable seniority" : "mixed seniority";
  const seniorityArc = `${ascending} (${seniorityLabel(ranks[ranks.length - 1])} → ${seniorityLabel(ranks[0])})`;

  return {
    careerPath,
    careerGuidance,
    seniorityArc,
    roleDetailBudget: detailBudget,
    chronologyRules: buildChronologyRules(experience),
  };
}
