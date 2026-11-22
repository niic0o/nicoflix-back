import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';
import { ValidationError } from '@utils/errors';

type ValidationSource = 'body' | 'query' | 'params';

export function validate(schema: AnyZodObject, source: ValidationSource = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[source] as unknown;
      await schema.parseAsync(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Datos de entrada inválidos', error.flatten().fieldErrors));
      } else {
        next(error);
      }
    }
  };
}

export function validateAll(schemas: Partial<Record<ValidationSource, AnyZodObject>>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationPromises = Object.entries(schemas).map(([source, schema]) =>
        schema.parseAsync(req[source as ValidationSource] as unknown)
      );
      await Promise.all(validationPromises);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Datos de entrada inválidos', error.flatten().fieldErrors));
      } else {
        next(error);
      }
    }
  };
}