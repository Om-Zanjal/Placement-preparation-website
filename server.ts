import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("prep_master.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT, -- 'student' or 'expert'
    expertise TEXT, -- for experts: 'Software Engineer', 'Data Scientist', etc.
    bio TEXT,
    resume_url TEXT,
    photo_url TEXT,
    college TEXT,
    city TEXT,
    state TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    skills TEXT,
    grad_year TEXT
  );

  CREATE TABLE IF NOT EXISTS aptitude_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    section TEXT, -- 'Quantitative', 'Logical', 'Verbal'
    score INTEGER,
    total INTEGER,
    is_mock BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER,
    start_time DATETIME,
    end_time DATETIME,
    status TEXT DEFAULT 'available', -- 'available', 'booked'
    FOREIGN KEY(expert_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    expert_id INTEGER,
    role TEXT,
    start_time DATETIME,
    end_time DATETIME,
    meet_link TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    rating INTEGER,
    feedback TEXT,
    expert_joined BOOLEAN DEFAULT 0,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(expert_id) REFERENCES users(id)
  );
`);

// Migration: Ensure is_mock column exists
try {
  db.exec("ALTER TABLE aptitude_scores ADD COLUMN is_mock BOOLEAN DEFAULT 0");
} catch (e) {
  // Column already exists or table doesn't exist yet (handled by CREATE TABLE)
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Error handling middleware for JSON parsing and limits
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: "File size too large. Please upload smaller files (max 50MB total)." });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    next(err);
  });

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role, expertise } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name, role, expertise) VALUES (?, ?, ?, ?, ?)").run(email, password, name, role, expertise);
      res.json({ id: info.lastInsertRowid, email, name, role });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/users/update", (req, res) => {
    const { 
      id, bio, expertise, resume_url, photo_url, college, city, state, github_url, linkedin_url, skills, grad_year 
    } = req.body;
    
    try {
      db.prepare(`
        UPDATE users SET 
          bio = ?, expertise = ?, resume_url = ?, photo_url = ?, 
          college = ?, city = ?, state = ?, github_url = ?, 
          linkedin_url = ?, skills = ?, grad_year = ?
        WHERE id = ?
      `).run(bio, expertise, resume_url, photo_url, college, city, state, github_url, linkedin_url, skills, grad_year, id);
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Aptitude
  app.post("/api/aptitude/submit", (req, res) => {
    const { student_id, section, score, total, is_mock } = req.body;
    try {
      db.prepare("INSERT INTO aptitude_scores (student_id, section, score, total, is_mock) VALUES (?, ?, ?, ?, ?)").run(student_id, section, score, total, is_mock ? 1 : 0);
      res.json({ success: true });
    } catch (e) {
      console.error("Error submitting aptitude score:", e);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  app.get("/api/aptitude/scores/:studentId", (req, res) => {
    const scores = db.prepare("SELECT * FROM aptitude_scores WHERE student_id = ? ORDER BY timestamp DESC").all(req.params.studentId);
    res.json(scores);
  });

  // Experts & Availability
  app.get("/api/experts", (req, res) => {
    const role = req.query.role;
    let experts;
    if (role) {
      experts = db.prepare("SELECT id, name, expertise, bio FROM users WHERE role = 'expert' AND expertise = ?").all(role);
    } else {
      experts = db.prepare("SELECT id, name, expertise, bio FROM users WHERE role = 'expert'").all();
    }
    res.json(experts);
  });

  app.post("/api/availability", (req, res) => {
    const { expert_id, slots } = req.body; // slots: [{start_time, end_time}]
    const deleteOld = db.prepare("DELETE FROM availability WHERE expert_id = ? AND status = 'available'");
    const insert = db.prepare("INSERT INTO availability (expert_id, start_time, end_time) VALUES (?, ?, ?)");
    
    const transaction = db.transaction((expertId, slotsArray) => {
      deleteOld.run(expertId);
      for (const slot of slotsArray) {
        insert.run(expertId, slot.start_time, slot.end_time);
      }
    });
    
    transaction(expert_id, slots);
    res.json({ success: true });
  });

  app.get("/api/availability/:expertId", (req, res) => {
    const slots = db.prepare("SELECT * FROM availability WHERE expert_id = ?").all(req.params.expertId);
    res.json(slots);
  });

  // Bookings
  app.post("/api/bookings", (req, res) => {
    const { student_id, expert_id, role, start_time, end_time, slot_id } = req.body;
    const meet_link = `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
    
    const info = db.prepare("INSERT INTO bookings (student_id, expert_id, role, start_time, end_time, meet_link) VALUES (?, ?, ?, ?, ?, ?)").run(student_id, expert_id, role, start_time, end_time, meet_link);
    db.prepare("UPDATE availability SET status = 'booked' WHERE id = ?").run(slot_id);
    
    res.json({ id: info.lastInsertRowid, meet_link });
  });

  app.get("/api/bookings/student/:studentId", (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, u.name as expert_name, u.expertise as expert_role 
      FROM bookings b 
      JOIN users u ON b.expert_id = u.id 
      WHERE b.student_id = ?
    `).all(req.params.studentId);
    res.json(bookings);
  });

  app.get("/api/bookings/expert/:expertId", (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, u.name as student_name, u.email as student_email, u.bio as student_bio, 
             u.photo_url as student_photo, u.resume_url as student_resume, 
             u.github_url as student_github, u.linkedin_url as student_linkedin,
             u.college as student_college, u.city as student_city, u.state as student_state,
             u.skills as student_skills, u.grad_year as student_grad_year
      FROM bookings b 
      JOIN users u ON b.student_id = u.id 
      WHERE b.expert_id = ?
    `).all(req.params.expertId);
    res.json(bookings);
  });

  app.post("/api/bookings/:id/join", (req, res) => {
    const { role } = req.body;
    if (role === 'expert') {
      db.prepare("UPDATE bookings SET expert_joined = 1 WHERE id = ?").run(req.params.id);
    }
    const booking = db.prepare("SELECT expert_joined FROM bookings WHERE id = ?").get(req.params.id);
    res.json(booking);
  });

  app.post("/api/bookings/:id/rate", (req, res) => {
    const { rating, feedback } = req.body;
    db.prepare("UPDATE bookings SET rating = ?, feedback = ?, status = 'completed' WHERE id = ?").run(rating, feedback, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/experts/:id/earnings", (req, res) => {
    const completed = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE expert_id = ? AND status = 'completed'").get(req.params.id);
    const totalEarnings = (completed.count || 0) * 50; // $50 per session
    res.json({ total: totalEarnings, count: completed.count });
  });

  app.get("/api/experts/:id/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT b.rating, b.feedback, b.start_time, u.name as student_name 
      FROM bookings b 
      JOIN users u ON b.student_id = u.id 
      WHERE b.expert_id = ? AND b.rating IS NOT NULL
      ORDER BY b.start_time DESC
    `).all(req.params.id);
    res.json(reviews);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
