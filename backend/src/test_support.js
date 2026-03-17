const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SupportTicket = require('./support/support.model');
const SupportMessage = require('./support/supportMessage.model');
const User = require('./models/user.model');
const supportService = require('./support/support.service');

dotenv.config();

const testSupport = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-commerce');
        console.log('DB connected');

        // 1. Create/Find Test Users
        let user = await User.findOne({ email: 'testuser@example.com' });
        if (!user) {
            user = await User.create({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123',
                role: 'user'
            });
        }

        let supportAdmin = await User.findOne({ email: 'supportadmin@example.com' });
        if (!supportAdmin) {
            supportAdmin = await User.create({
                name: 'Support Admin',
                email: 'supportadmin@example.com',
                password: 'password123',
                role: 'support'
            });
        }

        console.log('Users ready');

        // 2. Create Ticket (User)
        const ticket = await supportService.createTicket(user._id, {
            subject: 'Test Ticket - Order Issue',
            category: 'order',
            priority: 'high'
        });
        console.log('Ticket created:', ticket.subject);

        // 3. Get User Tickets
        const userTickets = await supportService.getUserTickets(user._id);
        console.log('User tickets count:', userTickets.tickets.length);

        // 4. Send Message (User)
        const userMsg = await supportService.addMessage(ticket._id, user._id, 'user', {
            message: 'My order is late.'
        });
        console.log('User message sent:', userMsg.message);

        // 5. Admin List Tickets
        const allTickets = await supportService.getAllTickets({ priority: 'high' });
        console.log('Admin high priority tickets:', allTickets.tickets.length);

        // 6. Admin Reply
        const adminMsg = await supportService.addMessage(ticket._id, supportAdmin._id, 'support', {
            message: 'We are investigating.'
        });
        console.log('Admin reply sent:', adminMsg.message);

        // 7. Update Status
        const updatedTicket = await supportService.updateTicketStatus(ticket._id, 'resolved');
        console.log('Ticket status updated to:', updatedTicket.status);

        // 8. Get Ticket Details (Full population check)
        const details = await supportService.getTicketDetails(ticket._id, user._id, 'user');
        console.log('Ticket detailed messages count:', details.messages.length);

        // Cleanup (optional)
        // await SupportMessage.deleteMany({ ticketId: ticket._id });
        // await SupportTicket.findByIdAndDelete(ticket._id);
        // console.log('Cleanup done');

        console.log('Verification successful!');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

testSupport();
