import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Function to get all tasks
 */
export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await prisma.task.findMany();

    res.json({
      meta: {
        count: tasks.length,
        title: 'All Tasks'
      },
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}
