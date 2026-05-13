/** Sample resume data for template previews when no valid pasted JSON exists. */
export const getPreviewMockData = () => ({
  name: "John Smith",
  title: "Senior Software Engineer",
  email: "john.smith@example.com",
  phone: null,
  location: "San Francisco, CA 94102",
  linkedin: null,
  website: null,
  summary:
    "Senior Software Engineer with 8+ years building scalable web applications and cloud infrastructure. Expertise in <strong>React.js</strong>, <strong>Node.js</strong>, and <strong>AWS</strong> with proven track record delivering high-performance solutions for enterprise clients. Proficient in microservices architecture, containerization, and CI/CD pipelines. Collaborative problem-solver with experience leading cross-functional teams in fast-paced startup environments. Strong focus on code quality, system reliability, and delivering production-ready solutions.",
  skills: {
    Frontend: ["React.js", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Redux", "Vue.js", "HTML5", "CSS3"],
    Backend: ["Node.js", "Express.js", "Python", "Django", "FastAPI", "GraphQL", "REST APIs"],
    Databases: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch"],
    "Cloud & Infrastructure": ["AWS (Lambda, S3, EC2, RDS, CloudFront)", "Docker", "Kubernetes", "Terraform"],
    "DevOps & CI/CD": ["GitLab CI/CD", "GitHub Actions", "Jenkins", "Datadog", "Prometheus"],
    Testing: ["Jest", "Cypress", "Playwright", "React Testing Library"],
    Tools: ["Git", "Webpack", "Vite", "Figma", "Jira"],
  },
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      start_date: "Jan 2021",
      end_date: "Present",
      details: [
        "Architected and developed <strong>microservices platform</strong> using <strong>Node.js</strong> and <strong>React.js</strong>, serving 2M+ users with 99.9% uptime and reducing API response time by 40%",
        "Led migration to <strong>AWS cloud infrastructure</strong> using <strong>Docker</strong> and <strong>Kubernetes</strong>, reducing infrastructure costs by 35% and improving deployment speed by 60%",
        "Implemented <strong>CI/CD pipelines</strong> with <strong>GitHub Actions</strong> and <strong>Jenkins</strong>, automating testing and deployment processes for 15+ services",
        "Designed and built <strong>RESTful APIs</strong> and <strong>GraphQL</strong> endpoints, processing 10M+ requests daily with sub-100ms latency",
        "Optimized database queries and implemented caching strategies using <strong>Redis</strong>, improving application performance by 50%",
        "Collaborated with cross-functional teams to deliver features on time, following <strong>Agile</strong> methodologies and best practices",
      ],
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      start_date: "Mar 2019",
      end_date: "Dec 2020",
      details: [
        "Developed full-stack web applications using <strong>React.js</strong>, <strong>Node.js</strong>, and <strong>PostgreSQL</strong>, supporting 500K+ active users",
        "Built responsive user interfaces with <strong>TypeScript</strong> and <strong>Tailwind CSS</strong>, improving user engagement by 25%",
        "Implemented real-time features using <strong>WebSockets</strong> and <strong>Redis</strong> pub/sub, enabling instant notifications for 100K+ concurrent users",
        "Created automated test suites with <strong>Jest</strong> and <strong>Cypress</strong>, achieving 85% code coverage and reducing bugs by 30%",
        "Deployed applications to <strong>AWS</strong> using <strong>Docker</strong> containers, ensuring scalable and reliable infrastructure",
      ],
    },
    {
      title: "Junior Software Engineer",
      company: "WebDev Solutions",
      location: "San Francisco, CA",
      start_date: "Jun 2017",
      end_date: "Feb 2019",
      details: [
        "Developed and maintained web applications using <strong>JavaScript</strong>, <strong>Python</strong>, and <strong>MySQL</strong>",
        "Collaborated with senior engineers to implement new features and fix bugs, following code review best practices",
        "Participated in <strong>Agile</strong> sprints and daily standups, contributing to team velocity and project delivery",
        "Wrote unit and integration tests, improving code quality and reducing production issues",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      start_year: "2013",
      end_year: "2017",
      grade: "3.8",
    },
  ],
});

/** Overlay profile contact onto mock data for a slightly personalized sample preview. */
export const getPreviewMockDataForProfile = (profileData) => {
  const mock = getPreviewMockData();
  if (!profileData) return mock;
  if (profileData.name) mock.name = profileData.name;
  if (profileData.email) mock.email = profileData.email;
  if (profileData.location) mock.location = profileData.location;
  if (profileData.title) mock.title = profileData.title;
  if (profileData.education?.length) mock.education = profileData.education;
  return mock;
};
