import { Router } from 'express';
import { users } from '../data.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { persist } from '../store.js';

const router = Router();

router.use(authMiddleware);

// HR-only: list all users
router.get('/', (req: AuthRequest, res) => {
  if (req.user?.role !== 'hr') return res.status(403).json({ error: 'Forbidden' });
  res.json({ users: users.map(({ password: _, ...u }) => u) });
});

// HR-only: update employee permissions
router.patch('/:id/permissions', (req: AuthRequest, res) => {
  if (req.user?.role !== 'hr') return res.status(403).json({ error: 'Forbidden' });
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  if (users[index].role !== 'employee') return res.status(400).json({ error: 'Permissions can only be set for employees' });
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return res.status(400).json({ error: 'permissions must be an array' });
  users[index].permissions = permissions;
  persist('users', users);
  const { password: _, ...safe } = users[index];
  res.json({ user: safe });
});

// HR-only: change a user's role
router.patch('/:id/role', (req: AuthRequest, res) => {
  if (req.user?.role !== 'hr') return res.status(403).json({ error: 'Forbidden' });
  const { role } = req.body;
  if (!['hr', 'manager', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  users[index].role = role;
  persist('users', users);
  const { password: _, ...safe } = users[index];
  res.json({ user: safe });
});

router.get('/me', (req: AuthRequest, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

router.put('/me', (req: AuthRequest, res) => {
  const index = users.findIndex(u => u.id === req.userId);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { name, email } = req.body;
  if (email && email !== users[index].email) {
    if (users.some(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    users[index].email = email;
  }
  if (name) users[index].name = name;
  persist('users', users);
  const { password: _, ...safe } = users[index];
  res.json({ user: safe });
});

export default router;
