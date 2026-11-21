import { Router } from 'express';
import { users } from '../data.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { persist } from '../store.js';

const router = Router();

router.use(authMiddleware);

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
