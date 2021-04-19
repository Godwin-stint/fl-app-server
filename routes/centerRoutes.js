const express = require('express');
const mongoose = require('mongoose');
const Centers = mongoose.model('Center');
const User = mongoose.model('User');

const router = express.Router();

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

router.post('/api/:center/attendance/edit/:id', async (request, response) => {
	const location = request.params.center;
	const id = request.params.id;

	try {
		const center = await Centers.findOne({ location });
		const attendance = center.attendance;

		attendance.map(i => {
			if (i._id.equals(id)) {
				i = { ...i, ...request.body };
				return;
			}
		});

		console.log(attendance);
		response.send(attendance);

		await Centers.findOneAndUpdate(
			{ location },
			{ attendance },
			{ new: true, useFindAndModify: false },
			(error, result) =>
				error ? response.send(error.message) : response.send(result)
		);
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

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

router.get('/api/:center/attendance/:id', async (request, response) => {
	try {
		const center = await Centers.findOne({ location: request.params.center });
		// const user = await User.findOne({_id: request.params.id});

		response.send(
			center.attendance.filter(obj => obj.leader_id === request.params.id)
		);
	} catch (error) {
		console.log(error.message);
		response.send(error);
	}
});

module.exports = router;
