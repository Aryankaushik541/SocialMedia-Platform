const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

const app = require('../app');
let mongod;

const registerAgent = async (u) => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send(u);
  return agent;
};

beforeAll(async () => { mongod = await MongoMemoryServer.create(); await mongoose.connect(mongod.getUri()); });
afterAll(async () => { await mongoose.disconnect(); if (mongod) await mongod.stop(); });
afterEach(async () => { const c = mongoose.connection.collections; for (const k in c) await c[k].deleteMany(); });

describe('Social platform', () => {
  test('register, post, like and comment', async () => {
    const agent = await registerAgent({ name: 'Ann', username: 'ann', email: 'ann@x.com', password: 'secret1' });

    const post = await agent.post('/api/posts').send({ text: 'Hello world' });
    expect(post.statusCode).toBe(201);
    expect(post.body.author.username).toBe('ann');

    const like = await agent.post(`/api/posts/${post.body._id}/like`);
    expect(like.body.liked).toBe(true);
    expect(like.body.likesCount).toBe(1);

    const comment = await agent.post(`/api/posts/${post.body._id}/comments`).send({ text: 'nice' });
    expect(comment.statusCode).toBe(201);

    const comments = await agent.get(`/api/posts/${post.body._id}/comments`);
    expect(comments.body.comments.length).toBe(1);
  });

  test('follow system updates both users', async () => {
    const ann = await registerAgent({ name: 'Ann', username: 'ann', email: 'ann@x.com', password: 'secret1' });
    const bob = await registerAgent({ name: 'Bob', username: 'bob', email: 'bob@x.com', password: 'secret1' });

    const bobProfile = await ann.get('/api/users/bob');
    const bobId = bobProfile.body.user._id;

    const follow = await ann.post(`/api/users/${bobId}/follow`);
    expect(follow.body.following).toBe(true);
    expect(follow.body.followersCount).toBe(1);

    // Bob's post should now appear in Ann's feed
    await bob.post('/api/posts').send({ text: 'from bob' });
    const feed = await ann.get('/api/posts');
    expect(feed.body.posts.some((p) => p.text === 'from bob')).toBe(true);
  });

  test('cannot follow yourself', async () => {
    const ann = await registerAgent({ name: 'Ann', username: 'ann', email: 'ann@x.com', password: 'secret1' });
    const me = await ann.get('/api/auth/me');
    const res = await ann.post(`/api/users/${me.body.user._id}/follow`);
    expect(res.statusCode).toBe(400);
  });
});
