import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupportStore } from '../../store/supportStore'
import { ArrowLeft, Send, User, ShieldCheck, Clock } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { useAuthStore } from '../../store/authStore'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function TicketDetails() {
    const { id } = useParams()
    const { user } = useAuthStore()
    const { 
        currentTicket, 
        messages, 
        loading, 
        sending, 
        fetchTicketDetails, 
        sendMessage 
    } = useSupportStore()
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchTicketDetails(id)
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        
        const success = await sendMessage(id, newMessage)
        if (success) {
            setNewMessage('')
        }
    }

    if (loading && !currentTicket) return <div className="p-20"><LoadingSpinner size="lg" fullPage /></div>
    if (!currentTicket) return <div className="p-20 text-center font-bold">Ticket not found</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-20">
            <Link to="/support/tickets" className="flex items-center text-gray-500 hover:text-primary-600 mb-8 font-bold transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> All Support Tickets
            </Link>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px]">
                {/* Header */}
                <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{currentTicket.subject}</h2>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-400">#{currentTicket._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                            <span className={`px-2 py-0.5 rounded uppercase font-black tracking-widest ${currentTicket.status === 'open' ? 'text-blue-600' :
                                    currentTicket.status === 'resolved' ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {currentTicket.status}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500 font-medium capitalize">{currentTicket.category}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500 font-medium">Started {new Date(currentTicket.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth bg-gray-50/30">
                    {messages.map((msg, idx) => {
                        const isSystem = msg.senderRole === 'support' || msg.senderRole === 'admin'
                        const isMe = msg.senderId === user?._id || (!isSystem && msg.senderId === user?.id)

                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'ml-3 bg-primary-600 text-white' : 'mr-3 bg-white border border-gray-100 text-gray-400'
                                        }`}>
                                        {isSystem ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                        }`}>
                                        {msg.message}
                                        <div className={`text-[10px] mt-2 flex items-center ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {currentTicket.status !== 'closed' ? (
                    <form onSubmit={handleSendMessage} className="p-6 md:p-8 bg-white border-t border-gray-100 flex items-center space-x-4">
                        <input
                            type="text"
                            className="flex-grow bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="h-14 w-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-200"
                        >
                            {sending ? <LoadingSpinner size="sm" color="white" /> : <Send className="h-6 w-6" />}
                        </button>
                    </form>
                ) : (
                    <div className="p-8 text-center bg-gray-50 border-t border-gray-100">
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">This ticket has been closed</p>
                    </div>
                )}
            </div>
        </div>
    )
}
