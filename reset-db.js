import pg from "pg";
import fs from "fs";

async function main() {
  const log = [];
  
  // Connect to the default postgres database to nuke the placement_prep DB
  const adminClient = new pg.Client({
    connectionString: "postgresql://postgres:sqlom1234@localhost:5432/postgres",
  });
  
  await adminClient.connect();
  log.push("Connected to postgres admin DB");
  
  // Terminate all connections to placement_prep
  await adminClient.query(`
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = 'placement_prep' AND pid <> pg_backend_pid()
  `);
  log.push("Terminated all connections to placement_prep");
  
  // Drop and recreate the database entirely
  await adminClient.query("DROP DATABASE IF EXISTS placement_prep");
  log.push("Dropped placement_prep database");
  
  await adminClient.query("CREATE DATABASE placement_prep");
  log.push("Created fresh placement_prep database");
  
  await adminClient.end();
  
  // Now connect to the fresh database and create tables
  const client = new pg.Client({
    connectionString: "postgresql://postgres:sqlom1234@localhost:5432/placement_prep",
  });
  
  await client.connect();
  log.push("\nConnected to fresh placement_prep database");

  // Create all tables
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
  log.push("Created users table");

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
  log.push("Created aptitude_scores table");

  await client.query(`
    CREATE TABLE availability (
      id SERIAL PRIMARY KEY,
      expert_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked'))
    )
  `);
  log.push("Created availability table");

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
  log.push("Created bookings table");

  // Create indexes
  await client.query("CREATE INDEX idx_users_role ON users(role)");
  await client.query("CREATE INDEX idx_users_email ON users(email)");
  await client.query("CREATE INDEX idx_aptitude_student ON aptitude_scores(student_id)");
  await client.query("CREATE INDEX idx_availability_expert ON availability(expert_id)");
  await client.query("CREATE INDEX idx_availability_status ON availability(status)");
  await client.query("CREATE INDEX idx_bookings_student ON bookings(student_id)");
  await client.query("CREATE INDEX idx_bookings_expert ON bookings(expert_id)");
  await client.query("CREATE INDEX idx_bookings_status ON bookings(status)");
  log.push("Created all indexes");

  // Test insert
  const result = await client.query(
    "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id",
    ['verify@test.com', 'test', 'Verify User', 'student']
  );
  log.push("Test insert id: " + result.rows[0].id);

  const count = await client.query("SELECT count(*) FROM users");
  log.push("User count: " + count.rows[0].count);

  // Cleanup test data
  await client.query("DELETE FROM users");
  await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  log.push("Cleaned up test data, reset sequences");

  await client.end();
  
  log.push("\n✅ Database completely reset and ready!");
  
  const output = log.join("\n");
  fs.writeFileSync("reset-output.txt", output, "utf8");
  console.log(output);
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
