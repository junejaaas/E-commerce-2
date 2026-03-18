const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { sendResetOTPEmail } = require('./src/services/email.service');

async function testEmail() {
    console.log('--- Email Timeout Verification ---');
    const start = Date.now();
    try {
        console.log('Attempting to send email...');
        await sendResetOTPEmail('test@example.com', '123456');
        console.log('SUCCESS: Email sent (unexpected if Mailtrap is down but good if it works).');
    } catch (error) {
        const duration = (Date.now() - start) / 1000;
        console.log(`FAILED as expected/handled in ${duration.toFixed(2)}s`);
        console.log('Error Message:', error.message);
        if (duration < 15) {
            console.log('VERIFICATION PASSED: The request did not hang indefinitely.');
        } else {
            console.log('VERIFICATION FAILED: The request took too long.');
        }
    } finally {
        process.exit();
    }
}

testEmail();
