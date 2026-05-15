import { mergeForPdf } from "./core/resume.js";

export function getPreviewMockDataForProfile(profile) {
  const sampleTailored = {
    title: "Senior Software Engineer | React | TypeScript",
    summary: "Experienced engineer with a track record of delivering scalable products.",
    skills: {
      Frontend: ["React", "TypeScript"],
      Backend: ["Node.js", "AWS"],
    },
    experience: (profile?.experience || []).map(() => ({
      details: [
        "Delivered high-impact features aligned with business goals.",
        "Collaborated across teams to improve quality and velocity.",
      ],
    })),
  };
  return mergeForPdf(profile || {}, sampleTailored);
}

/** @deprecated use getPreviewMockDataForProfile */
export function getPreviewMockData(profile) {
  return getPreviewMockDataForProfile(profile);
}
