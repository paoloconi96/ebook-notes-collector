const crypto = require('crypto');

const authHandler = {};

authHandler.getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}

authHandler.user = {
    email: 'paolo.conizzoli@gmail.com',
    password: authHandler.getHashedPassword('password'),
};
authHandler.authTokens = {};

authHandler.generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
};

module.exports = authHandler;
