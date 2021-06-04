const express = require('express');
const mongoose = require('mongoose');
const Centers = mongoose.model('Center');
const User = mongoose.model('User');
const _ = require('lodash');
const { Expo } = require('expo-server-sdk');

const router = express.Router();

// 1. Create a center.✓
// 2. Add attendance.✓
// 3. Edit attendance.✓
// 4. Delete attance.✓
// 5. Create attendance.✓
// 6. Get all center details.✓

// Create new member in center.
router.post('/api/:center/new-member', async (request, response) => {
	const location = request.params.center;
	const { first_name, last_name, shepherd_first_name, shepherd_last_name } = request.body;

	try {
		const center = await Centers.findOne({ location });
		// center ? response.send(center) : response.send('No center found');

		const members = center.members;

		members.push({
			first_name,
			last_name,
			shepherd_first_name,
			shepherd_last_name,
		});

		await Centers.findOneAndUpdate({ location }, { members }, { new: true, useFindAndModify: false }, (error, result) =>
			error ? response.send(error.message) : response.send(result)
		);
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

// Create new center.
router.post('/api/center/new-center', async (request, response) => {
	const { _pastor_id, location } = request.body;

	try {
		const center = new Centers({
			_pastor_id,
			location,
		});

		const centerUpdate = await center.save();
		response.send(centerUpdate);
	} catch (error) {
		console.log(error.message);
		throw new Error(error);
	}
});

// Edit single center's attendance details. It takes the attendance object._id and leader's id.
router.post('/api/:center/attendance/edit/:id/:leader', async (request, response) => {
	const location = request.params.center;
	const id = request.params.id;
	const leader_id = request.params.leader;

	try {
		const center = await Centers.findOne({ location }).then(record => {
			record.attendance.id(id).set(request.body);

			return record.save();
		});

		response.send(center.attendance.filter(record => record.leader_id === leader_id));
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

// Add new attendance to attendance data.
router.post('/api/:center/attendance/new', async (request, response) => {
	const location = request.params.center;
	const {
		date,
		attendance_number,
		attendance_names,
		number_first_timers,
		names_first_timers,
		number_of_converts,
		names_of_converts,
		started_nbs,
		finished_nbs,
		leader_id,
	} = request.body;

	try {
		const center = await Centers.findOne({ location }).then(record => {
			if (record) {
				record.attendance.push({
					date,
					attendance_number,
					attendance_names,
					number_first_timers,
					names_first_timers,
					number_of_converts,
					names_of_converts,
					started_nbs,
					finished_nbs,
					leader_id,
				});

				return record.save();
			} else {
				response.status(422).send({ error: 'There is no center with that name' });
			}
		});

		response.send(center.attendance.filter(record => record.leader_id === leader_id));
		// await Centers.findOneAndUpdate(
		// 	{ location },
		// 	{ attendance },
		// 	{ new: true, useFindAndModify: false },
		// 	(error, result) =>
		// 		error ? response.send(error.message) : response.send(result)
		// );
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

// Notification for centre reminders
router.get('/api/:center/attendance/reminder', async (request, response) => {
	const location = request.params.center;

	const sendNotification = async () => {
		let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
		let messages = [];

		const users = await User.find({ center: location });
		somePushTokens = users.filter(user => user.notification_token).map(el => el.notification_token);
		for (let pushToken of somePushTokens) {
			messages.push({
				to: pushToken,
				sound: 'default',
				title: 'Fill out data now!',
				body: 'If you have not already, click here to fill it out',
			});
		}

		let chunks = expo.chunkPushNotifications(messages);
		let tickets = [];
		(async () => {
			// Send the chunks to the Expo push notification service. There are
			// different strategies you could use. A simple one is to send one chunk at a
			// time, which nicely spreads the load out over time:
			for (let chunk of chunks) {
				try {
					let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
					tickets.push(...ticketChunk);
					// NOTE: If a ticket contains an error code in ticket.details.error, you
					// must handle it appropriately. The error codes are listed in the Expo
					// documentation:
					// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
				} catch (error) {
					console.error(error);
				}
			}
		})();
		console.log(tickets);
	};

	sendNotification();
	response.send('All done');
});

// Get all attendance for a particular leader. It accepts the leader's id
router.get('/api/:center/attendance/:id', async (request, response) => {
	try {
		const center = await Centers.findOne({ location: request.params.center });

		response.send(center.attendance.filter(obj => obj.leader_id === request.params.id));
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

// Fetch all centers
router.get('/api/all-centers', async (request, response) => {
	const centers = await Centers.find();
	response.send(centers.map(el => el.location));
});

// Fetch all leaders.
router.get('/api/:center/all-leaders', async (request, response) => {
	const location = request.params.center;

	try {
		const users = await User.find({ center: location });

		response.send(users);
	} catch (error) {
		console.log(`error for fetching leaders: `, error);
		response.send(error);
	}
});

// Get all attendance as a head leader.
router.get('/api/:center', async (request, response) => {
	const location = request.params.center;

	try {
		const center = await Centers.findOne({ location });

		response.send(center);
	} catch (error) {
		console.log(error);
		response.send(error);
	}
});

module.exports = router;
