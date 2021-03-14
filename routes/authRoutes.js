const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const router = express.Router();

router.post('/signup', async (request, response) => {
    const {
        email,
        password,
        first_name,
        last_name,
        phoneNumber,
        date_of_birth,
    } = request.body;

    try {
        const user = new User({
            email,
            password,
            first_name,
            last_name,
            phoneNumber,
            date_of_birth,
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, 'This_is_a_secret_key!');
        response.json({ token });
    } catch (error) {
        return response.status(422).json({ error: error });
    }
});

router.post('/signin', async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(422).json({
            error: 'Please provide a valid email and password',
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return response
            .status(422)
            .json({ error: 'Invalid  password or email' });
    }

    try {
        await user.comparePassword(password);

        const token = jwt.sign({ userId: user._id }, 'This_is_a_secret_key!');
        response.send({ token });
    } catch (error) {
        return response
            .status(422)
            .json({ error: 'Invalid password or email' });
    }
});

module.exports = router;
