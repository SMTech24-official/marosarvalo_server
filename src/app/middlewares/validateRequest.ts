import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
