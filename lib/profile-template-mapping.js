// Profile to Template mapping
// Maps profile ID (filename without .json) to template ID and optional prompt file
export const profileTemplateMapping = {
    "bv": {
        resume: "Boris_Varbanov",
        template: "Resume-Tech-Teal",
        prompt: "default"
    },
    "bc": {
        resume: "Bruno_Camara",
        template: "Resume-Modern-Green",
        prompt: "default"
    },
    "cc": {
        resume: "Christian_Carrasco",
        template: "Resume-Corporate-Slate",
        prompt: "default"
    },
    "jm": {
        resume: "Jose_Martin",
        template: "Resume-Classic-Charcoal",
        prompt: "default"
    },
    "kg": {
        resume: "Kyle_Garcia",
        template: "Resume-Consultant-Steel",
        prompt: "default"
    },
    "lm": {
        resume: "Lucas_Moura",
        template: "Resume-Creative-Burgundy",
        prompt: "default"
    },
    "pv": {
        resume: "Pavlo_Vorchylo",
        template: "Resume-Executive-Navy",
        prompt: "default"
    },
    "rm": {
        resume: "Rafael_Miranda",
        template: "Resume-Bold-Emerald",
        prompt: "default"
    },
    "la": {
        resume: "Lucas_Peralta",
        template: "Resume-Academic-Purple",
        prompt: "default",
    },
    "sr": {
        resume: "Santiago_Reyes",
        template: "Resume-Vision-Midnight",
        prompt: "default",
    },
    "jrev": {
        resume: "Jason_Revilla",
        template: "Resume-Vision-Sage",
        prompt: "default",
    },
    "kt": {
        resume: "Kevin_Tolentino",
        template: "Resume-Vision-Coral",
        prompt: "default",
    },
    "ro": {
        resume: "Rodelio_Escueta",
        template: "Resume",
        prompt: "default",
    },
    "hz": {
        resume: "Harris_Zulkifli",
        template: "Resume-Tech-Teal",
        prompt: "default",
    },
    "ab": {
        resume: "Arvin_Bautista",
        template: "Resume-Modern-Green",
        prompt: "default",
    },
    "jo": {
        resume: "Jomar_Reyes",
        template: "Resume-Corporate-Slate",
        prompt: "default",
    },
    "hd": {
        resume: "Hans_Dela_Cruz",
        template: "Resume-Classic-Charcoal",
        prompt: "default",
    },
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

/**
 * Get resume name (profile name) by slug
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {string|null} - Resume name or null if not found
 */
export const slugToProfileName = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.resume || null;
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
 * Get prompt file name for a profile by slug
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {string} - Prompt file name or "default"
 */
export const getPromptForProfile = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.prompt || "default";
};

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

