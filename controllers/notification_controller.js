const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mohanadkhaled660@gmail.com',
    pass: 'rvfe fwcv ngnn hlsr'
  }
});

async function sendEmail({ to, subject, text }) {
    try {
        if (!to || !subject || !text) {
            throw new Error('Missing required email parameters');
        }
        await transporter.sendMail({
            from: 'mohanadkhaled660@gmail.com',
            to,
            subject,
            text
        });
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

module.exports = {
    sendEmail
};
