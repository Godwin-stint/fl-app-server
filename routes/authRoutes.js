const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { mailer } = require('../config/mailer');
const User = mongoose.model('User');
const path = require('path');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/signup', async (request, response) => {
	const {
		email,
		password,
		first_name,
		last_name,
		phone_number,
		membership_type = 'new member',
	} = request.body;

	try {
		const user = new User({
			email,
			password,
			first_name,
			last_name,
			phone_number,
			membership_type,
		});
		await user.save();

		const token = jwt.sign({ userId: user._id }, 'This_is_a_secret_key!');
		response.send({ token, user });

		const emailBody = `<h1>Hello ${first_name}.
            <p>Here is to help you confirm your email address:</p>
            <br/>
            <h2>Click on this to confirm your email: <a href="https://fl-app-v1.herokuapp.com/confirmation/${user._id}">CLICK THIS TO CONFIRM YOUR EMAIL</a>
            <br />
            <p>Contact me for any questions</p>`;
		mailer(first_name, user.email, emailBody);
	} catch (error) {
		return response.status(422).send({ error });
	}
});

router.post('/signedin', async (request, response) => {
	const { id } = request.body;

	if (!id) {
		return response.status(422).send({ error: 'Something is wrong here' });
	}

	const user = await User.findById({ _id: id });
	response.send(user);
});

router.post('/signin', async (request, response) => {
	const { email, password } = request.body;

	if (!email || !password) {
		return response
			.status(422)
			.send({ error: 'Please provide a valid email and password' });
	}

	const user = await User.findOne({ email });

	if (!user) {
		return response.status(422).send({ error: 'Invalid  password or email' });
	}

	try {
		await user.comparePassword(password);

		const token = jwt.sign({ userId: user._id }, 'This_is_a_secret_key!');
		response.send({ token, user });
	} catch (error) {
		return response.status(422).send({ error: 'Invalid password or email' });
	}
});

router.get('/confirmation/:id', async (request, response) => {
	const id = request.params.id;

	try {
		const user = await User.findByIdAndUpdate(
			{ _id: id },
			{ email_confirmed: true, account_confirmed: Date.now() },
			{ useFindAndModify: false },
			(error, data) => {
				if (error) {
					console.log(`error`, error);
				} else {
					return data;
				}
			}
		);

		console.log(`user`, user);
		response.sendFile(path.join(__dirname, '..', 'views', 'confirmation.html'));
	} catch (error) {
		return response.send({ error: 'There was no user' });
	}
});

router.post('/password-reset', async (request, response) => {
	const { email, password } = request.body;

	if (!email) {
		response.send({ error: 'Email is incorrect' });
	}

	if (!password) {
		response.send({ error: 'Please use a valid password' });
	}

	bcrypt.genSalt(10, (error, salt) => {
		if (error) {
			console.log(`password reset error:`, error);
		}

		bcrypt.hash(password, salt, (error, hash) => {
			if (error) {
				console.log(`password reset error:`, error);
			}

			User.findOneAndUpdate(
				{ email },
				{ password: hash },
				{ useFindAndModify: false },
				(error, data) => {
					if (error) {
						console.log(`error`, error);
					} else {
						response.send(data);
					}
				}
			);
		});
	});
});

module.exports = router;
