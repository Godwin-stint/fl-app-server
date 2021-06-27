const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
	{
		first_name: { type: String, default: '' },
		last_name: { type: String, default: '' },
		shepherd_first_name: { type: String },
		shepherd_last_name: { type: String },
		date_of_birth: { type: String },
		attendended: { type: Boolean },
		ministered: { type: Boolean },
		rehearsed: { type: Boolean },
		_leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
	{
		timestamp: Date,
		date: { type: Date, default: new Date() },
		attendance_number: String,
		attendance_names: String,
		number_first_timers: String,
		names_first_timers: String,
		number_of_converts: String,
		names_of_converts: String,
		started_nbs: String,
		finished_nbs: String,
		ministered_number: String,
		ministered_names: String,
		rehearsed_number: String,
		rehearsed_names: String,
		leader_id: String,
	},
	{ timestamps: true }
);

const centerSchema = new mongoose.Schema(
	{
		_pastor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		_leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		location: { type: String },
		attendance: [attendanceSchema],
		members: [memberSchema],
	},
	{ timestamps: true }
);

mongoose.model('Center', centerSchema);
