// src/routes/index.ts
import Express, { Router } from 'express';
import { getClient, getClients } from '../controllers/clientsController.js';
import { register, login } from '../controllers/authController.js';

const router: Router = Express.Router();

router.get('/clients', getClients);
router.get('/clients/:id', getClient);

router.post('/auth/register', register);
router.post('/auth/login', login);

export default router;
