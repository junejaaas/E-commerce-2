const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Send an email
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
    const msg = { from: process.env.EMAIL_FROM || 'support@ecommerce.com', to, subject, text, html };
    await transporter.sendMail(msg);
};

/**
 * Send password reset OTP email
 * @param {string} to 
 * @param {string} otp 
 * @returns {Promise}
 */
const sendResetOTPEmail = async (to, otp) => {
    const subject = 'Password Reset OTP';
    const text = `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset OTP</h2>
            <p>Your password reset OTP is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
    `;
    await sendEmail(to, subject, text, html);
};

module.exports = {
    transporter,
    sendEmail,
    sendResetOTPEmail,
};
