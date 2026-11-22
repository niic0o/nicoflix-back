import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodTypeAny } from 'zod';
import { ZodError } from 'zod';
import { ValidationError } from '@utils/errors';

const VALIDATION_SOURCES = ['body', 'query', 'params'] as const;

type ValidationSource = (typeof VALIDATION_SOURCES)[number];

function isValidationSource(key: string): key is ValidationSource {
  return (VALIDATION_SOURCES as readonly string[]).includes(key);
}

function getShape(schema: AnyZodObject): Record<string, ZodTypeAny> {
  return schema.shape as Record<string, ZodTypeAny>;
}

function handleError(error: unknown, next: NextFunction): void {
  if (error instanceof ZodError) {
    next(new ValidationError('Datos de entrada inválidos', error.flatten().fieldErrors));
    return;
  }
  next(error);
}

/**
 * Valida una petición contra un schema Zod.
 * Acepta tanto schemas "planos" (validados contra `source`) como schemas
 * compuestos por fuente (`{ body, params, query }`), validando cada clave
 * contra la parte correspondiente de la petición.
 */
export function validate(schema: AnyZodObject, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const shape = getShape(schema);
    const wrappedSources = Object.keys(shape).filter(isValidationSource);

    const validations: Array<Promise<unknown>> =
      wrappedSources.length > 0
        ? wrappedSources.map((src) => {
            const subSchema = shape[src];
            return subSchema ? (subSchema.parseAsync(req[src] as unknown) as Promise<unknown>) : Promise.resolve();
          })
        : [schema.parseAsync(req[source] as unknown) as Promise<unknown>];

    Promise.all(validations)
      .then(() => next())
      .catch((error: unknown) => handleError(error, next));
  };
}

/**
 * Valida varias fuentes de la petición con schemas planos independientes.
 * Ejemplo: `validateAll({ body: createUserSchema, params: idParamSchema })`.
 */
export function validateAll(schemas: Partial<Record<ValidationSource, AnyZodObject>>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validations = Object.entries(schemas).map(
      ([source, schema]) => schema.parseAsync(req[source as ValidationSource] as unknown) as Promise<unknown>
    );

    Promise.all(validations)
      .then(() => next())
      .catch((error: unknown) => handleError(error, next));
  };
}
