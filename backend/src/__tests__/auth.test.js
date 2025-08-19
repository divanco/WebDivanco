import request from 'supertest';
import app from '../app.js';

describe('Auth endpoints', () => {
  it('POST /auth/register should create user and send confirmation email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser@example.com', password: 'testpass123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered');
    expect(res.body.user).toHaveProperty('username', 'testuser@example.com');
    expect(res.body.user).toHaveProperty('role', 'user');
  });

  it('POST /auth/register should not allow duplicate user', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'testuser@example.com', password: 'testpass123' });
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser@example.com', password: 'testpass123' });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('POST /auth/login should authenticate user and return token', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'loginuser@example.com', password: 'loginpass123' });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'loginuser@example.com', password: 'loginpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /auth/login should fail with wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'failuser@example.com', password: 'failpass123' });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'failuser@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
