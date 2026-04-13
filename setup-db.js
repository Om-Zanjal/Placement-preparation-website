import pg from "pg";
import fs from "fs";

const client = new pg.Client({
  connectionString: "postgresql://postgres:sqlom1234@localhost:5432/placement_prep",
});

async function main() {
  let output = "";
  const log = (msg) => { output += msg + "\n"; };

  try {
    await client.connect();
    log("Connected to placement_prep database!");
    log("");

    // Drop existing tables (in correct order due to foreign keys)
    log("Dropping existing tables if any...");
    await client.query("DROP TABLE IF EXISTS bookings CASCADE");
    await client.query("DROP TABLE IF EXISTS availability CASCADE");
    await client.query("DROP TABLE IF EXISTS aptitude_scores CASCADE");
    await client.query("DROP TABLE IF EXISTS users CASCADE");
    log("Dropped all existing tables.");
    log("");

    // Create all tables
    log("Creating tables...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'expert')),
        expertise TEXT, 
        bio TEXT,
        resume_url TEXT,
        photo_url TEXT,
        college TEXT,
        city TEXT,
        state TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        skills TEXT,
        grad_year TEXT,
        company TEXT,
        years_of_experience TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log("  ✅ users table created");

    await client.query(`
      CREATE TABLE aptitude_scores (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        section TEXT NOT NULL, 
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        is_mock BOOLEAN DEFAULT false,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log("  ✅ aptitude_scores table created");

    await client.query(`
      CREATE TABLE availability (
        id SERIAL PRIMARY KEY,
        expert_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked'))
      )
    `);
    log("  ✅ availability table created");

    await client.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        expert_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        meet_link TEXT,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT,
        expert_joined BOOLEAN DEFAULT false
      )
    `);
    log("  ✅ bookings table created");
    log("");

    // Create indexes
    log("Creating indexes...");
    await client.query("CREATE INDEX idx_users_role ON users(role)");
    await client.query("CREATE INDEX idx_users_email ON users(email)");
    await client.query("CREATE INDEX idx_aptitude_student ON aptitude_scores(student_id)");
    await client.query("CREATE INDEX idx_availability_expert ON availability(expert_id)");
    await client.query("CREATE INDEX idx_availability_status ON availability(status)");
    await client.query("CREATE INDEX idx_bookings_student ON bookings(student_id)");
    await client.query("CREATE INDEX idx_bookings_expert ON bookings(expert_id)");
    await client.query("CREATE INDEX idx_bookings_status ON bookings(status)");
    log("  ✅ All indexes created");
    log("");

    // Verify tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    log("=== VERIFIED TABLES ===");
    tables.rows.forEach(r => log("  - " + r.table_name));

    const cols = await client.query(
      "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position"
    );
    
    let currentTable = "";
    for (const col of cols.rows) {
      if (col.table_name !== currentTable) {
        currentTable = col.table_name;
        log("\n=== " + currentTable.toUpperCase() + " COLUMNS ===");
      }
      log("  " + col.column_name + " | " + col.data_type + " | nullable: " + col.is_nullable + " | default: " + (col.column_default || "none"));
    }

    const indexes = await client.query(
      "SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname"
    );
    log("\n=== INDEXES ===");
    indexes.rows.forEach(r => log("  " + r.indexname + " ON " + r.tablename));

    log("\n🎉 Database setup complete! All 4 tables and 8 indexes created successfully.");
  } catch (err) {
    log("ERROR: " + err.message);
    log(err.stack);
  } finally {
    await client.end();
  }

  fs.writeFileSync("db-verify-output.txt", output);
  console.log(output);
}

main();
