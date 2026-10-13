import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = path.resolve('data', 'database.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper: Read database from disk
function readDatabase(): any {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Database] Read error:', err);
  }
  return {
    machines: [],
    stations: [],
    users: [],
    updatedAt: Date.now(),
  };
}

// Helper: Save database to disk safely
function saveDatabase(db: any): boolean {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db.updatedAt = Date.now();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('[Database] Save error:', err);
    return false;
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health & Status check for client polling
app.get('/api/status', (req, res) => {
  const db = readDatabase();
  res.json({
    status: 'online',
    version: '1.0.0',
    serverTime: new Date().toISOString(),
    updatedAt: db.updatedAt || Date.now(),
    machineCount: Array.isArray(db.machines) ? db.machines.length : 0,
    userCount: Array.isArray(db.users) ? db.users.length : 0,
  });
});

// Full state sync (pull)
app.get('/api/sync', (req, res) => {
  const db = readDatabase();
  res.json({
    machines: db.machines || [],
    stations: db.stations || [],
    users: db.users || [],
    updatedAt: db.updatedAt || Date.now(),
  });
});

// Full state sync (push from client)
app.post('/api/sync', (req, res) => {
  const { machines, users, stations } = req.body;
  const db = readDatabase();

  if (Array.isArray(machines)) {
    db.machines = machines;
  }
  if (Array.isArray(users)) {
    db.users = users;
  }
  if (Array.isArray(stations)) {
    db.stations = stations;
  }

  saveDatabase(db);
  res.json({ success: true, updatedAt: db.updatedAt });
});

// Get all machines
app.get('/api/machines', (req, res) => {
  const db = readDatabase();
  res.json(db.machines || []);
});

// Replace all machines
app.post('/api/machines', (req, res) => {
  const machines = req.body;
  if (!Array.isArray(machines)) {
    return res.status(400).json({ error: 'Body must be an array of machines' });
  }
  const db = readDatabase();
  db.machines = machines;
  saveDatabase(db);
  res.json({ success: true, count: machines.length, updatedAt: db.updatedAt });
});

// Get single machine
app.get('/api/machines/:id', (req, res) => {
  const db = readDatabase();
  const machine = (db.machines || []).find((m: any) => m.id === req.params.id || m.code === req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  res.json(machine);
});

// Update single machine (partial or full)
app.put('/api/machines/:id', (req, res) => {
  const db = readDatabase();
  const index = (db.machines || []).findIndex(
    (m: any) => m.id === req.params.id || m.code === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  db.machines[index] = { ...db.machines[index], ...req.body };
  saveDatabase(db);
  res.json({ success: true, machine: db.machines[index], updatedAt: db.updatedAt });
});

// Add maintenance record to machine
app.post('/api/machines/:id/maintenance', (req, res) => {
  const db = readDatabase();
  const machine = (db.machines || []).find(
    (m: any) => m.id === req.params.id || m.code === req.params.id
  );

  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const record = req.body;
  if (!Array.isArray(machine.maintenanceHistory)) {
    machine.maintenanceHistory = [];
  }
  machine.maintenanceHistory.unshift(record);
  machine.lastMaintenanceDate = record.date || new Date().toLocaleDateString('es-ES');
  machine.lastMaintenanceType = record.type || 'Preventivo';

  saveDatabase(db);
  res.json({ success: true, machine, updatedAt: db.updatedAt });
});

// Report failure for machine
app.post('/api/machines/:id/failure', (req, res) => {
  const db = readDatabase();
  const machine = (db.machines || []).find(
    (m: any) => m.id === req.params.id || m.code === req.params.id
  );

  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const failure = req.body;
  if (!Array.isArray(machine.failures)) {
    machine.failures = [];
  }
  machine.failures.unshift(failure);
  machine.status = failure.severity === 'Crítica' ? 'PARADA' : 'REVISION';

  saveDatabase(db);
  res.json({ success: true, machine, updatedAt: db.updatedAt });
});

// Add 5S audit to machine
app.post('/api/machines/:id/audit', (req, res) => {
  const db = readDatabase();
  const machine = (db.machines || []).find(
    (m: any) => m.id === req.params.id || m.code === req.params.id
  );

  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const audit = req.body;
  if (!Array.isArray(machine.audits5S)) {
    machine.audits5S = [];
  }
  machine.audits5S.unshift(audit);

  saveDatabase(db);
  res.json({ success: true, machine, updatedAt: db.updatedAt });
});

// Add production log to machine
app.post('/api/machines/:id/production', (req, res) => {
  const db = readDatabase();
  const machine = (db.machines || []).find(
    (m: any) => m.id === req.params.id || m.code === req.params.id
  );

  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const log = req.body;
  if (!Array.isArray(machine.productionLogs)) {
    machine.productionLogs = [];
  }
  machine.productionLogs.unshift(log);
  machine.totalHours = (machine.totalHours || 0) + (Number(log.hoursProduced) || 0);

  saveDatabase(db);
  res.json({ success: true, machine, updatedAt: db.updatedAt });
});

// Get users
app.get('/api/users', (req, res) => {
  const db = readDatabase();
  res.json(db.users || []);
});

// Update users
app.post('/api/users', (req, res) => {
  const users = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Body must be an array of users' });
  }
  const db = readDatabase();
  db.users = users;
  saveDatabase(db);
  res.json({ success: true, updatedAt: db.updatedAt });
});

// Reset database
app.post('/api/reset', (req, res) => {
  const backupSeed = path.resolve('data', 'database.json');
  if (fs.existsSync(backupSeed)) {
    const raw = fs.readFileSync(backupSeed, 'utf-8');
    const db = JSON.parse(raw);
    db.updatedAt = Date.now();
    saveDatabase(db);
    return res.json({ success: true, message: 'Database reset to initial demo state' });
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// Frontend Integration (Vite in dev, static files in prod)
// -------------------------------------------------------------
async function startServer() {
  const distPath = path.resolve('dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.NODE_ENV !== 'production' && !hasDist;

  if (isDev) {
    // Dynamic import of Vite in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built dist directory
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TAG OPS Server] Running on http://0.0.0.0:${PORT} (${isDev ? 'Development' : 'Production'})`);
  });
}

startServer().catch((err) => {
  console.error('[TAG OPS Server] Startup failed:', err);
  process.exit(1);
});
