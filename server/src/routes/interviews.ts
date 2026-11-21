import { Router } from 'express';
import { interviews } from '../data.js';
import { authMiddleware } from '../middleware/auth.js';
import { persist } from '../store.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json(interviews);
});

router.get('/:id', (req, res) => {
  const interview = interviews.find(i => i.id === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  res.json(interview);
});

router.post('/', (req, res) => {
  const newInterview = {
    id: String(Math.max(...interviews.map(i => parseInt(i.id) || 0), 0) + 1),
    ...req.body,
  };
  interviews.push(newInterview);
  persist('interviews', interviews);
  res.status(201).json(newInterview);
});

router.put('/:id', (req, res) => {
  const index = interviews.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  interviews[index] = { ...interviews[index], ...req.body };
  persist('interviews', interviews);
  res.json(interviews[index]);
});

router.post('/:id/feedback', (req, res) => {
  const index = interviews.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  interviews[index] = {
    ...interviews[index],
    feedback: req.body,
    status: 'completed',
  };
  persist('interviews', interviews);
  res.json(interviews[index]);
});

router.delete('/:id', (req, res) => {
  const index = interviews.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  interviews.splice(index, 1);
  persist('interviews', interviews);
  res.json({ message: 'Interview deleted' });
});

export default router;
