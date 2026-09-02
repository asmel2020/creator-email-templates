import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiRoot = join(__dirname, "..", "..", "..", "..");

async function main() {
  const isRemote = process.argv.includes("--remote");
  const envFlag = isRemote ? "--remote" : "--local";

  console.log(`Dropping tables in ${isRemote ? "remote" : "local"} D1 database...`);

  const dropSql = `
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS user_rol;
    DROP TABLE IF EXISTS item;
    DROP TABLE IF EXISTS user;
    DROP TABLE IF EXISTS rol;
    DROP TABLE IF EXISTS d1_migrations;
    DROP TABLE IF EXISTS __drizzle_migrations;
    PRAGMA foreign_keys = ON;
  `.replace(/\s+/g, " ").trim();

  const dropCommand = `wrangler d1 execute template-db ${envFlag} --command "${dropSql}"`;

  try {
    execSync(dropCommand, { cwd: apiRoot, stdio: "inherit" });
    console.log("Tables dropped successfully.");
  } catch (err: any) {
    console.warn("Failed to drop tables (database might be empty):", err.message);
  }

  const pkgManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

  console.log("Generating Drizzle migrations...");
  execSync(`${pkgManager} run db:generate`, { cwd: apiRoot, stdio: "inherit" });

  console.log(`Applying Drizzle migrations ${isRemote ? "remotely" : "locally"}...`);
  const migrateScript = isRemote ? "db:migrate:remote" : "db:migrate:local";
  execSync(`${pkgManager} run ${migrateScript}`, { cwd: apiRoot, stdio: "inherit" });

  console.log("Database schema successfully reset and migrated!");
}

main();
