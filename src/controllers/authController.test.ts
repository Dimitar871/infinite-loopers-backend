import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@prisma/client";

// Mock the dependencies before importing the controller
const mockUserFindFirst = jest.fn<(...args: any[]) => Promise<User | null>>();
const mockUserCreate = jest.fn<(...args: any[]) => Promise<User>>();
const mockBcryptHash = jest.fn<(...args: any[]) => Promise<string>>();
const mockBcryptCompare = jest.fn<(...args: any[]) => Promise<boolean>>();

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findFirst: mockUserFindFirst,
      create: mockUserCreate,
    },
  })),
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
}));

// Import the controller after setting up mocks
const { register } = await import("./authController.js");

describe("register", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset request, response, and next function
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any as Response;

    mockNext = jest.fn() as NextFunction;

    // Clear mock call history
    mockUserFindFirst.mockClear();
    mockUserCreate.mockClear();
    mockBcryptHash.mockClear();
    mockBcryptCompare.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should return 400 when username is missing", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.body = {
        username: "testuser",
        password: "password123",
      };

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 400 when password is missing", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
      };

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 400 when all fields are missing", async () => {
      mockRequest.body = {};

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });
  });

  describe("User Existence Validation", () => {
    it("should return 400 when user with same email already exists", async () => {
      mockRequest.body = {
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
      };

      const existingUser: User = {
        id: 1,
        createdAt: new Date(),
        username: "existinguser",
        email: "existing@example.com",
        password: "hashedpassword",
      };

      mockUserFindFirst.mockResolvedValue(existingUser);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: "existing@example.com" }, { username: "newuser" }],
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Username aready taken",
      });
    });

    it("should return 400 when user with same username already exists", async () => {
      mockRequest.body = {
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
      };

      const existingUser: User = {
        id: 1,
        createdAt: new Date(),
        username: "existinguser",
        email: "old@example.com",
        password: "hashedpassword",
      };

      mockUserFindFirst.mockResolvedValue(existingUser);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Username aready taken",
      });
    });
  });

  describe("Successful Registration", () => {
    it("should create a new user and return 201", async () => {
      mockRequest.body = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const hashedPassword = "$2a$10$hashedpassword";
      const createdUser: User = {
        id: 1,
        createdAt: new Date(),
        username: "newuser",
        email: "newuser@example.com",
        password: hashedPassword,
      };

      mockUserFindFirst.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockUserCreate.mockResolvedValue(createdUser);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBcryptHash).toHaveBeenCalledWith("password123", 10);
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          username: "newuser",
          email: "newuser@example.com",
          password: hashedPassword,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "User registered successfully",
        user: {
          id: 1,
          username: "newuser",
          email: "newuser@example.com",
        },
      });
    });

    it("should not include password in the response", async () => {
      mockRequest.body = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const hashedPassword = "$2a$10$hashedpassword";
      const createdUser: User = {
        id: 1,
        createdAt: new Date(),
        username: "newuser",
        email: "newuser@example.com",
        password: hashedPassword,
      };

      mockUserFindFirst.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockUserCreate.mockResolvedValue(createdUser);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as {
        success: boolean;
        message: string;
        user?: { id: number; username: string; email: string; password?: string };
      };
      expect(jsonCall.user).toBeDefined();
      expect(jsonCall.user?.password).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should call next with error when database query fails", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const dbError = new Error("Database connection failed");
      mockUserFindFirst.mockRejectedValue(dbError);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it("should call next with error when password hashing fails", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const hashError = new Error("Hashing failed");
      mockUserFindFirst.mockResolvedValue(null);
      mockBcryptHash.mockRejectedValue(hashError);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(hashError);
    });

    it("should call next with error when user creation fails", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const createError = new Error("User creation failed");
      mockUserFindFirst.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue("$2a$10$hashedpassword");
      mockUserCreate.mockRejectedValue(createError);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(createError);
    });
  });
});
