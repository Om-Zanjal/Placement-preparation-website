import pg from "pg";
import fs from "fs";

async function main() {
  const client = new pg.Client({
    connectionString: "postgresql://postgres:sqlom1234@localhost:5432/placement_prep",
  });
  await client.connect();
  
  const users = await client.query("SELECT id, email, name, role, created_at FROM users ORDER BY id");
  const seq = await client.query("SELECT last_value, is_called FROM users_id_seq");
  
  const output = [
    "User count: " + users.rows.length,
    "Sequence: " + JSON.stringify(seq.rows[0]),
    "",
    "Users:",
    ...users.rows.map(u => "  " + JSON.stringify(u))
  ].join("\n");
  
  fs.writeFileSync("verify-final.txt", output, "utf8");
  console.log(output);
  
  await client.end();
}

main();
