const bcrypt = require('bcrypt');
const User = require('../../models/user/users');
const message = require('../../models/message/message');


function IsEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

exports.showLoginPage = async (req, res) => {
    try {
        if (req.session.userId) {
            return res.redirect('/'); // Redirect nếu đã đăng nhập
        }
        return res.status(200).render('login', { message: 'Please log in to access' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).render('error', { message: error.message }); // Render trang lỗi nếu có
    }
};

exports.showRegisterPage = async (req, res) => {
    return res.status(200).render('register', { title: 'Register', error: req.query.error || null });
};

const loginAttempts = {};

exports.handleLogin = async (req, res) => {

    const { username, password } = req.body;
    const currentTime = Date.now();
    
    // Thiết lập giới hạn
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 phút

    // Kiểm tra số lần thử đăng nhập
    if (loginAttempts[username]) {
        const attempts = loginAttempts[username];
        if (attempts.count >= MAX_ATTEMPTS && (currentTime - attempts.firstAttempt < LOCK_TIME)) {
            return res.status(429).render('login', { message: 'Too many login attempts. Please try again later.' });
        }
    }

    try {
        let user;
        if (IsEmail(username)) {
            user = await User.findOne({ email: username });
        } else {
            user = await User.findOne({ username });
        }
        
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                delete loginAttempts[username];

                req.session.userId = user._id;
                req.session.user = { username: user.username, password: user.password };
                req.session.message = 'Access granted!';
                await req.session.save(); // Ensure the session is saved before redirecting
                return res.redirect('/'); 
            } else {
                // Cập nhật số lần thử đăng nhập không thành công
                if (!loginAttempts[username]) {
                    loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                }
                loginAttempts[username].count++;
                return res.render('login', { message: 'Incorrect password' });
            }
        } else {
            return res.render('login', { message: "User not found" });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.handleRegister = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    try {
        if (password.length <= 8 || confirmPassword.length <= 8) {
            return res.render('register', { message: 'Your password is short' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
        if (!passwordRegex.test(password)) {
            return res.render('register', { message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.' });
        }
        if (password !== confirmPassword) {
            return res.render('register', { message: 'Your passwords do not match' });
        }
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('register', { message: 'Username or Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, phone, password: hashedPassword });

        await newUser.save();

        req.session.userId = newUser._id;
        req.session.user = { username: newUser.username, password: newUser.password };

        res.render('index', {
            message: 'access congratulation',
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).render('error', { message: 'Error during registration' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).render('error', { message: 'Error during logout' });
        }
        return res.redirect('/login'); // Redirect về trang chính sau khi logout
    });
};

exports.finduser = async (req,res) => {
    try {
        const{ name } = req.body;
        const user = User.findOne({name});

        if (!user) {
            return res.status(400).json({ message: 'user not found'});
        }

        return res.status(200).json({ message: 'success', name: user.username});
    } catch (error) {
         console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error during registration' });
    }
};
