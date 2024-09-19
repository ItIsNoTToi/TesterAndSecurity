const bcrypt= require('bcrypt')
const User = require('../models/users');

function IsEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

exports.showLoginPage = (req, res) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (req.session && req.session.user) {
        // Nếu người dùng đã đăng nhập, chuyển hướng đến trang chính
        return res.redirect('/'); // Hoặc chuyển hướng đến trang bạn muốn
    }
    // Nếu chưa đăng nhập, hiển thị trang đăng nhập
    res.render('login', { title: 'abc', error: req.query.error || null });
};

exports.showRegisterPage = (req, res) => {
    res.render('register', { title: 'Register', error: req.query.error || null });
};
  
exports.handleLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user;
        if(IsEmail(username)){
            user = await User.findOne({ email: username });
        }
        else{
            user = await User.findOne({ username });
            
        }
        if (user) {
            // So sánh mật khẩu đã mã hóa
            if(user.role === 'admin'){
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    req.session.userId = user._id;
                    req.session.user = { username: user.username, password: user.password }; // Lưu thông tin người dùng vào session
                    res.redirect('/'); // Đăng nhập thành công
                } else {
                    res.render('login', { title: 'Login', error: 'Invalid credentials' }); // Sai mật khẩu
                }
            }
            else{
                res.render('login', { title: 'Login', error: 'Please using admin account!'}); // Không tìm thấy người dùng
            }
            
        } else {
            res.render('login', { title: 'Login', error: 'User not found' }); // Không tìm thấy người dùng
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.render('login', { title: 'Login', error: 'An error occurred during login.' });
    }
};

exports.handleRegister = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    try {
        // Kiểm tra xem mật khẩu và mật khẩu xác nhận có khớp không
        if (password !== confirmPassword) {
            return res.render('register', { title: 'Register', error: 'Your passwords do not match' });
        }

        // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('register', { title: 'Register', error: 'Username or Email already exists' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            // `createdAt` và `role` sẽ được tự động thiết lập theo mặc định
        });
        await newUser.save();
        if (!req.session) {
            req.session = {};
        }
        req.session.user = { username: newUser.username }; // Lưu thông tin người dùng vào session
        
        res.redirect('/'); // Đăng ký thành công, chuyển hướng về trang chủ

    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { title: 'Register', error: 'An error occurred during registration.' });
    }
};

exports.logout = (req, res) => {
    // Xóa thông tin người dùng khỏi session
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/'); // Hoặc hiển thị thông báo lỗi nếu cần
        }

        // Chuyển hướng đến trang đăng nhập sau khi đăng xuất thành công
        res.redirect('/login');
    });
};