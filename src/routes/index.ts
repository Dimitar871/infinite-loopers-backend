import Express, { Router } from 'express';
import { getClient, getClients } from '../controllers/clientsController.js';
import { getTasks } from '../controllers/tasksController.js'; // <--- 1. Import your new controller

const router: Router = Express.Router();

// Clients Routes
router.get('/clients', getClients);
router.get('/clients/:id', getClient);

// Tasks Routes
router.get('/tasks', getTasks); // <--- 2. Add this route

export default router;
