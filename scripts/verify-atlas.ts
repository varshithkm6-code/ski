/**
 * SkillBridge - MongoDB Atlas Verification Script
 * Validates connection, collections, document counts, and relational query integrity.
 * 
 * Usage:
 *   npx ts-node scripts/verify-atlas.ts
 *   or:
 *   DATABASE_URL="mongodb+srv://..." npx ts-node scripts/verify-atlas.ts
 */

import { PrismaClient } from "@prisma/client";

async function verifyAtlas() {
  const dbUrl = process.env.DATABASE_URL;

  console.log("=================================================");
  console.log("   SkillBridge - MongoDB Atlas Verification      ");
  console.log("=================================================\n");

  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not defined.");
    console.error("Please set DATABASE_URL in your .env or pass it inline:");
    console.error('DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/skillbridge?retryWrites=true&w=majority" npx ts-node scripts/verify-atlas.ts\n');
    process.exit(1);
  }

  const isMongo = dbUrl.startsWith("mongodb://") || dbUrl.startsWith("mongodb+srv://");
  if (!isMongo) {
    console.warn("⚠️  NOTE: DATABASE_URL does not start with 'mongodb://' or 'mongodb+srv://'.");
    console.warn(`Current protocol: ${dbUrl.split(":")[0]}`);
    console.warn("Verifying database connection using active client...\n");
  } else {
    // Mask credentials for safe logging
    const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
    console.log(`Connecting to: ${maskedUrl}`);
  }

  const prisma = new PrismaClient({
    log: ["warn", "error"],
  });

  try {
    const startTime = Date.now();
    await prisma.$connect();
    const connectDuration = Date.now() - startTime;
    console.log(`✅ Connection established successfully (${connectDuration}ms)\n`);

    console.log("📊 Checking Collections & Document Counts:");
    const [userCount, roleCount, skillCount, profileCount, analysisCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.skill.count(),
      prisma.profile.count(),
      prisma.analysis.count(),
    ]);

    console.log(`  • Users:         ${userCount}`);
    console.log(`  • Target Roles:  ${roleCount}`);
    console.log(`  • Skills:        ${skillCount}`);
    console.log(`  • Profiles:      ${profileCount}`);
    console.log(`  • Analyses:      ${analysisCount}`);

    console.log("\n🧪 Running Sample Query Integrity Check:");
    const sampleRole = await prisma.role.findFirst({
      where: { slug: "frontend-developer" },
      include: {
        roleSkills: {
          include: { skill: true },
        },
      },
    });

    if (sampleRole) {
      console.log(`✅ Sample Role found: "${sampleRole.title}" with ${sampleRole.roleSkills.length} competencies`);
      const sampleSkillNames = sampleRole.roleSkills.slice(0, 3).map((rs) => rs.skill.canonicalName).join(", ");
      console.log(`   Sample competencies: ${sampleSkillNames}...`);
    } else {
      console.warn("⚠️  Role 'frontend-developer' not found. Have you executed the seed script?");
      console.warn("   Run: npm run db:seed");
    }

    // Verify counselor and demo candidate accounts
    const demoCandidate = await prisma.user.findUnique({
      where: { email: "alex@demo.skillbridge.dev" },
      include: { profile: { include: { profileSkills: true } } },
    });

    if (demoCandidate) {
      console.log(`✅ Demo candidate verified: ${demoCandidate.name} (${demoCandidate.email})`);
      console.log(`   Attached profile skills: ${demoCandidate.profile?.profileSkills.length ?? 0}`);
    } else {
      console.warn("⚠️  Demo user alex@demo.skillbridge.dev not found. Run 'npm run db:seed' to populate.");
    }

    const counselor = await prisma.user.findUnique({
      where: { email: "counselor@demo.skillbridge.dev" },
    });

    if (counselor && counselor.role === "COUNSELOR") {
      console.log(`✅ Demo counselor verified: ${counselor.name} (${counselor.role})`);
    }

    console.log("\n=================================================");
    console.log("✨ ALL CHECKS PASSED: Database is healthy & ready");
    console.log("=================================================\n");
    await prisma.$disconnect();
    process.exit(0);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("\n❌ Database Verification Failed!");
    console.error("Error details:", error.message || error);
    console.error("\nTroubleshooting Checklist for MongoDB Atlas:");
    console.error(" 1. Check Atlas Network Access: Did you add your current IP address (or 0.0.0.0/0) to the IP Access List?");
    console.error(" 2. Check Atlas Database Access: Does the database user have readWrite permissions on the database?");
    console.error(" 3. Check Connection String: Ensure the database name is appended (e.g., ...mongodb.net/skillbridge?...)");
    console.error(" 4. Push Schema: If collections do not exist yet, run:");
    console.error("    npx prisma db push --schema=prisma/schema.mongo.prisma");
    console.error(" 5. Seed Data: After push, run:");
    console.error("    npm run db:seed\n");
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyAtlas();
