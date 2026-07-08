export const profileTemplateMapping = {
  p1: {
    profileFile: "profile-1",
    template: "Resume-Creative-Burgundy",
    prompt: "prompt-1",
  },
  p2: {
    profileFile: "profile-2",
    template: "Resume-Corporate-Slate",
    prompt: "prompt-2",
  },
  /** Dev / smoke-test slug — uses ATS file `_temp.txt` (basename `_temp`, not listed in UI catalog). */
  temp: {
    profileFile: "temp",
    template: "Resume-Corporate-Slate",
    prompt: "_temp",
  },
  // BRAZIL
  lm: {
    profileFile: "Lucas_Moura",
    template: "Resume-Creative-Burgundy",
    prompt: "prompt-1",
  },
  bc: {
    profileFile: "Bruno_Camara",
    template: "Resume-Modern-Green",
    prompt: "prompt-1",
  },
  an: {
    profileFile: "Artur_Nowak",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  jn: {
    profileFile: "Jakub_Nowak",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  rs: {
    profileFile: "Roberto_Saraiva",
    template: "Resume-Corporate-Slate",
    prompt: "prompt-1",
  },
  jf: {
    profileFile: "Joao_Franco",
    template: "Resume-Classic-Charcoal",
    prompt: "prompt-1",
  },
  ew: {
    profileFile: "Eduardo_Wotzik",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  // MEXICO
  rm: {
    profileFile: "Rafael_Miranda",
    template: "Resume-Bold-Emerald",
    prompt: "prompt-1",
  },
  // ARGENTINA
  la: {
    profileFile: "Lucas_Peralta",
    template: "Resume-Academic-Purple",
    prompt: "prompt-1",
  },
  // SPAIN
  jm: {
    profileFile: "Jose_Martin",
    template: "Resume-Classic-Charcoal",
    prompt: "prompt-1",
  },
  // BULGARIA
  bv: {
    profileFile: "Boris_Varbanov",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  // POLAND
  ip: {
    profileFile: "Igor_Paszewski",
    template: "Resume-Vision-Midnight",
    prompt: "prompt-1",
  },
  mc: {
    profileFile: "Maciej_Chmiel",
    template: "Resume-Consultant-Steel",
    prompt: "prompt-1",
  },
  al: {
    profileFile: "Artur_LIS",
    template: "Resume-Modern-Green",
    prompt: "prompt-1",
  },
  ah: {
    profileFile: "Andrii_Hrynikha",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  rb: {
    profileFile: "Robert_Bednarek",
    template: "Resume-Vision-Sage",
    prompt: "prompt-1",
  },
  pv: {
    profileFile: "Pavlo_Vorchylo",
    template: "Resume-Executive-Navy",
    prompt: "prompt-1",
  },
  fm: {
    profileFile: "Filip_Malinowski",
    template: "Resume-Academic-Purple",
    prompt: "prompt-1",
  },
  tn: {
    profileFile: "Tomasz_Nguyen",
    template: "Resume-Consultant-Steel",
    prompt: "prompt-1",
  },
  vm: {
    profileFile: "Vitialy_Malanich",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  yp: {
    profileFile: "Yuriy_Popovich",
    template: "Resume-Vision-Midnight",
    prompt: "prompt-1",
  },
  // UKRAINE
  ih: {
    profileFile: "Ihor_Pastushenko",
    template: "Resume-Creative-Burgundy",
    prompt: "prompt-1",
  },
  // USA
  dp: {
    profileFile: "Dean_Peters",
    template: "Resume-Classic-Charcoal",
    prompt: "prompt-1",
  },
  je: {
    profileFile: "James_Elefante",
    template: "Resume-Corporate-Slate",
    prompt: "prompt-1",
  },
  wod: {
    profileFile: "William_O_Donnell",
    template: "Resume-Classic-Charcoal",
    prompt: "prompt-1",
  },
    wc: {
    profileFile: "Wiliam_Cheng",
    template: "Resume-Corporate-Slate",
    prompt: "prompt-1",
  },
    cm: {
    profileFile: "Cody_McClain",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
    jer: {
    profileFile: "Jeremy_Rufino",
    template: "Resume-Vision-Sage",
    prompt: "prompt-1",
  },

  // PHILIPPINES
  sr: {
    profileFile: "Santiago_Reyes",
    template: "Resume",
    prompt: "prompt-1",
  },
  jrev: {
    profileFile: "Jason_Revilla",
    template: "Resume-Vision-Sage",
    prompt: "prompt-1",
  },
  kt: {
    profileFile: "Kevin_Tolentino",
    template: "Resume-Vision-Coral",
    prompt: "prompt-1",
  },
  ro: {
    profileFile: "Rodelio_Escueta",
    template: "Resume",
    prompt: "prompt-1",
  },
  nt: {
    profileFile: "Noel_Talastas",
    template: "Resume-Tech-Teal",
    prompt: "prompt-1",
  },
  ab: {
    profileFile: "Arvin_Bautista",
    template: "Resume-Modern-Green",
    prompt: "prompt-1",
  },
  jo: {
    profileFile: "Jomar_Reyes",
    template: "Resume-Corporate-Slate",
    prompt: "prompt-1",
  },
  jph: {
    profileFile: "Jose_M",
    template: "Resume-Classic-Charcoal",
    prompt: "prompt-1",
  },


};

/**
 * Get profile configuration by slug (e.g. "jf").
 * @param {string} slug
 * @returns {object|null}
 */
export const getProfileBySlug = (slug) => {
  if (!slug) return null;
  return profileTemplateMapping[slug] || null;
};

/** JSON file basename under public/data/profiles/ — supports legacy `resume` field. */
export const getProfileFileBasename = (config) => {
  if (!config) return null;
  return config.profileFile || config.resume || null;
};

/**
 * Get profile JSON file basename by slug
 * @param {string} slug - Profile key (e.g. "jf")
 * @returns {string|null}
 */
export const slugToProfileName = (slug) => {
  const config = getProfileBySlug(slug);
  return getProfileFileBasename(config);
};

/**
 * Get template for a profile by slug.
 * @param {string} slug
 * @returns {string}
 */
export const getTemplateForProfile = (slug) => {
  const config = getProfileBySlug(slug);
  const mapped = config?.template?.trim();
  return mapped || "Resume";
};

/**
 * Get ATS resume prompt template basename (without .txt) for a profile slug.
 * @param {string} slug - Profile key (e.g. "jf")
 * @returns {string} - Prompt file basename or "default"
 */
export const getPromptForProfile = (slug) => {
  const config = getProfileBySlug(slug);
  const raw = config?.prompt || "default";
  return String(raw).replace(/\.txt$/i, "");
};

export default profileTemplateMapping;
