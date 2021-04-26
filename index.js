require('./models/User');
require('./models/Center');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const centerRoutes = require('./routes/centerRoutes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGO_URI = require('./config/key');
const requireAuth = require('./middlewares/requireAuth');

// Creating the app and setting the port.
const app = express();

mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});
mongoose.connection.on(`connected`, () => {
	console.log(`Connected to mongo instance`);
});
mongoose.connection.on(`error`, error => {
	console.log(`Error connecting to mongo instance`, error);
});

// Middlewares.
app.use(express.json());
app.use(authRoutes);
app.use(userRoutes);
app.use(centerRoutes);
app.use('/api/user/profile/image/uploads', express.static('uploads'));

// Base route.
app.get('/', requireAuth, (request, response) => {
	response.json({ email: request.user.email });
});

// app.get('/resume-download', (request, response) => {
// 	response.download('config/emmanuel-cv.docx');
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
