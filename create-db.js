import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:sqlom1234@localhost:5432/postgres",
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL as postgres.");
    // Check if db exists
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'placement_prep'");
    if (res.rows.length === 0) {
      await client.query('CREATE DATABASE placement_prep');
      console.log("Database 'placement_prep' successfully created!");
    } else {
      console.log("Database 'placement_prep' already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err.message);
  } finally {
    await client.end();
  }
}

main();
