/**
 * Profile-aware writing guidance for ATS prompt instructions.
 * Work history in INPUT is the source of truth; this supplies per-role budgets and chronology rules only.
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
      careerGuidance: "No experience entries — cannot produce experience[] output.",
      seniorityArc: "unknown",
      roleDetailBudget: [],
      chronologyRules: "",
    };
  }

  const ranks = experience.map((j) => inferSeniorityRank(j?.title));
  const detailBudget = buildRoleDetailBudget(experience);
  const budgetLines = experience.map(
    (_, i) =>
      `- experience[${i}] (INPUT role ${i + 1}${i === 0 ? ", most recent" : ""}): ${detailBudget[i]} detail strings`
  );

  const careerGuidance = [
    "WORK-HISTORY WRITING RULES:",
    "- Anchor every OUTPUT experience[i] to the same-index row in INPUT work history.",
    "- Do not invent employers, titles, locations, or date ranges — those are merged server-side from INPUT.",
    "- Tailor wording and emphasis to job context while staying credible for each role's seniority and dates.",
    "- Most recent role should show the strongest JD keyword alignment; older roles show foundational growth.",
    "",
    "Detail-string budget per OUTPUT experience entry:",
    ...budgetLines,
    "",
    "Technology chronology (respect INPUT work-history dates):",
    buildChronologyRules(experience),
  ].join("\n");

  const ascending =
    ranks.length > 1 && ranks[0] >= ranks[ranks.length - 1] ? "ascending or stable seniority" : "mixed seniority";
  const seniorityArc = `${ascending} (${seniorityLabel(ranks[ranks.length - 1])} → ${seniorityLabel(ranks[0])})`;

  return {
    careerGuidance,
    seniorityArc,
    roleDetailBudget: detailBudget,
    chronologyRules: buildChronologyRules(experience),
  };
}
