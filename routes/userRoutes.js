const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const multer = require('multer');
const path = require('path');

// Used: https://www.youtube.com/watch?v=srPXMt1Q0nY

const router = express.Router();

const storage = multer.diskStorage({
	destination: (request, file, cb) => {
		cb(null, './uploads');
	},
	filename: (request, file, cb) => {
		cb(null, request.params.id + path.extname(file.originalname));
	},
});

const fileFilter = (request, file, callback) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
		callback(null, true);
	} else {
		callback(new Error('Please upload a image (png/jpeg)'), true);
	}
};

const upload = multer({
	storage,
	fileFilter,
	// limits: {
	// 	fileSize: 1024 * 1024 * 5,
	// },
}).single('image');

// Upload images.
router.post('/api/user/profile/image/:id', upload, (request, response) => {
	const { id } = request.params;

	console.log(`file:`, request.file.path);
	try {
		User.findByIdAndUpdate(
			{ _id: id },
			{ profile_image: request.file.path },
			{ useFindAndModify: false, new: true },
			(error, data) => {
				if (error) {
					response.send(error);
					console.log(`error`, error);
				} else {
					console.log(data);
					response.send(data);
				}
			}
		);
	} catch (error) {
		console.log(error);
		response.status(422).send(error);
	}
});

// Edit user details.
router.patch('/user/edit/:id', async (request, response) => {
	const params = request.body;
	const id = request.params.id;

	const editUserDetails = async (id, param) => {
		try {
			const user = await User.findByIdAndUpdate(
				{ _id: id },
				param,
				{ useFindAndModify: false },
				(error, data) => {
					if (error) {
						response.send(error);
						console.log(`error`, error);
					} else {
						return data;
					}
				}
			);

			return user;
		} catch (error) {
			response.send(error);
			return { error: 'There was no user' };
		}
	};

	// console.log(params, id);
	response.send(await editUserDetails(id, params));
});

router.delete('/user/delete/:id', async (request, response) => {
	const id = request.params.id;

	try {
		await User.findByIdAndDelete({ _id: id });
		response.end();
	} catch (error) {
		console.log(`error deleting user`, error);
		response.send(error);
	}
});

module.exports = router;
