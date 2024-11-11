const { verifyRefreshToken, generateAccessToken } = require('../../utils/auth');

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).send('Refresh token not found');
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return res.status(403).send('Invalid refresh token');
  }

  const accessToken = generateAccessToken(decoded.user);
  res.json({ accessToken });
};

module.exports = { refreshToken };
