// src/routes/index.ts
import Express, { Router } from 'express';
import { getClient, getClients } from '../controllers/clientsController.js';
import { register, login } from '../controllers/authController.js';
import { addTask, getTasks } from '../controllers/tasksController.ts';

const router: Router = Express.Router();

router.get('/clients', getClients);
router.get('/clients/:id', getClient);

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/tasks/:userId', getTasks);
router.post('/tasks', addTask);

export default router;
