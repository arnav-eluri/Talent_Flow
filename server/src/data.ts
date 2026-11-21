import bcrypt from 'bcryptjs';
import { load } from './store.js';
import type { User, Candidate, Interview, Employee, OnboardingTask, OffboardingTask, Document } from './types.js';

const hashedPassword = bcrypt.hashSync('demo123', 10);

export const users: User[] = load('users', [
  {
    id: '1',
    email: 'sarah.johnson@company.com',
    password: hashedPassword,
    name: 'Sarah Johnson',
    role: 'hr',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    department: 'Human Resources',
  },
  {
    id: '2',
    email: 'arnav.eluri@company.com',
    password: hashedPassword,
    name: 'Arnav Eluri',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arnav&gender=male',
    department: 'Engineering',
  },
]);

export const candidates: Candidate[] = load('candidates', []);
export const interviews: Interview[] = load('interviews', []);
export const employees: Employee[] = load('employees', []);
export const onboardingTasks: OnboardingTask[] = load('onboardingTasks', []);
export const offboardingTasks: OffboardingTask[] = load('offboardingTasks', []);
export const documents: Document[] = load('documents', []);
