const User = require('../../models/user/users');
const Friend = require('../../models/user/userfriends');
const Follow = require('../../models/user/userfollows'); 
const chat = require('../../models/chat/chat');
const chatmember = require('../../models/chat/chatmember');

exports.listfriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        // Find the user by their ID
        const listfriend = await Friend.findOne({ User1: userId });

        if (!listfriend) {
            return res.status(404).json({ message: 'you have been not friend' });
        }

        // Render trang danh sách bạn bè
        res.status(200).json({ message: 'List of Friends', friends: listfriend, loggedInUserId: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listrequestfriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        // Find the user by their ID
        const listrequest = await Follow.findOne({Sender: userId});

        if (!listrequest) {
            return res.status(404).json({ message: 'Ban chua gui ket ban voi ai' });
        }
        // Render trang danh sách bạn bè
        res.status(200).json({ message: 'Danh sach nhung nguoi da gui ket ban', friends: listrequest, loggedInUserId: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listorderfriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        // Find the user by their ID
        const listorder = await Follow.findOne({Accept: userId});

        if (!listorder) {
            return res.status(404).json({ message: 'Ban khong co loi moi ket ban nao' });
        }
        // Render trang danh sách bạn bè
        res.status(200).json({ message: 'Danh sach nhung loi moi ket ban', friends: listorder, loggedInUserId: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addfriend = async (req, res) => {
    try {
        const senderId = req.session.userId;
        const { receiverId } = req.body;
        console.log(senderId, receiverId);

        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send a friend request to yourself' });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        const existingRequest = await Follow.findOne({
            Sender: senderId,
            Accept: receiverId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        const existingOrder = await Follow.findOne({
            Sender: receiverId,
            Accept: senderId
        });

        if (existingOrder) {
            return res.status(400).json({ message: 'Friend Order already exists' });
        }

        const newFriendRequest = new Follow({ Sender: senderId, Accept: receiverId });
        await newFriendRequest.save();

        res.status(200).json({ message: 'requested' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.acceptfriend = async (req, res) => {
    try {
        const senderId = req.session.userId;
        const { requestId } = req.body;
        console.log(senderId);

        // Tìm yêu cầu kết bạn
        const friendRequest = await Follow.findOne({
            Sender: requestId,
            Accept: senderId
        });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found or already processed' });
        }

        // Tìm người gửi và người nhận
        const sender = await User.findById(senderId);
        const receiver = await User.findById(requestId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        const existingRequest = await Friend.findOne({
            User1: senderId,
            User2: requestId
        });
        const existingRequestReversed = await Friend.findOne({
            User2: senderId,
            User1: requestId
        });

        if (existingRequest || existingRequestReversed) {
            return res.status(400).json({ message: 'You have already accepted this request' });
        }

        // Tạo bạn bè mới
        const newFriend = new Friend({ User1: senderId, User2: requestId });
        await newFriend.save();

        friendRequest.status = 'Accepted';
        await friendRequest.save();

        // Tạo chat mới cho cả hai người
        const newChat = new chat({
            name: `Chat between ${sender.name} and ${receiver.name}`
        });
        await newChat.save();

        // Tạo thành viên chat cho cả hai
        const creatorChatMember1 = await chatmember.create({
            User: senderId,
            Chat: newChat._id,
            chatmembertype: 'Admin'  // Sender là admin
        });
        const creatorChatMember2 = await chatmember.create({
            User: requestId,
            Chat: newChat._id,
            chatmembertype: 'Admin'  // Receiver là admin
        });

        // Trả về model chat với tên người nhận cho người gửi (A)
        res.status(200).json({
            message: 'Friend request accepted successfully',
            chat: {
                chatId: newChat._id,
                name: receiver.name  // Trả về tên của người nhận B
            }
        });

        // Optionally, gửi thông tin này cho phía client của người nhận (B) nếu bạn có socket:
        // socket.to(requestId).emit('newChat', { chatId: newChat._id, name: sender.name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const senderId = req.session.userId;
        const { receiverId } = req.body;

        // Xóa yêu cầu kết bạn từ cơ sở dữ liệu
        await Friend.deleteOne({
            $or: [
                { User1: senderId, User2: receiverId },
                { User1: receiverId, User2: senderId }
            ],
        });

        res.status(200).json({ message: 'Friend removed successfully', redirectUrl: '/user/management' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
