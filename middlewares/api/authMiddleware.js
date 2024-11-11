    // middlewares/authMiddleware.js

    module.exports = (req, res, next) => {
        // Kiểm tra nếu đây là kết nối HTTP thông thường
        console.log(req.session)
        if (req.session && req.session.user) {
            // Người dùng đã đăng nhập, tiếp tục với request
            console.log('login ok');
            return next();
        }

        // Kiểm tra nếu đây là kết nối của Socket.IO
        if (req.request && req.request.session && req.request.session.user) {
            // Nếu kết nối qua WebSocket và đã xác thực session
            console.log('test ok')
            return next();
        }

        else {
            return res.status(400).json({ message: 'Please log in to access' });
        }
    };
