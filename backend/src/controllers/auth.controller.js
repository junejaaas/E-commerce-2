const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');

const register = catchAsync(async (req, res) => {
    const user = await authService.register(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(201).json({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
    // Client side just deletes tokens.
    // Server-side: could blacklist access token or just rely on short expiry
    // MERN stack common practice: just 204
    res.status(204).send();
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
    try {
        console.log("Forgot password route hit");
        console.log("body:", req.body);
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        await authService.generateResetOTP(email);
        
        return res.status(200).json({ 
            message: 'OTP sent successfully' 
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Internal server error while processing request'
        });
    }
});

const verifyResetOTP = catchAsync(async (req, res) => {
    await authService.verifyResetOTP(req.body.email, req.body.otp);
    res.send({ message: 'OTP verified successfully' });
});

const resetPassword = catchAsync(async (req, res) => {
    await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
    res.send({ message: 'Password reset successful' });
});

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
};
