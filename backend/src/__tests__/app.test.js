import request from 'supertest';
import app from '../app.js';

describe('API Boilerplate', () => {
  it('GET / should return boilerplate message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Backend Boilerplate Running');
  });

  it('404 handler should return error for unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', true);
  });
});
