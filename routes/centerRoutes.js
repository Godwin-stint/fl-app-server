const express = require('express');
const mongoose = require('mongoose');
const Centers = mongoose.model('Center');
const User = mongoose.model('User');
const _ = require('lodash');

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
	const {
		first_name,
		last_name,
		shepherd_first_name,
		shepherd_last_name,
	} = request.body;

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

		await Centers.findOneAndUpdate(
			{ location },
			{ members },
			{ new: true, useFindAndModify: false },
			(error, result) =>
				error ? response.send(error.message) : response.send(result)
		);
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

// Create new center.
router.post('/api/center/new-center', async (request, response) => {
	const {
		leader_first_name,
		leader_last_name,
		pastor_first_name,
		pastor_last_name,
		location,
	} = request.body;

	try {
		const center = new Centers({
			leader_first_name,
			leader_last_name,
			pastor_first_name,
			pastor_last_name,
			location,
		});

		const centerUpdate = await center.save();
		response.send(centerUpdate);
	} catch (error) {
		console.log(error.message);
		throw new Error(error);
	}
});

// Edit single center's attendance details. It takes the
// attendance object._id and leader's id.
router.post(
	'/api/:center/attendance/edit/:id/:leader',
	async (request, response) => {
		const location = request.params.center;
		const id = request.params.id;
		const leader_id = request.params.leader;

		try {
			const center = await Centers.findOne({ location }).then(record => {
				record.attendance.id(id).set(request.body);

				return record.save();
			});

			response.send(
				center.attendance.filter(record => record.leader_id === leader_id)
			);
		} catch (error) {
			console.log(error.message);
			response.send(error);
		}
	}
);

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
				response
					.status(422)
					.send({ error: 'There is no center with that name' });
			}
		});

		response.send(
			center.attendance.filter(record => record.leader_id === leader_id)
		);
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

// Get all attendance for a particular leader. It accepts the
// leader's id
router.get('/api/:center/attendance/:id', async (request, response) => {
	try {
		const center = await Centers.findOne({ location: request.params.center });

		response.send(
			center.attendance.filter(obj => obj.leader_id === request.params.id)
		);
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

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
