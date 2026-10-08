// lib/normalization/taxonomy.ts
// 150+ canonical skills with aliases for synonym mapping

export interface SkillEntry {
  canonicalName: string;
  category: "TECHNICAL" | "TOOLS" | "DOMAIN" | "SOFT";
  aliases: string[];
  description?: string;
}

export const SKILL_TAXONOMY: SkillEntry[] = [
  // ── Programming Languages ──────────────────────────────────────────────────
  { canonicalName: "JavaScript", category: "TECHNICAL", aliases: ["js", "javascript", "ecmascript", "es6", "es2015", "vanilla js", "vanilla javascript"] },
  { canonicalName: "TypeScript", category: "TECHNICAL", aliases: ["ts", "typescript"] },
  { canonicalName: "Python", category: "TECHNICAL", aliases: ["python3", "python2", "py", "python programming"] },
  { canonicalName: "Java", category: "TECHNICAL", aliases: ["java programming", "java se", "java ee", "jvm"] },
  { canonicalName: "C++", category: "TECHNICAL", aliases: ["cpp", "c plus plus", "c++11", "c++14", "c++17"] },
  { canonicalName: "C#", category: "TECHNICAL", aliases: ["csharp", "c sharp", "dotnet c#", ".net c#"] },
  { canonicalName: "Go", category: "TECHNICAL", aliases: ["golang", "go lang", "go programming"] },
  { canonicalName: "Rust", category: "TECHNICAL", aliases: ["rust lang", "rust programming"] },
  { canonicalName: "PHP", category: "TECHNICAL", aliases: ["php programming", "php7", "php8"] },
  { canonicalName: "Ruby", category: "TECHNICAL", aliases: ["ruby programming", "ruby lang"] },
  { canonicalName: "Swift", category: "TECHNICAL", aliases: ["swift programming", "ios swift"] },
  { canonicalName: "Kotlin", category: "TECHNICAL", aliases: ["kotlin programming", "android kotlin"] },
  { canonicalName: "Scala", category: "TECHNICAL", aliases: ["scala programming", "scala lang"] },
  { canonicalName: "R", category: "TECHNICAL", aliases: ["r programming", "r language", "r stats"] },
  { canonicalName: "MATLAB", category: "TECHNICAL", aliases: ["matlab programming"] },
  { canonicalName: "Shell Scripting", category: "TECHNICAL", aliases: ["bash", "shell script", "bash scripting", "zsh", "sh scripting", "powershell"] },

  // ── Web Frontend ──────────────────────────────────────────────────────────
  { canonicalName: "React", category: "TECHNICAL", aliases: ["reactjs", "react.js", "react hooks", "react native"] },
  { canonicalName: "Vue.js", category: "TECHNICAL", aliases: ["vuejs", "vue", "vue3", "vue2", "nuxt"] },
  { canonicalName: "Angular", category: "TECHNICAL", aliases: ["angularjs", "angular2+", "angular framework"] },
  { canonicalName: "Next.js", category: "TECHNICAL", aliases: ["nextjs", "next js"] },
  { canonicalName: "Svelte", category: "TECHNICAL", aliases: ["sveltejs", "sveltekit"] },
  { canonicalName: "HTML", category: "TECHNICAL", aliases: ["html5", "html/css", "hypertext markup language"] },
  { canonicalName: "CSS", category: "TECHNICAL", aliases: ["css3", "cascading style sheets", "css/html"] },
  { canonicalName: "Tailwind CSS", category: "TECHNICAL", aliases: ["tailwindcss", "tailwind", "tailwind css"] },
  { canonicalName: "SASS/SCSS", category: "TECHNICAL", aliases: ["sass", "scss", "less css"] },
  { canonicalName: "Redux", category: "TECHNICAL", aliases: ["redux toolkit", "react redux", "redux saga"] },

  // ── Web Backend ───────────────────────────────────────────────────────────
  { canonicalName: "Node.js", category: "TECHNICAL", aliases: ["nodejs", "node js", "node"] },
  { canonicalName: "Express.js", category: "TECHNICAL", aliases: ["expressjs", "express", "express framework"] },
  { canonicalName: "FastAPI", category: "TECHNICAL", aliases: ["fast api", "fastapi python"] },
  { canonicalName: "Django", category: "TECHNICAL", aliases: ["django rest framework", "drf"] },
  { canonicalName: "Flask", category: "TECHNICAL", aliases: ["flask python", "flask framework"] },
  { canonicalName: "Spring Boot", category: "TECHNICAL", aliases: ["spring", "spring framework", "spring mvc"] },
  { canonicalName: "ASP.NET", category: "TECHNICAL", aliases: ["asp.net core", "dotnet", ".net", "aspnet"] },
  { canonicalName: "Laravel", category: "TECHNICAL", aliases: ["laravel php", "laravel framework"] },
  { canonicalName: "GraphQL", category: "TECHNICAL", aliases: ["graphql api", "apollo graphql"] },
  { canonicalName: "REST API", category: "TECHNICAL", aliases: ["restful api", "rest apis", "restful", "rest services", "api development"] },

  // ── Databases ─────────────────────────────────────────────────────────────
  { canonicalName: "PostgreSQL", category: "TECHNICAL", aliases: ["postgres", "postgresql database", "pg"] },
  { canonicalName: "MySQL", category: "TECHNICAL", aliases: ["mysql database", "mariadb"] },
  { canonicalName: "MongoDB", category: "TECHNICAL", aliases: ["mongo", "mongodb atlas"] },
  { canonicalName: "Redis", category: "TECHNICAL", aliases: ["redis cache", "redis database"] },
  { canonicalName: "SQLite", category: "TECHNICAL", aliases: ["sqlite database"] },
  { canonicalName: "Elasticsearch", category: "TECHNICAL", aliases: ["elastic search", "elk stack"] },
  { canonicalName: "SQL", category: "TECHNICAL", aliases: ["sql language", "structured query language", "tsql", "plsql"] },
  { canonicalName: "NoSQL", category: "TECHNICAL", aliases: ["nosql databases", "document databases"] },
  { canonicalName: "Cassandra", category: "TECHNICAL", aliases: ["apache cassandra"] },
  { canonicalName: "DynamoDB", category: "TECHNICAL", aliases: ["aws dynamodb", "amazon dynamodb"] },

  // ── AI / ML ───────────────────────────────────────────────────────────────
  { canonicalName: "Machine Learning", category: "TECHNICAL", aliases: ["ml", "machine learning algorithms", "statistical ml"] },
  { canonicalName: "Deep Learning", category: "TECHNICAL", aliases: ["neural networks", "deep neural networks", "dl"] },
  { canonicalName: "TensorFlow", category: "TOOLS", aliases: ["tensorflow2", "tf", "tensorflow framework"] },
  { canonicalName: "PyTorch", category: "TOOLS", aliases: ["pytorch framework", "torch"] },
  { canonicalName: "scikit-learn", category: "TOOLS", aliases: ["sklearn", "scikit learn", "scikit"] },
  { canonicalName: "Pandas", category: "TOOLS", aliases: ["pandas python", "pandas library"] },
  { canonicalName: "NumPy", category: "TOOLS", aliases: ["numpy python", "numpy library"] },
  { canonicalName: "NLP", category: "TECHNICAL", aliases: ["natural language processing", "text processing", "nlp techniques"] },
  { canonicalName: "Computer Vision", category: "TECHNICAL", aliases: ["cv", "image processing", "opencv"] },
  { canonicalName: "MLOps", category: "TECHNICAL", aliases: ["ml operations", "model deployment", "ml pipeline"] },
  { canonicalName: "Data Science", category: "DOMAIN", aliases: ["data scientist", "data science skills"] },
  { canonicalName: "Statistics", category: "DOMAIN", aliases: ["statistical analysis", "probability", "statistical modeling"] },
  { canonicalName: "LLMs", category: "TECHNICAL", aliases: ["large language models", "llm", "gpt", "chatgpt", "generative ai", "gen ai"] },

  // ── DevOps & Cloud ────────────────────────────────────────────────────────
  { canonicalName: "Docker", category: "TOOLS", aliases: ["docker containers", "containerization", "dockerfile"] },
  { canonicalName: "Kubernetes", category: "TOOLS", aliases: ["k8s", "container orchestration", "kube"] },
  { canonicalName: "AWS", category: "TOOLS", aliases: ["amazon web services", "aws cloud", "amazon cloud"] },
  { canonicalName: "Google Cloud", category: "TOOLS", aliases: ["gcp", "google cloud platform"] },
  { canonicalName: "Azure", category: "TOOLS", aliases: ["microsoft azure", "azure cloud"] },
  { canonicalName: "CI/CD", category: "TECHNICAL", aliases: ["continuous integration", "continuous deployment", "devops pipeline", "jenkins", "github actions", "gitlab ci"] },
  { canonicalName: "Terraform", category: "TOOLS", aliases: ["terraform iac", "infrastructure as code"] },
  { canonicalName: "Ansible", category: "TOOLS", aliases: ["ansible automation"] },
  { canonicalName: "Linux", category: "TECHNICAL", aliases: ["linux administration", "ubuntu", "centos", "linux os"] },
  { canonicalName: "Nginx", category: "TOOLS", aliases: ["nginx server", "nginx web server"] },

  // ── Version Control & Tools ───────────────────────────────────────────────
  { canonicalName: "Git", category: "TOOLS", aliases: ["version control", "git version control", "github", "gitlab", "bitbucket"] },
  { canonicalName: "Jira", category: "TOOLS", aliases: ["jira software", "atlassian jira"] },
  { canonicalName: "Figma", category: "TOOLS", aliases: ["figma design", "figma tool"] },
  { canonicalName: "Postman", category: "TOOLS", aliases: ["postman api", "api testing tool"] },

  // ── Data & Analytics ─────────────────────────────────────────────────────
  { canonicalName: "Data Analysis", category: "TECHNICAL", aliases: ["data analytics", "data analyst skills", "analyzing data"] },
  { canonicalName: "Data Visualization", category: "TECHNICAL", aliases: ["data viz", "visualization", "charts", "dashboards"] },
  { canonicalName: "Tableau", category: "TOOLS", aliases: ["tableau desktop", "tableau software"] },
  { canonicalName: "Power BI", category: "TOOLS", aliases: ["powerbi", "microsoft power bi", "power bi desktop"] },
  { canonicalName: "Excel", category: "TOOLS", aliases: ["microsoft excel", "excel spreadsheets", "advanced excel"] },
  { canonicalName: "Spark", category: "TOOLS", aliases: ["apache spark", "pyspark", "spark streaming"] },
  { canonicalName: "Hadoop", category: "TOOLS", aliases: ["apache hadoop", "hdfs", "mapreduce"] },
  { canonicalName: "ETL", category: "TECHNICAL", aliases: ["extract transform load", "data pipeline", "data ingestion"] },
  { canonicalName: "Data Warehousing", category: "DOMAIN", aliases: ["data warehouse", "redshift", "snowflake", "bigquery"] },

  // ── Security ─────────────────────────────────────────────────────────────
  { canonicalName: "Cybersecurity", category: "DOMAIN", aliases: ["information security", "infosec", "it security"] },
  { canonicalName: "Network Security", category: "DOMAIN", aliases: ["network defense", "firewall", "ids/ips"] },
  { canonicalName: "Penetration Testing", category: "TECHNICAL", aliases: ["pen testing", "pentesting", "ethical hacking"] },
  { canonicalName: "SIEM", category: "TOOLS", aliases: ["siem tools", "splunk", "security information"] },
  { canonicalName: "Cryptography", category: "TECHNICAL", aliases: ["encryption", "cryptographic algorithms", "pki"] },
  { canonicalName: "OWASP", category: "DOMAIN", aliases: ["owasp top 10", "web security", "application security"] },
  { canonicalName: "Compliance", category: "DOMAIN", aliases: ["gdpr", "hipaa", "iso 27001", "pci dss"] },

  // ── Product & Design ─────────────────────────────────────────────────────
  { canonicalName: "Product Management", category: "DOMAIN", aliases: ["product manager", "product strategy", "pm"] },
  { canonicalName: "UX Design", category: "DOMAIN", aliases: ["user experience", "ux", "ux research", "user research"] },
  { canonicalName: "UI Design", category: "DOMAIN", aliases: ["user interface design", "ui", "visual design", "graphic design"] },
  { canonicalName: "Wireframing", category: "TECHNICAL", aliases: ["wireframes", "prototyping", "mockups"] },
  { canonicalName: "User Research", category: "DOMAIN", aliases: ["usability testing", "user interviews", "ux research"] },
  { canonicalName: "A/B Testing", category: "TECHNICAL", aliases: ["split testing", "experimentation", "hypothesis testing"] },
  { canonicalName: "Agile", category: "DOMAIN", aliases: ["agile methodology", "scrum", "kanban", "sprint"] },

  // ── Soft Skills ───────────────────────────────────────────────────────────
  { canonicalName: "Communication", category: "SOFT", aliases: ["verbal communication", "written communication", "presentation skills"] },
  { canonicalName: "Problem Solving", category: "SOFT", aliases: ["analytical thinking", "critical thinking", "troubleshooting"] },
  { canonicalName: "Teamwork", category: "SOFT", aliases: ["collaboration", "team player", "cross-functional collaboration"] },
  { canonicalName: "Leadership", category: "SOFT", aliases: ["team leadership", "people management", "mentoring"] },
  { canonicalName: "Time Management", category: "SOFT", aliases: ["prioritization", "deadline management", "organization"] },
  { canonicalName: "Adaptability", category: "SOFT", aliases: ["flexibility", "learning agility", "growth mindset"] },
  { canonicalName: "Attention to Detail", category: "SOFT", aliases: ["detail oriented", "accuracy", "thoroughness"] },
  { canonicalName: "Project Management", category: "DOMAIN", aliases: ["project planning", "pmp", "project coordination", "stakeholder management"] },
  { canonicalName: "Technical Writing", category: "SOFT", aliases: ["documentation", "technical documentation", "api documentation"] },

  // ── Testing ───────────────────────────────────────────────────────────────
  { canonicalName: "Unit Testing", category: "TECHNICAL", aliases: ["jest", "vitest", "mocha", "pytest", "junit", "unit tests"] },
  { canonicalName: "Integration Testing", category: "TECHNICAL", aliases: ["integration tests", "api testing"] },
  { canonicalName: "E2E Testing", category: "TECHNICAL", aliases: ["end-to-end testing", "playwright", "cypress", "selenium"] },
  { canonicalName: "Test-Driven Development", category: "TECHNICAL", aliases: ["tdd", "test driven", "bdd"] },

  // ── Blockchain ────────────────────────────────────────────────────────────
  { canonicalName: "Blockchain", category: "TECHNICAL", aliases: ["distributed ledger", "web3", "smart contracts", "solidity"] },

  // ── Mobile ────────────────────────────────────────────────────────────────
  { canonicalName: "iOS Development", category: "TECHNICAL", aliases: ["ios", "xcode", "swift ios", "apple development"] },
  { canonicalName: "Android Development", category: "TECHNICAL", aliases: ["android", "android studio", "kotlin android", "java android"] },
  { canonicalName: "React Native", category: "TECHNICAL", aliases: ["react-native", "cross platform mobile"] },
  { canonicalName: "Flutter", category: "TECHNICAL", aliases: ["flutter dart", "dart flutter"] },
];

// Build lookup maps
const exactMap = new Map<string, string>();
const aliasMap = new Map<string, string>();

for (const entry of SKILL_TAXONOMY) {
  exactMap.set(entry.canonicalName.toLowerCase(), entry.canonicalName);
  for (const alias of entry.aliases) {
    aliasMap.set(alias.toLowerCase(), entry.canonicalName);
  }
}

export function lookupCanonical(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  return exactMap.get(lower) ?? aliasMap.get(lower) ?? null;
}

export function getSkillEntry(canonicalName: string): SkillEntry | undefined {
  return SKILL_TAXONOMY.find((s) => s.canonicalName === canonicalName);
}
