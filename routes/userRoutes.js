const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const router = express.Router();

const editUserDetails = async (id, param) => {
	try {
		const user = await User.findByIdAndUpdate(
			{ _id: id },
			param,
			{ useFindAndModify: false },
			(error, data) => {
				if (error) {
					console.log(`error`, error);
				} else {
					return data;
				}
			}
		);

		return user;
	} catch (error) {
		return { error: 'There was no user' };
	}
};

router.post('/user/edit/:id', async (request, response) => {
	const params = request.body;
	const id = request.params.id;

	console.log(params, id);
	response.send(await editUserDetails(id, params));
});

module.exports = router;
