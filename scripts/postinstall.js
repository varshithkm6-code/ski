const { execSync } = require("child_process");

const dbUrl = process.env.DATABASE_URL || "";
const isMongo = dbUrl.startsWith("mongodb://") || dbUrl.startsWith("mongodb+srv://");
const schema = isMongo ? "prisma/schema.mongo.prisma" : "prisma/schema.prisma";

console.log(`[postinstall] Generating Prisma Client using schema: ${schema}`);
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });
