const nodemailer = require('nodemailer');

// https://www.youtube.com/watch?v=Va9UKGs1bwI
// this video helped

async function mailer(first_name, email, email_text) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		secure: true, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL, // generated ethereal user
			pass: process.env.PASSWORD, // generated ethereal password
		},
		host: 'smtp.gmail.com',
		tls: {
			rejectUnauthorized: false,
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Confirm First Love App Email" <no-reply@email.com>', // sender address
		to: email, // list of receivers
		subject: `${first_name}'s Account Confirmation`, // Subject line
		text: 'Confirmation email', // plain text body
		html: `${email_text}`, // html body
	});

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

mailer().catch(console.error);

module.exports = { mailer };
