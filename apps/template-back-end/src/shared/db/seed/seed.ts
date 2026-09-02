import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import bcryptjs from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiRoot = join(__dirname, "..", "..", "..", "..");

async function main() {
  const isRemote = process.argv.includes("--remote");
  const envFlag = isRemote ? "--remote" : "--local";
  const isFresh = process.argv.includes("--fresh") || process.argv.includes("--reset");

  if (isFresh) {
    const pkgManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const remoteFlag = isRemote ? " --remote" : "";
    execSync(`${pkgManager} run db:reset${remoteFlag}`, { cwd: apiRoot, stdio: "inherit" });
  }

  const plainPassword = "admin";
  const salt = await bcryptjs.genSalt(12);
  const passwordHash = await bcryptjs.hash(plainPassword, salt);

  const sqlContent = [
    `DELETE FROM user_rol;`,
    `DELETE FROM item;`,
    `DELETE FROM user;`,
    `DELETE FROM rol;`,
    ``,
    `INSERT OR IGNORE INTO rol (id, rol, description) VALUES (`,
    `  '6027c876-e1f7-4e67-b0a8-7debbac32952',`,
    `  'ADMIN',`,
    `  'Administrator Role'`,
    `);`,
    `INSERT OR IGNORE INTO rol (id, rol, description) VALUES (`,
    `  '9f530d0a-3784-47f3-be54-69e8870264c1',`,
    `  'USER',`,
    `  'Standard User Role'`,
    `);`,
    ``,
    `INSERT OR IGNORE INTO user (id, email, password, name) VALUES (`,
    `  '550e8400-e29b-41d4-a716-446655440000',`,
    `  'admin@example.com',`,
    `  '${passwordHash}',`,
    `  'Admin User'`,
    `);`,
    ``,
    `INSERT OR IGNORE INTO user_rol (user_id, rol_id) VALUES (`,
    `  '550e8400-e29b-41d4-a716-446655440000',`,
    `  '6027c876-e1f7-4e67-b0a8-7debbac32952'`,
    `);`,
    `INSERT OR IGNORE INTO user_rol (user_id, rol_id) VALUES (`,
    `  '550e8400-e29b-41d4-a716-446655440000',`,
    `  '9f530d0a-3784-47f3-be54-69e8870264c1'`,
    `);`,
    ``,
    `INSERT OR IGNORE INTO item (id, name, description, status, user_id) VALUES (`,
    `  '660e8400-e29b-41d4-a716-446655440001',`,
    `  'Sample Item',`,
    `  'This is a sample item for the template',`,
    `  'active',`,
    `  '550e8400-e29b-41d4-a716-446655440000'`,
    `);`,
  ].join("\n");

  const sqlPath = join(__dirname, "seed.sql");
  writeFileSync(sqlPath, sqlContent, "utf-8");

  const seedCommand = `wrangler d1 execute template-db ${envFlag} --file=./src/shared/db/seed/seed.sql`;
  execSync(seedCommand, { cwd: apiRoot, stdio: "inherit" });
}

main();
