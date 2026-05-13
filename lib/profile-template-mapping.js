// Profile to Template mapping
// Maps slug → profiles/{profileFile}.json, template id, ATS prompt id
export const profileTemplateMapping = {
    // BRAZIL
    "lm": {
        profileFile: "Lucas_Moura",
        template: "Resume-Creative-Burgundy",
        prompt: "default"
    },
    "bc": {
        profileFile: "Bruno_Camara",
        template: "Resume-Modern-Green",
        prompt: "default"
    },
    "rs":{
        profileFile : "Roberto_Saraiva",
        template : "Resume-Corporate-Slate",
        prompt: "default"
    },
    "jf":{
        profileFile : "Joao_Franco",
        template : "Resume-Classic-Charcoal",
        prompt: "final"
    },
    // MEXICO
    "rm": {
        profileFile: "Rafael_Miranda",
        template: "Resume-Bold-Emerald",
        prompt: "default"
    },
    // ARGENTINA
    "la": {
        profileFile: "Lucas_Peralta",
        template: "Resume-Academic-Purple",
        prompt: "default",
    },
    // SPAIN
    "jm": {
        profileFile: "Jose_Martin",
        template: "Resume-Classic-Charcoal",
        prompt: "default2"
    },
    //  BULGARIA
    "bv": {
        profileFile: "Boris_Varbanov",
        template: "Resume-Tech-Teal",
        prompt: "default"
    },
    // POLAND
    "ip": {
        profileFile: "Igor_Paszewski",
        template: "Resume-Vision-Midnight",
        prompt: "default",
    },
    "mc": {
        profileFile: "Maciej_Chmiel",
        template: "Resume-Consultant-Steel",
        prompt: "default",
    },
    "al": {
        profileFile: "Artur_LIS",
        template: "Resume-Modern-Green",
        prompt: "default4"
    },
    "ah": {
        profileFile: "Andrii_Hrynikha",
        template: "Resume-Tech-Teal",
        prompt: "default4"
    },
    "rb":{
        profileFile : "Robert_Bednarek",
        template : "Resume-Vision-Sage",
        prompt: "default"
    },
    "pv": {
        profileFile: "Pavlo_Vorchylo",
        template: "Resume-Executive-Navy",
        prompt: "default"
    },
    "fm": {
        profileFile: "Filip_Malinowski",
        template: "Resume-Academic-Purple",
        prompt: "default3",
    },
    //Ukraine
    "ih": {
        profileFile: "Ihor_Pastushenko",
        template: "Resume-Creative-Burgundy",
        prompt: "default4",
    },
    

    // USA    
    "dp":{
        profileFile : "Dean_Peters",
        template : "Resume-Classic-Charcoal",
        prompt: "default"
    },
   "je":{
        profileFile : "James_Elefante",
        template : "Resume-Consultant-Steel",
        prompt: "default4"
    },
    // PHILIPPINES
    "sr": {
        profileFile: "Santiago_Reyes",
        template: "",
        prompt: "default",
    },
    "jrev": {
        profileFile: "Jason_Revilla",
        template: "Resume-Vision-Sage",
        prompt: "default2",
    },
    "kt": {
        profileFile: "Kevin_Tolentino",
        template: "Resume-Vision-Coral",
        prompt: "default",
    },
    "ro": {
        profileFile: "Rodelio_Escueta",
        template: "Resume",
        prompt: "default",
    },
    "nt": {
        profileFile: "Noel_Talastas",
        template: "Resume-Tech-Teal",
        prompt: "default",
    },
    "ab": {
        profileFile: "Arvin_Bautista",
        template: "Resume-Modern-Green",
        prompt: "default",
    },
    "jo": {
        profileFile: "Jomar_Reyes",
        template: "Resume-Corporate-Slate",
        prompt: "default",
    },
    "hd": {
        profileFile: "Hans_Dela_Cruz",
        template: "Resume-Classic-Charcoal",
        prompt: "default",
    },

    // "cc": {
    //     profileFile: "Christian_Carrasco",
    //     template: "Resume-Corporate-Slate",
    //     prompt: "default"
    // },
    // "kg": {
    //     profileFile: "Kyle_Garcia",
    //     template: "Resume-Consultant-Steel",
    //     prompt: "default"
    // },
    
};


/**
 * Get profile configuration by slug (numeric ID)
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {object|null} - Profile configuration or null if not found
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
 * Get template for a profile by slug
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {string} - Template ID or "Resume" as default
 */
export const getTemplateForProfile = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.template || "Resume";
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

/** Alias: ATS prompt selector default comes from mapping `prompt` field. */
export const getAtsPromptForProfile = getPromptForProfile;

/**
 * Get all available slug values (numeric IDs from mapping)
 * @returns {string[]} - Array of available slugs (numeric IDs)
 */
export const getAvailableSlugs = () => {
    return Object.keys(profileTemplateMapping);
};

/**
 * Get profile configuration by profile ID (numeric key)
 * @param {string} profileId - The numeric profile ID
 * @returns {object|null} - Profile configuration or null if not found
 */
export const getProfileById = (profileId) => {
    return profileTemplateMapping[profileId] || null;
};

export default profileTemplateMapping;

