export const profileTemplateMapping = {
    "p1": {
        profileFile: "profile-1",
        template: "Resume-Creative-Burgundy",
        prompt: "prompt-1"
    },
  
    "p2": {
        profileFile: "profile-2",
        template: "Resume-Corporate-Slate",
        prompt: "prompt-2",
    },
    "temp":{
        profileFile: "temp",
        template: "Resume-Corporate-Slate",
        prompt: "_temp.txt",
    }
    ,
    // BRAZIL
    "lm": {
        resume: "Lucas_Moura",
        template: "Resume-Creative-Burgundy",
        prompt: "prompt-1"
    },
    "bc": {
        resume: "Bruno_Camara",
        template: "Resume-Modern-Green",
        prompt: "prompt-1"
    },
    "rs":{
        resume : "Roberto_Saraiva",
        template : "Resume-Corporate-Slate",
        prompt: "prompt-1"
    },
    "jf":{
        resume : "Joao_Franco",
        template : "Resume-Classic-Charcoal",
        prompt: "prompt-1"
    },
    // MEXICO
    "rm": {
        resume: "Rafael_Miranda",
        template: "Resume-Bold-Emerald",
        prompt: "prompt-1"
    },
    // ARGENTINA
    "la": {
        resume: "Lucas_Peralta",
        template: "Resume-Academic-Purple",
        prompt: "prompt-1"
    },
    // SPAIN
    "jm": {
        resume: "Jose_Martin",
        template: "Resume-Classic-Charcoal",
        prompt: "prompt-1"
    },
    //  BULGARIA
    "bv": {
        resume: "Boris_Varbanov",
        template: "Resume-Tech-Teal",
        prompt: "prompt-1"
    },
    // POLAND
    "ip": {
        resume: "Igor_Paszewski",
        template: "Resume-Vision-Midnight",
        prompt: "prompt-1"
    },
    "mc": {
        resume: "Maciej_Chmiel",
        template: "Resume-Consultant-Steel",
        prompt: "prompt-1"
    },
    "al": {
        resume: "Artur_LIS",
        template: "Resume-Modern-Green",
        prompt: "prompt-1"
    },
    "ah": {
        resume: "Andrii_Hrynikha",
        template: "Resume-Tech-Teal",
        prompt: "prompt-1"
    },
    "rb":{
        resume : "Robert_Bednarek",
        template : "Resume-Vision-Sage",
        prompt: "prompt-1"
    },
    "pv": {
        resume: "Pavlo_Vorchylo",
        template: "Resume-Executive-Navy",
        prompt: "prompt-1"
    },
    "fm": {
        resume: "Filip_Malinowski",
        template: "Resume-Academic-Purple",
        prompt: "prompt-1"
    },
    //Ukraine
    "ih": {
        resume: "Ihor_Pastushenko",
        template: "Resume-Creative-Burgundy",
        prompt: "prompt-1"
    },
    

    // USA    
    "dp":{
        resume : "Dean_Peters",
        template : "Resume-Classic-Charcoal",
        prompt: "prompt-1"
    },
   "je":{
        resume : "James_Elefante",
        template : "Resume-Consultant-Steel",
        prompt: "prompt-1"
    },
    // PHILIPPINES
    "sr": {
        resume: "Santiago_Reyes",
        template: "",
        prompt: "prompt-1"
    },
    "jrev": {
        resume: "Jason_Revilla",
        template: "Resume-Vision-Sage",
        prompt: "prompt-1"
    },
    "kt": {
        resume: "Kevin_Tolentino",
        template: "Resume-Vision-Coral",
        prompt: "prompt-1"
    },
    "ro": {
        resume: "Rodelio_Escueta",
        template: "Resume",
        prompt: "prompt-1"
    },
    "nt": {
        resume: "Noel_Talastas",
        template: "Resume-Tech-Teal",
        prompt: "prompt-1"
    },
    "ab": {
        resume: "Arvin_Bautista",
        template: "Resume-Modern-Green",
        prompt: "prompt-1"
    },
    "jo": {
        resume: "Jomar_Reyes",
        template: "Resume-Corporate-Slate",
        prompt: "prompt-1"
    },
    "hd": {
        resume: "Hans_Dela_Cruz",
        template: "Resume-Classic-Charcoal",
        prompt: "prompt-1"
    },

    // "cc": {
    //     resume: "Christian_Carrasco",
    //     template: "Resume-Corporate-Slate",
    //     prompt: "prompt-1"
    // },
    // "kg": {
    //     resume: "Kyle_Garcia",
    //     template: "Resume-Consultant-Steel",
    //     prompt: "prompt-1"
    // },
    
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

/** JSON file basename under profiles/ — supports legacy `resume` field. */
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
    return config?.prompt || "default";
};

export default profileTemplateMapping;

