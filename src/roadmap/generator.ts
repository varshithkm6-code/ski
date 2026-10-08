// lib/roadmap/generator.ts
// Phased roadmap generator (30/60/90 days) ordered by gap priority

import type { GapResult } from "@/scoring/types";

export interface RoadmapItemInput {
  skillId: string;
  canonicalName: string;
  phase: "DAYS_30" | "DAYS_60" | "DAYS_90";
  title: string;
  whyItMatters: string;
  resourceTypes: string[];
  estimatedHours: number;
  milestone: string;
  projectIdea?: string;
  sortOrder: number;
}

// Static resource suggestions by category
const STATIC_RESOURCES: Record<string, { types: string[]; hours: number; project: string; milestone: string }> = {
  JavaScript: { types: ["course", "project"], hours: 40, project: "Build a todo app with vanilla JS", milestone: "Complete 3 JS exercises and build one project" },
  TypeScript: { types: ["course", "project"], hours: 30, project: "Convert existing JS project to TypeScript", milestone: "Successfully type an existing codebase" },
  Python: { types: ["course", "project"], hours: 40, project: "Build a data analysis script with Pandas", milestone: "Write 5 Python scripts covering core concepts" },
  React: { types: ["course", "project"], hours: 50, project: "Build a full CRUD app with React hooks", milestone: "Deploy a React app with authentication" },
  "Node.js": { types: ["course", "project"], hours: 40, project: "Build a REST API with Express", milestone: "Deploy an API handling 5+ endpoints" },
  SQL: { types: ["course", "practice"], hours: 30, project: "Design and query a relational DB schema", milestone: "Write complex queries with JOINs and aggregations" },
  Git: { types: ["course", "practice"], hours: 10, project: "Contribute to an open source project", milestone: "Make a pull request to a public repository" },
  Docker: { types: ["course", "project"], hours: 20, project: "Containerize an existing web app", milestone: "Deploy a multi-container app with docker-compose" },
  AWS: { types: ["course", "certification"], hours: 60, project: "Deploy a web app on EC2/S3/RDS", milestone: "Obtain AWS Cloud Practitioner or Solutions Architect cert" },
  "Machine Learning": { types: ["course", "project", "certification"], hours: 80, project: "Train and deploy a classification model", milestone: "Complete a Kaggle competition or ML project" },
  "Data Analysis": { types: ["course", "project"], hours: 40, project: "Analyze a public dataset and visualize insights", milestone: "Publish an analysis on GitHub/Kaggle" },
  Kubernetes: { types: ["course", "project"], hours: 40, project: "Deploy a microservices app on a local cluster", milestone: "Successfully manage a multi-pod deployment" },
  "CI/CD": { types: ["course", "project"], hours: 20, project: "Set up a GitHub Actions pipeline", milestone: "Automate build, test, and deploy for a project" },
  Cybersecurity: { types: ["course", "certification"], hours: 60, project: "Complete a CTF challenge", milestone: "Obtain CompTIA Security+ or CEH certification" },
  "Product Management": { types: ["course", "project"], hours: 30, project: "Create a product roadmap for a hypothetical product", milestone: "Write a PRD and present it to peers" },
  "UX Design": { types: ["course", "project"], hours: 40, project: "Redesign an existing app's UX", milestone: "Complete a case study and add to portfolio" },
};

function getResourceConfig(skillName: string): { types: string[]; hours: number; project?: string; milestone: string } {
  const config = STATIC_RESOURCES[skillName];
  if (config) return config;
  // Fallback based on common patterns
  return {
    types: ["course", "project"],
    hours: 30,
    project: `Build a portfolio project demonstrating ${skillName}`,
    milestone: `Complete a ${skillName} tutorial and build one hands-on project`,
  };
}

function assignPhase(
  index: number,
  totalGaps: number,
  status: string
): "DAYS_30" | "DAYS_60" | "DAYS_90" {
  // Critical/Missing gaps → Phase 1 (30 days)
  if (status === "CRITICAL_GAP" || status === "MISSING") {
    if (index < Math.ceil(totalGaps * 0.4)) return "DAYS_30";
    if (index < Math.ceil(totalGaps * 0.7)) return "DAYS_60";
    return "DAYS_90";
  }
  // Partial gaps → Phase 2/3
  if (status === "PARTIAL_GAP") {
    if (index < Math.ceil(totalGaps * 0.3)) return "DAYS_60";
    return "DAYS_90";
  }
  return "DAYS_90";
}

export function generateRoadmap(gaps: GapResult[]): RoadmapItemInput[] {
  // Sort: MISSING first, then CRITICAL_GAP, then PARTIAL_GAP, then STRONG (exclude STRONG from roadmap)
  const priority: Record<string, number> = { MISSING: 0, CRITICAL_GAP: 1, PARTIAL_GAP: 2, STRONG: 3 };
  const actionableGaps = gaps
    .filter((g) => g.status !== "STRONG")
    .sort((a, b) => {
      const pDiff = (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
      if (pDiff !== 0) return pDiff;
      return b.weight - a.weight; // higher weight first
    });

  return actionableGaps.map((gap, index) => {
    const res = getResourceConfig(gap.canonicalName);
    const phase = assignPhase(index, actionableGaps.length, gap.status);
    const isCritical = gap.status === "CRITICAL_GAP" || gap.status === "MISSING";

    return {
      skillId: gap.skillId,
      canonicalName: gap.canonicalName,
      phase,
      title: `${isCritical ? "🔴 " : "🟡 "}Master ${gap.canonicalName}`,
      whyItMatters: `${gap.canonicalName} is a ${gap.required ? "required" : "nice-to-have"} skill. Your current level (${gap.userProficiency}/5) needs to reach ${gap.requiredProficiency}/5 for this role.`,
      resourceTypes: res.types,
      estimatedHours: res.hours,
      milestone: res.milestone,
      projectIdea: res.project,
      sortOrder: index,
    };
  });
}
