import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This function gets tasks for a specific user
export async function getTasks(req: Request, res: Response, next: NextFunction) {
	try {
		const userId = parseInt(req.params.userId);

		const tasks = await prisma.task.findMany({
			where: { UserId: userId },
			orderBy: { createdAt: 'desc' }
		});

		res.status(200).json({ success: true, tasks });
	} catch (err) {
		next(err);
	}
}

// This function creates a new task
export async function addTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, endDate, category, priority, UserId } = req.body;

    // Basic validation
    if (!title) {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const createdTask = await prisma.task.create({
      data: {
        UserId: Number(UserId),

        title,
        endDate: endDate ? new Date(endDate) : null,
        status: "Not Started",
        category: category || null,

        priority: priority || "Medium"
      }
    });

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task: createdTask
    });
  } catch (err) {
    next(err);
  }
}
