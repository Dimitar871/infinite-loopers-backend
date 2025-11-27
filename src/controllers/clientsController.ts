import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client'; // Import 'User' type from Prisma

const prisma = new PrismaClient();

/**
 * Interface for the response object
 * (I updated this to use 'User' instead of 'Client')
 */
interface UserResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: User[]
}

/**
 * Function to get all users
 */
export async function getClients(req: Request, res: Response): Promise<void> {
  // FIX: Changed prisma.client to prisma.user
  const users: User[] = await prisma.user.findMany();

  const response: UserResponse = {
    meta: {
      count: users.length,
      title: 'All users',
      url: req.url
    },
    data: users
  };

  res.status(200).send(response);
}

/**
 * Function to get a user by id
 */
export async function getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
 const id: number = parseInt(req.params.id);

  try {
    // FIX: Changed prisma.client to prisma.user
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: id
      }
    });

    console.log('user:', user);

    if (!user) {
      // Using a standard error throw
      throw new Error('User not found');
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err); // forwards to error handler
  }
}
