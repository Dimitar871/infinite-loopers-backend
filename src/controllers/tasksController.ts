import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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


export async function addTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, endDate, category } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const task = {
      UserId: 1,
      title,
      endDate: endDate ? new Date(endDate) : null,
      status: "Not Started",
      category: category || null,
    };

    const createdTask = await prisma.task.create({ data: task });

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task: createdTask
    });
  } catch (err) {
    next(err);
  }
}
