import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js'; 
import Post from '../../models/post/post.js';
import postlike from '../../models/post/postlike.js';
import postmedia from '../../models/post/postmedia.js';

// Fake dữ liệu userId để giả lập đăng nhập
const fakeUserId = new mongoose.Types.ObjectId();

// Mô phỏng session
let token;
let userId;

// Mock User and Chat IDs for testing
const mockUserId = new mongoose.Types.ObjectId();
const mockReceiverId = new mongoose.Types.ObjectId();

before(async () => {
  // Register and log in a test user to obtain the token

  const loginResponse = await request(app)
    .post('/login')
    .send({
      username: 'admin',
      password: 'Hung123456@',
    });
  userId = loginResponse.body.userId;
  token = loginResponse.body.token; // Store token for use in tests
});
describe('Post API Tests', () => {

  // Test GET /post (getpost)
  describe('GET /post', () => {
    it('should return the post of the user', async () => {
      const postData = {
        Author: fakeUserId,
        content: 'This is a test post'
      };

      const post = await Post.create(postData);

      const response = await request(app)
        .get('/post')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send();

      expect(response.status).to.equal(200);  // Correct assertion
      expect(response.body.message).to.equal('List your post');  // Correct assertion
      expect(response.body.post.content).to.equal(postData.content);  // Correct assertion

      await post.remove();
    });

    it('should return 400 if no post found', async () => {
      const response = await request(app)
        .get('/post')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send();

      expect(response.status).to.equal(400);  // Correct assertion
      expect(response.body.message).to.equal('No post found');  // Correct assertion
    });
  });

  // Test POST /post (pushpost)
  describe('POST /post', () => {
    it('should create a personal post', async () => {
      const postData = {
        content: 'This is a personal post',
        mediaIds: [], // Fake mediaIds for the post
        communityId: null
      };

      const response = await request(app)
        .post('/post')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send(postData);

      expect(response.status).to.equal(200);  // Correct assertion
      expect(response.body.message).to.equal('Personal post success');  // Correct assertion
    });

    it('should create a community post', async () => {
      const postData = {
        content: 'This is a community post',
        mediaIds: [], // Fake mediaIds for the post
        communityId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/post')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send(postData);

      expect(response.status).to.equal(200);  // Correct assertion
      expect(response.body.message).to.equal('Community post success');  // Correct assertion
    });

    it('should return error if communityId is missing for community post', async () => {
      const postData = {
        content: 'This is a community post without communityId',
        mediaIds: [],
        communityId: null
      };

      const response = await request(app)
        .post('/post')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send(postData);

      expect(response.status).to.equal(400);  // Correct assertion
      expect(response.body.message).to.equal('Community ID is required for community posts.');  // Correct assertion
    });
  });

  // Test POST /like (likepost)
  describe('POST /like', () => {
    it('should like a post', async () => {
      const postData = {
        content: 'Test post to like',
        mediaIds: [],
        communityId: null
      };

      const post = await Post.create(postData);

      const likeData = {
        postId: post._id
      };

      const response = await request(app)
        .post('/like')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send(likeData);

      expect(response.status).to.equal(200);  // Correct assertion
      expect(response.body.message).to.equal('like post success');  // Correct assertion

      // Clean up by removing the post and like after the test
      await post.remove();
      await postlike.deleteMany({ post: post._id });
    });

    it('should remove like if already liked', async () => {
      const postData = {
        content: 'Test post to remove like',
        mediaIds: [],
        communityId: null
      };

      const post = await Post.create(postData);

      // Simulate a like being created
      const likeData = {
        postId: post._id
      };

      await postlike.create({
        post: post._id,
        User: fakeUserId
      });

      const response = await request(app)
        .post('/like')
        .set('Cookie', [`userId=${fakeUserId}`])  // Mock session cookie
        .send(likeData);

      expect(response.status).to.equal(200);  // Correct assertion
      expect(response.body.message).to.equal('like post success');  // Correct assertion

      // Clean up by removing the post and like after the test
      await post.remove();
      await postlike.deleteMany({ post: post._id });
    });
  });
});
