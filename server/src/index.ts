import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './store.js';

dotenv.config();

// Must initialise SQLite before any module that calls load() / persist()
await initDb();

const { default: authRoutes } = await import('./routes/auth.js');
const { default: candidatesRoutes } = await import('./routes/candidates.js');
const { default: interviewsRoutes } = await import('./routes/interviews.js');
const { default: employeesRoutes } = await import('./routes/employees.js');
const { default: analyticsRoutes } = await import('./routes/analytics.js');
const { default: documentsRoutes } = await import('./routes/documents.js');
const { default: onboardingRoutes } = await import('./routes/onboarding.js');
const { default: offboardingRoutes } = await import('./routes/offboarding.js');
const { default: dashboardRoutes } = await import('./routes/dashboard.js');
const { default: usersRoutes } = await import('./routes/users.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/offboarding', offboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'TalentFlow API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      candidates: '/api/candidates',
      interviews: '/api/interviews',
      employees: '/api/employees',
      onboarding: '/api/onboarding',
      offboarding: '/api/offboarding',
      documents: '/api/documents',
      analytics: '/api/analytics',
      dashboard: '/api/dashboard',
    },
    documentation: 'See server/README.md for full API documentation',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalentFlow API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
