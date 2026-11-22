import request from 'supertest';
import express from 'express';
import { createApp } from '@/app';
import { connectDatabase, disconnectDatabase, getConnectionStatus } from '@config/database';

describe('Health Check Integration', () => {
  let app: express.Application;
  let dbConnected = false;

  beforeAll(async () => {
    app = createApp();
    try {
      await connectDatabase();
      dbConnected = getConnectionStatus();
    } catch {
      dbConnected = false;
    }
  }, 15000);

  afterAll(async () => {
    if (dbConnected) {
      await disconnectDatabase();
    }
  });

  describe('GET /api/health', () => {
    it('debe responder al endpoint de health', async () => {
      const response = await request(app).get('/api/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body.success).toBe(dbConnected);

      const responseData = dbConnected ? response.body.data : response.body.error.details;
      expect(responseData.timestamp).toBeDefined();
      expect(responseData.uptime).toBeGreaterThan(0);
      expect(responseData.memory).toBeDefined();
    });

    it('debe retornar timestamp en formato ISO', async () => {
      const response = await request(app).get('/api/health');

      const responseData = dbConnected ? response.body.data : response.body.error.details;
      const timestamp = responseData.timestamp;
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('debe indicar estado de base de datos', async () => {
      const response = await request(app).get('/api/health');

      const responseData = dbConnected ? response.body.data : response.body.error.details;
      expect(responseData.database).toBeDefined();
      expect(['connected', 'disconnected']).toContain(responseData.database);
    });
  });
});