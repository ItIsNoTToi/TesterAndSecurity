import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js'; 
import Message from '../../models/message/message.js';

let token;
let userId;

// Mock User and Chat IDs for testing
const mockUserId = new mongoose.Types.ObjectId();
const mockChatId = new mongoose.Types.ObjectId();

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

describe('Message API', () => {

  describe('POST /sendMessage', () => {
    it('should create a new message with valid token', async () => {
      const res = await request(app)
        .post('/message/sendmessage')
        .set('Authorization', `Bearer ${token}`) // Add token to headers
        .send({
          content: "Hello, this is a test message!",
          chatId: '672efdffcda5fb545398bb4e',
          senderId: userId
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body.data.content).to.equal("Hello, this is a test message!");
    });

    it('should return error if content exceeds 500 characters', async () => {
      const res = await request(app)
        .post('/message/sendmessage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'a'.repeat(501),
          chatId: '672efdffcda5fb545398bb4e'
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Tin nhắn vượt quá giới hạn ký tự, vui lòng rút ngắn tin nhắn");
    });

    it('should return unauthorized error if token is missing', async () => {
      const res = await request(app)
        .post('/message/sendmessage')
        .send({
          content: "This message should not be sent",
          chatId: '672efdffcda5fb545398bb4e'
        });

      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Access denied. No token provided.");
    });
  });

  describe('GET /getMessage', () => {
    it('should get messages for a given chat with valid token', async () => {
      // Seed a message

      const res = await request(app)
        .get('/message')
        .set('Authorization', `Bearer ${token}`)
        .send({ chatId: '672efdffcda5fb545398bb4e'});

      expect(res.statusCode).to.equal(200);
      expect(res.body.data.length).to.beGreaterThan(0);
      expect(res.body.data[0].content).to.equal(message.content);
    });

    it('should return 404 if chat does not exist', async () => {
      const res = await request(app)
        .get('/message')
        .set('Authorization', `Bearer ${token}`)
        .send({ chatId: new mongoose.Types.ObjectId() });

      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Chat not found");
    });
  });

  describe('POST /messagelike', () => {
    it('should like a message with valid token', async () => {
      const message = await Message.create({
        content: 'Like this message!',
        chatId: '672efdffcda5fb545398bb4e',
        senderId: '672af038edb1baeb8d1d1ac9'
      });

      const res = await request(app)
        .post('/message/messagelike')
        .set('Authorization', `Bearer ${token}`)
        .send({ messageId: '66f4532ddb2756c87a0a92c9' });

      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("Message liked successfully");
    });

    it('should return unauthorized error if token is missing', async () => {
      const res = await request(app)
        .post('/message/messagelike')
        .send({ messageId: new mongoose.Types.ObjectId() });

      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Access denied. No token provided.");
    });
  });
});