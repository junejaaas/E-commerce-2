const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 2525,
    secure: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
    },
    // Add timeouts to prevent hangs
    connectionTimeout: 5000,   // 5 seconds
    greetingTimeout: 5000,     // 5 seconds
    socketTimeout: 10000,      // 10 seconds
});

/**
 * Verify transporter connection
 */
const verifyTransporter = async () => {
    try {
        // Use a Promise.race to timeout verification if it hangs
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email verification timed out')), 10000)
        );
        await Promise.race([transporter.verify(), timeout]);
        console.log('✅ Email transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email transporter verification failed:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
        return false;
    }
};

/**
 * Send an email
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
    const msg = { 
        from: process.env.EMAIL_FROM || 'support@ecommerce.com', 
        to, 
        subject, 
        text, 
        html 
    };
    
    try {
        await transporter.sendMail(msg);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('📧 Email sending failed:', {
            to,
            subject,
            message: error.message,
            code: error.code,
            response: error.response,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        throw error;
    }
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
    verifyTransporter,
    sendEmail,
    sendResetOTPEmail,
};
