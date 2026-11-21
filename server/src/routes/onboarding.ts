import { Router } from 'express';
import { onboardingTasks } from '../data.js';
import { authMiddleware } from '../middleware/auth.js';
import { persist } from '../store.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  const { employeeId } = req.query;
  if (employeeId) {
    return res.json(onboardingTasks.filter(t => t.employeeId === employeeId));
  }
  res.json(onboardingTasks);
});

router.get('/:id', (req, res) => {
  const task = onboardingTasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

router.post('/', (req, res) => {
  const newTask = {
    id: String(Math.max(...onboardingTasks.map(t => parseInt(t.id) || 0), 0) + 1),
    ...req.body,
  };
  onboardingTasks.push(newTask);
  persist('onboardingTasks', onboardingTasks);
  res.status(201).json(newTask);
});

router.put('/:id', (req, res) => {
  const index = onboardingTasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  onboardingTasks[index] = { ...onboardingTasks[index], ...req.body };
  persist('onboardingTasks', onboardingTasks);
  res.json(onboardingTasks[index]);
});

router.delete('/:id', (req, res) => {
  const index = onboardingTasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  onboardingTasks.splice(index, 1);
  persist('onboardingTasks', onboardingTasks);
  res.json({ message: 'Task deleted' });
});

export default router;
