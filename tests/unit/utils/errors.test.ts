import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ValidationError,
  isAppError,
  isOperationalError,
} from '@utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('debe crear una instancia con mensaje, statusCode y isOperational', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('debe capturar stack trace', () => {
      const error = new AppError('Test error', 400);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('BadRequestError', () => {
    it('debe crear error con statusCode 400', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('debe usar mensaje por defecto', () => {
      const error = new BadRequestError();
      expect(error.message).toBe('Solicitud inválida');
    });

    it('debe aceptar details', () => {
      const error = new BadRequestError('Invalid', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('UnauthorizedError', () => {
    it('debe crear error con statusCode 401', () => {
      const error = new UnauthorizedError('Token invalid');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Token invalid');
    });

    it('debe usar mensaje por defecto', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('No autorizado');
    });
  });

  describe('ForbiddenError', () => {
    it('debe crear error con statusCode 403', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('debe crear error con statusCode 404', () => {
      const error = new NotFoundError('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('debe crear error con statusCode 409', () => {
      const error = new ConflictError('Email exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('InternalServerError', () => {
    it('debe crear error con statusCode 500', () => {
      const error = new InternalServerError('DB failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('debe crear error con statusCode 400', () => {
      const error = new ValidationError('Validation failed', { email: 'invalid' });
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ email: 'invalid' });
    });
  });

  describe('isAppError', () => {
    it('debe retornar true para instancias de AppError', () => {
      expect(isAppError(new AppError('test', 400))).toBe(true);
      expect(isAppError(new BadRequestError())).toBe(true);
      expect(isAppError(new NotFoundError())).toBe(true);
    });

    it('debe retornar false para Error nativo', () => {
      expect(isAppError(new Error('test'))).toBe(false);
    });

    it('debe retornar false para objetos planos', () => {
      expect(isAppError({ message: 'test', statusCode: 400 })).toBe(false);
    });
  });

  describe('isOperationalError', () => {
    it('debe retornar true para AppError operacionales', () => {
      expect(isOperationalError(new BadRequestError())).toBe(true);
    });

    it('debe retornar false para Error nativo', () => {
      expect(isOperationalError(new Error('test'))).toBe(false);
    });
  });
});