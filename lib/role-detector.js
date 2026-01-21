/**
 * Role Detection Utility
 * Analyzes job descriptions to determine the primary role/field
 * Returns the most appropriate prompt template name
 */

// Pre-compile regex patterns for performance
const compilePatterns = (keywords) => {
  return keywords.map(keyword => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'gi');
  });
};

// Role keywords and patterns for detection
const ROLE_PATTERNS = {
  'frontend': {
    keywords: [
      'frontend', 'front-end', 'front end', 'ui engineer', 'ui developer',
      'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css',
      'user interface', 'client-side', 'browser', 'spa', 'single page',
      'ui/ux', 'user experience', 'responsive design', 'web design'
    ],
    weight: 1.0
  },
  'backend': {
    keywords: [
      'backend', 'back-end', 'back end', 'server-side', 'api', 'rest api',
      'graphql', 'microservices', 'node.js', 'python', 'java', 'go', 'rust',
      'database', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'server', 'api development', 'backend engineer', 'server engineer'
    ],
    weight: 1.0
  },
  'fullstack': {
    keywords: [
      'fullstack', 'full-stack', 'full stack', 'full stack engineer',
      'end-to-end', 'end to end', 'full cycle', 'full lifecycle'
    ],
    weight: 1.2 // Higher weight - if both frontend and backend keywords present
  },
  'devops': {
    keywords: [
      'devops', 'dev ops', 'sre', 'site reliability', 'infrastructure',
      'ci/cd', 'continuous integration', 'continuous deployment', 'jenkins',
      'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'aws', 'azure',
      'gcp', 'cloud infrastructure', 'deployment', 'automation', 'monitoring',
      'prometheus', 'grafana', 'datadog', 'cloudformation'
    ],
    weight: 1.0
  },
  'data-science': {
    keywords: [
      'data scientist', 'data science', 'machine learning', 'ml engineer',
      'data engineer', 'data analyst', 'analytics', 'python', 'pandas', 'numpy',
      'scikit-learn', 'tensorflow', 'pytorch', 'jupyter', 'sql', 'data pipeline',
      'etl', 'big data', 'hadoop', 'spark', 'data warehouse', 'data lake',
      'statistical', 'modeling', 'ai', 'artificial intelligence'
    ],
    weight: 1.0
  },
  'mobile': {
    keywords: [
      'mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin',
      'mobile app', 'mobile developer', 'app development', 'native app',
      'cross-platform', 'xamarin', 'ionic'
    ],
    weight: 1.0
  },
  'qa': {
    keywords: [
      'qa', 'quality assurance', 'test engineer', 'testing', 'automation',
      'selenium', 'cypress', 'jest', 'test automation', 'qa engineer',
      'quality engineer', 'test automation engineer', 'sdet'
    ],
    weight: 1.0
  },
  'security': {
    keywords: [
      'security engineer', 'cybersecurity', 'security', 'penetration testing',
      'vulnerability', 'security analyst', 'infosec', 'information security',
      'security architect', 'compliance', 'soc 2', 'iso 27001', 'gdpr'
    ],
    weight: 1.0
  },
  'product-manager': {
    keywords: [
      'product manager', 'product management', 'pm', 'product owner', 'po',
      'product strategy', 'roadmap', 'stakeholder', 'agile', 'scrum master'
    ],
    weight: 1.0
  },
  'salesforce': {
    keywords: [
      'salesforce', 'sfdc', 'salesforce developer', 'salesforce admin', 'salesforce consultant',
      'apex', 'visualforce', 'lightning', 'sales cloud', 'service cloud', 'marketing cloud',
      'salesforce platform', 'salesforce architect', 'crm', 'customer relationship management',
      'salesforce.com', 'force.com', 'lwc', 'lightning web components', 'aura', 'flows',
      'salesforce cpq', 'salesforce commerce cloud', 'salesforce integration'
    ],
    weight: 1.2 // Higher weight for specialized roles
  },
  'sap': {
    keywords: [
      'sap', 'sap consultant', 'sap developer', 'sap analyst', 'sap architect',
      'sap erp', 'sap hana', 'sap fico', 'sap mm', 'sap sd', 'sap pp', 'sap hr',
      'sap abap', 'sap basis', 'sap bw', 'sap bi', 'sap ecc', 'sap s/4hana',
      'sap successfactors', 'sap ariba', 'sap hybris', 'sap crm', 'sap pi', 'sap po',
      'sap integration', 'sap implementation', 'sap migration'
    ],
    weight: 1.2 // Higher weight for specialized roles
  },
  'default': {
    keywords: [],
    weight: 0.5 // Fallback weight
  }
};

// Pre-compile all regex patterns once at module load
const COMPILED_PATTERNS = {};
for (const [role, config] of Object.entries(ROLE_PATTERNS)) {
  if (role !== 'default' && config.keywords.length > 0) {
    COMPILED_PATTERNS[role] = {
      patterns: compilePatterns(config.keywords),
      weight: config.weight
    };
  }
}

/**
 * Detect the primary role/field from a job description
 * @param {string} jobDescription - The job description text
 * @param {string} roleName - The role name/title (optional, helps with detection)
 * @returns {string} - The detected role key (e.g., 'frontend', 'backend', 'fullstack')
 */
export function detectRole(jobDescription, roleName = '') {
  if (!jobDescription) {
    return 'default';
  }

  // Cache lowercase conversion
  const text = (jobDescription + ' ' + roleName).toLowerCase();
  const scores = {};

  // Calculate scores using pre-compiled patterns
  for (const [role, compiled] of Object.entries(COMPILED_PATTERNS)) {
    let score = 0;
    for (const pattern of compiled.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }
    scores[role] = score * compiled.weight;
  }

  // Special handling for fullstack
  // If both frontend and backend have significant scores, boost fullstack
  if (scores['frontend'] > 2 && scores['backend'] > 2) {
    scores['fullstack'] = (scores['fullstack'] || 0) + (scores['frontend'] + scores['backend']) * 0.3;
  }

  // Find the role with highest score
  let maxScore = 0;
  let detectedRole = 'default';

  for (const [role, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedRole = role;
    }
  }

  // If no clear winner (score too low), use default
  if (maxScore < 2) {
    return 'default';
  }

  return detectedRole;
}

/**
 * Get the prompt template name for a detected role
 * @param {string} role - The detected role key
 * @returns {string} - The prompt template filename (without .txt extension)
 */
export function getPromptForRole(role) {
  // Map role keys to prompt template names
  const roleToPrompt = {
    'frontend': 'frontend',
    'backend': 'backend',
    'fullstack': 'fullstack',
    'devops': 'devops',
    'data-science': 'data-science',
    'mobile': 'mobile',
    'qa': 'qa',
    'security': 'security',
    'product-manager': 'product-manager',
    'salesforce': 'salesforce',
    'sap': 'sap',
    'default': 'default'
  };

  return roleToPrompt[role] || 'default';
}

/**
 * Get all available role keys
 * @returns {string[]} - Array of available role keys
 */
export function getAvailableRoles() {
  return Object.keys(ROLE_PATTERNS).filter(role => role !== 'default');
}

export default {
  detectRole,
  getPromptForRole,
  getAvailableRoles
};
