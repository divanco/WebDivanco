import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

describe('Password recovery and reset', () => {
  const testEmail = 'recoveruser@example.com';
  const testPassword = 'recoverpass123';
  let token;

  beforeAll(async () => {
    // Crear usuario para pruebas
    await User.destroy({ where: { username: testEmail } });
    await request(app)
      .post('/auth/register')
      .send({ username: testEmail, password: testPassword });
  });

  it('POST /auth/recover-password should send recovery email', async () => {
    const res = await request(app)
      .post('/auth/recover-password')
      .send({ username: testEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Recovery email sent');
    // Simular obtención de token (en test real, interceptar email)
    token = jwt.sign({ id: res.body.id || 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('POST /auth/reset-password should reset password with valid token', async () => {
    // Obtener el id real del usuario
    const user = await User.findOne({ where: { username: testEmail } });
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token, password: 'newpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password reset successful');
  });

  it('POST /auth/login should authenticate with new password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: testEmail, password: 'newpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /auth/reset-password should fail with invalid token', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'invalidtoken', password: 'failpass' });
    expect(res.statusCode).toBe(401);
  });
});
