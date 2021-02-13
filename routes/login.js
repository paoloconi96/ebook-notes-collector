const express = require('express');
const router = express.Router();
const authHandler = require('../utils/auth-handler');

router.get('/', async (req, res, next) => {
    res.render('login', {
        title: 'Login',
    });
});

router.post('/', async (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = authHandler.getHashedPassword(password);

    if (
        authHandler.user.email === email &&
        authHandler.user.password === hashedPassword
    ) {
        const authToken = authHandler.generateAuthToken();

        // Store authentication token
        authHandler.authTokens[authToken] = authHandler.user;

        // Setting the auth token in cookies
        res.cookie('authToken', authToken);

        // Redirect user to the protected page
        res.redirect('/');
    } else {
        res.render('login', {
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });
    }
});

module.exports = router;
