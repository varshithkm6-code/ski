import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SKILL_TAXONOMY } from "../src/normalization/taxonomy";
import { ROLES_SEED } from "../src/data/roles";

const UserRole = { CANDIDATE: "CANDIDATE", COUNSELOR: "COUNSELOR", ADMIN: "ADMIN" } as const;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Skills ──────────────────────────────────────────────────────────────────
  console.log("Seeding skills...");
  const skillMap = new Map<string, string>(); // canonicalName -> id

  for (const entry of SKILL_TAXONOMY) {
    const skill = await prisma.skill.upsert({
      where: { canonicalName: entry.canonicalName },
      update: { aliases: JSON.stringify(entry.aliases), category: entry.category },
      create: {
        canonicalName: entry.canonicalName,
        category: entry.category,
        aliases: JSON.stringify(entry.aliases),
      },
    });
    skillMap.set(skill.canonicalName, skill.id);
  }
  console.log(`✓ Seeded ${SKILL_TAXONOMY.length} skills`);

  // ── Roles ───────────────────────────────────────────────────────────────────
  console.log("Seeding roles...");
  for (const roleDef of ROLES_SEED) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: { title: roleDef.title, seniority: roleDef.seniority, description: roleDef.description },
      create: {
        slug: roleDef.slug,
        title: roleDef.title,
        seniority: roleDef.seniority,
        description: roleDef.description,
      },
    });

    // Delete existing role skills and recreate
    await prisma.roleSkill.deleteMany({ where: { roleId: role.id } });

    for (const rs of roleDef.requiredSkills) {
      const skillId = skillMap.get(rs.name);
      if (!skillId) { console.warn(`  ⚠ Skill not found: ${rs.name}`); continue; }
      await prisma.roleSkill.create({
        data: { roleId: role.id, skillId, required: true, weight: rs.weight, minProficiency: rs.minProficiency },
      });
    }
    for (const rs of roleDef.niceToHaveSkills) {
      const skillId = skillMap.get(rs.name);
      if (!skillId) { console.warn(`  ⚠ Skill not found: ${rs.name}`); continue; }
      await prisma.roleSkill.create({
        data: { roleId: role.id, skillId, required: false, weight: rs.weight, minProficiency: 1 },
      });
    }
  }
  console.log(`✓ Seeded ${ROLES_SEED.length} roles`);

  // ── Users ───────────────────────────────────────────────────────────────────
  console.log("Seeding users...");
  const hash = async (pw: string) => bcrypt.hash(pw, 10);

  const counselorEmails = (process.env.COUNSELOR_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

  // Candidate persona 1: Alex — fresh CS grad
  const alex = await prisma.user.upsert({
    where: { email: "alex@demo.skillbridge.dev" },
    update: {},
    create: {
      email: "alex@demo.skillbridge.dev",
      name: "Alex Chen",
      passwordHash: await hash("demo1234"),
      role: UserRole.CANDIDATE,
    },
  });

  // Candidate persona 2: Jordan — career switcher
  const jordan = await prisma.user.upsert({
    where: { email: "jordan@demo.skillbridge.dev" },
    update: {},
    create: {
      email: "jordan@demo.skillbridge.dev",
      name: "Jordan Kim",
      passwordHash: await hash("demo1234"),
      role: UserRole.CANDIDATE,
    },
  });

  // Counselor
  await prisma.user.upsert({
    where: { email: "counselor@demo.skillbridge.dev" },
    update: {},
    create: {
      email: "counselor@demo.skillbridge.dev",
      name: "Dr. Sarah Mehta",
      passwordHash: await hash("demo1234"),
      role: UserRole.COUNSELOR,
    },
  });

  // Create env-based counselors
  for (const email of counselorEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: UserRole.COUNSELOR },
      create: {
        email,
        passwordHash: await hash("changeme"),
        role: UserRole.COUNSELOR,
      },
    });
  }

  console.log(`✓ Seeded users: alex, jordan, counselor`);
  if (counselorEmails.length > 0) {
    console.log(`✓ Elevated COUNSELOR_EMAILS: ${counselorEmails.join(", ")}`);
  }

  // ── Demo Profiles ───────────────────────────────────────────────────────────
  const jsSkill = skillMap.get("JavaScript")!;
  const reactSkill = skillMap.get("React")!;
  const pythonSkill = skillMap.get("Python")!;
  const sqlSkill = skillMap.get("SQL")!;
  const gitSkill = skillMap.get("Git")!;
  const htmlSkill = skillMap.get("HTML")!;
  const cssSkill = skillMap.get("CSS")!;

  // Alex's profile (frontend leaning)
  const alexProfileData = {
    education: [{ degree: "B.S.", field: "Computer Science", institution: "State University", year: 2024 }],
    experience: [],
    skills: ["JavaScript", "HTML", "CSS", "React", "Git", "Python"],
    certifications: [],
    projects: [{ name: "Portfolio Website", description: "Personal portfolio built with React", skills: ["React", "JavaScript"] }],
  };
  const alexSkills = [
    { skillId: jsSkill, proficiency: 4, evidenceType: "PROJECT" },
    { skillId: reactSkill, proficiency: 3, evidenceType: "PROJECT" },
    { skillId: htmlSkill, proficiency: 4, evidenceType: "PROJECT" },
    { skillId: cssSkill, proficiency: 3, evidenceType: "PROJECT" },
    { skillId: gitSkill, proficiency: 3, evidenceType: "EXPERIENCE" },
    { skillId: pythonSkill, proficiency: 2, evidenceType: "SELF_RATED" },
  ];

  let alexProfile = await prisma.profile.findUnique({ where: { userId: alex.id } });
  if (alexProfile) {
    await prisma.profileSkill.deleteMany({ where: { profileId: alexProfile.id } });
    await prisma.profile.update({
      where: { id: alexProfile.id },
      data: {
        parsedData: alexProfileData,
        profileSkills: { create: alexSkills },
      },
    });
  } else {
    alexProfile = await prisma.profile.create({
      data: {
        userId: alex.id,
        parsedData: alexProfileData,
        profileSkills: { create: alexSkills },
      },
    });
  }

  // Jordan's profile (data/analytics transitioning)
  const jordanProfileData = {
    education: [{ degree: "B.A.", field: "Economics", institution: "Liberal Arts College", year: 2021 }],
    experience: [{ title: "Financial Analyst", company: "Finance Corp", years: 2, description: "Excel, financial modeling" }],
    skills: ["Excel", "SQL", "Python", "Statistics"],
    certifications: ["Google Data Analytics Certificate"],
    projects: [{ name: "Sales Dashboard", description: "Power BI dashboard for sales data", skills: ["Excel", "SQL"] }],
  };
  const jordanSkills = [
    { skillId: sqlSkill, proficiency: 3, evidenceType: "EXPERIENCE" },
    { skillId: pythonSkill, proficiency: 2, evidenceType: "SELF_RATED" },
    { skillId: gitSkill, proficiency: 1, evidenceType: "SELF_RATED" },
  ];

  let jordanProfile = await prisma.profile.findUnique({ where: { userId: jordan.id } });
  if (jordanProfile) {
    await prisma.profileSkill.deleteMany({ where: { profileId: jordanProfile.id } });
    await prisma.profile.update({
      where: { id: jordanProfile.id },
      data: {
        parsedData: jordanProfileData,
        profileSkills: { create: jordanSkills },
      },
    });
  } else {
    jordanProfile = await prisma.profile.create({
      data: {
        userId: jordan.id,
        parsedData: jordanProfileData,
        profileSkills: { create: jordanSkills },
      },
    });
  }

  console.log("✓ Seeded demo profiles");
  console.log("\n🎉 Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Candidate 1: alex@demo.skillbridge.dev / demo1234");
  console.log("  Candidate 2: jordan@demo.skillbridge.dev / demo1234");
  console.log("  Counselor:   counselor@demo.skillbridge.dev / demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
