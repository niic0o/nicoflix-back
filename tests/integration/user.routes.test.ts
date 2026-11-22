import request from 'supertest';
import { createApp } from '@/app';

describe('User routes validation', () => {
  const app = createApp();

  it('POST /api/users con body inválido retorna 400 con detalles', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'no-es-email', password: '123', name: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.details).toBeDefined();
  });

  it('GET /api/users/:id con ObjectId inválido retorna 400', async () => {
    const response = await request(app).get('/api/users/123');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('expone los usuarios en /api/users y no en /api/api/users', async () => {
    const response = await request(app).get('/api/api/users');

    expect(response.status).toBe(404);
  });
});
