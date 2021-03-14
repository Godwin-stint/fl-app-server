const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model("User");

module.exports = (request, response, next) => {
    const { authorization } = request.headers;

    if (!authorization) {
        return response.status(401).send({error: `You must be already logged in!`});
    }

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, 'This_is_a_secret_key!', async (error, payload) => {
        if (error) {
            return response.status(401).send({error: `You must be logged in.`})
        }

        const { userId } = payload;

        const user = await User.findById(userId);
        request.user = user;
        next();
    });
};