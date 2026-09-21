const request = require('supertest');
const app = require('../src/app');
const { connectDb, closeDb, clearDb } = require('./testUtils');

process.env.JWT_SECRET = 'test_secret';

let user1Token, user2Token;

beforeAll(async () => await connectDb());
afterAll(async () => await closeDb());
beforeEach(async () => {
  await clearDb();

  const res1 = await request(app).post('/api/auth/register').send({
    name: 'User One', email: 'user1@example.com', password: 'password123'
  });
  user1Token = res1.body.token;

  const res2 = await request(app).post('/api/auth/register').send({
    name: 'User Two', email: 'user2@example.com', password: 'password123'
  });
  user2Token = res2.body.token;
});

describe('Expense Routes', () => {
  it('should prevent creating expense without token (401)', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        amount: 50,
        category: 'Food'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toMatch(/Not authorized/);
  });

  it('should fail validation on negative amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: -10,
        category: 'Food'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('should not allow user to read another user\'s expenses', async () => {
    // User 1 creates expense
    const resCreate = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 100,
        category: 'Transport'
      });
    
    expect(resCreate.statusCode).toBe(201);

    // User 2 attempts to get User 1's expenses via list endpoint
    const resGet = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(resGet.statusCode).toBe(200);
    expect(resGet.body.items).toHaveLength(0); // Should be empty for User 2
  });
});
