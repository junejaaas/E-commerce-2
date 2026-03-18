const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

// Load env from both possible locations
dotenv.config({ path: path.join(__dirname, '.env') });

const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io';
const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 2525;
const user = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM || 'support@ecommerce.com';

console.log('--- Email Configuration Test ---');
console.log('Configured Settings:', {
    host,
    port,
    user: user ? '********' : 'NOT SET',
    pass: pass ? '********' : 'NOT SET',
    from,
    secure: port === 465
});

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

async function runTest() {
    try {
        console.log('\nStep 1: Verifying Transporter Connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        console.log('\nStep 2: Sending Test Email...');
        const info = await transporter.sendMail({
            from,
            to: 'test@example.com',
            subject: 'SMTP Connection Test',
            text: 'If you are reading this, your email configuration is working correctly!',
            html: '<b>If you are reading this, your email configuration is working correctly!</b>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
        if (error.stack) console.error('Stack Trace:', error.stack);
        
        console.log('\nPossible Solutions:');
        if (error.code === 'ETIMEDOUT') {
            console.log('- Port ' + port + ' might be blocked by your firewall or ISP.');
            console.log('- Try switching between ports 2525, 587, and 465.');
        } else if (error.code === 'EAUTH') {
            console.log('- Check if your SMTP credentials (username/password) are correct.');
            console.log('- If using Mailtrap, ensure you are using the correct credentials for the inbox.');
        }
    } finally {
        process.exit();
    }
}

runTest();
