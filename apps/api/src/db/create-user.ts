/*
 * Creates a login account (e.g. the first admin on a fresh RDS database, where seeds are refused).
 *
 *   npm run user:create -- --name "Andi Pratama" --email andi@kampus.ac.id --role admin
 *
 * The password is asked interactively (hidden), or read from stdin when piped.
 */
import { parseArgs } from "node:util";
import { createPool } from "../config/database.js";
import { getEnv } from "../config/env.js";
import { createUserSchema } from "../modules/users/users.schema.js";
import { createUser } from "../modules/users/users.service.js";

async function readPassword(prompt: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    let input = "";
    for await (const chunk of stdin) input += chunk;
    return input.replace(/\r?\n$/, "");
  }

  process.stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error?: Error) => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u0003") return finish(new Error("Cancelled"));
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

const { values } = parseArgs({
  options: { name: { type: "string" }, email: { type: "string" }, role: { type: "string", default: "lecturer" } },
});

const password = await readPassword("Password: ");
const parsed = createUserSchema.safeParse({ ...values, password });
if (!parsed.success) {
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

const pool = createPool(getEnv());
try {
  const user = await createUser(pool, parsed.data);
  console.log(`Created ${user.role} #${user.lecturer_id} <${user.email}>`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
