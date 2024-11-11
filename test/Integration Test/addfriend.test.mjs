import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js'; 
import Message from '../../models/message/message.js';
import User from '../../models/user/users.js';
import Friend from '../../models/user/userfriends.js';
import Follow from '../../models/user/userfollows.js';
import chat from '../../models/chat/chat.js';
import chatmember from '../../models/chat/chatmember.js';

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

describe('Friendship API', () => {

    describe('GET /listfriend', () => {
      it('should return list of friends for logged-in user', async () => {
        // Giả sử có một người bạn trong cơ sở dữ liệu
        const listFriendResponse = await request(app)
          .get('/friend/listfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId
          });
  
        expect(listFriendResponse.statusCode).to.equal(200);
        expect(listFriendResponse.body.message).to.equal('List of Friends');
        expect(listFriendResponse.body.friends).to.not.be.empty;
      });
  
      it('should return 404 if no friends found', async () => {
        // Giả sử người dùng chưa có bạn bè
        const listFriendResponse = await request(app)
          .get('/friend/listfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId
          });
  
        expect(listFriendResponse.statusCode).to.equal(404);
        expect(listFriendResponse.body.message).to.equal('you have been not friend');
      });
    });
  
    describe('GET /listrequestfriend', () => {
      it('should return list of sent friend requests for logged-in user', async () => {
        const listRequestResponse = await request(app)
          .get('/friend/listrequestfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId
          });
  
        expect(listRequestResponse.statusCode).to.equal(200);
        expect(listRequestResponse.body.message).to.equal('Danh sach nhung nguoi da gui ket ban');
        expect(listRequestResponse.body.friends).to.not.be.empty;
      });
  
      it('should return 404 if no requests sent', async () => {
        const listRequestResponse = await request(app)
          .get('/friend/listrequestfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId
          });
  
        expect(listRequestResponse.statusCode).to.equal(404);
        expect(listRequestResponse.body.message).to.equal('Ban chua gui ket ban voi ai');
      });
    });
  
    describe('POST /addfriend', () => {
      it('should send a friend request successfully', async () => {
        const addFriendResponse = await request(app)
          .post('/friend/addfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            senderId: userId,
            receiverId: mockReceiverId 
        });
  
        expect(addFriendResponse.statusCode).to.equal(200);
        expect(addFriendResponse.body.message).to.equal('requested');
      });
  
      it('should return 400 if sending friend request to yourself', async () => {
        const addFriendResponse = await request(app)
          .post('/friend/addfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ senderId: userId, receiverId: mockUserId });
  
        expect(addFriendResponse.statusCode).to.equal(400);
        expect(addFriendResponse.body.message).to.equal('Cannot send a friend request to yourself');
      });
  
      it('should return 400 if friend request already exists', async () => {
        const addFriendResponse = await request(app)
          .post('/friend/addfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ senderId: userId, receiverId: mockReceiverId });
  
        expect(addFriendResponse.statusCode).to.equal(400);
        expect(addFriendResponse.body.message).to.equal('Friend request already exists');
      });
    });
  
    describe('POST /acceptfriend', () => {
      it('should accept a friend request successfully', async () => {
        // Giả sử đã có yêu cầu kết bạn trong cơ sở dữ liệu
        const acceptFriendResponse = await request(app)
          .post('/friend/acceptfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ senderId: userId, requestId: mockReceiverId });
  
        expect(acceptFriendResponse.statusCode).to.equal(200);
        expect(acceptFriendResponse.body.message).to.equal('Friend request accepted successfully');
      });
  
      it('should return 404 if friend request not found', async () => {
        const acceptFriendResponse = await request(app)
          .post('/friend/acceptfriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ senderId: userId, requestId: new mongoose.Types.ObjectId() });
  
        expect(acceptFriendResponse.statusCode).to.equal(404);
        expect(acceptFriendResponse.body.message).to.equal('Friend request not found or already processed');
      });
    });
  
    describe('POST /removeFriend', () => {
      it('should remove a friend successfully', async () => {
        const removeFriendResponse = await request(app)
          .post('/friend/removeFriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            senderId: userId, 
            receiverId: mockReceiverId 
            });
  
        expect(removeFriendResponse.statusCode).to.equal(200);
        expect(removeFriendResponse.body.message).to.equal('Friend removed successfully');
      });
  
      it('should return 500 if an error occurs', async () => {
        // Đặt lại mock để gây lỗi
        const removeFriendResponse = await request(app)
          .post('/friend/removeFriend')
          .set('Authorization', `Bearer ${token}`)
          .send({ senderId: userId, receiverId: new mongoose.Types.ObjectId() });
  
        expect(removeFriendResponse.statusCode).to.equal(500);
        expect(removeFriendResponse.body.message).to.equal('Server error');
      });
    });
  });