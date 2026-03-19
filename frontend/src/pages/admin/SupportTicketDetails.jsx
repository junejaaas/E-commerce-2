import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../../services/api'
import { ArrowLeft, Send, User, ShieldCheck, Clock, CheckCircle, Info } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function SupportTicketDetails() {
    const { id } = useParams()
    const { user } = useAuthStore()
    const [ticket, setTicket] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchTicketDetails()
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchTicketDetails = async () => {
        try {
            const { data } = await API.get(`/support/tickets/${id}`)
            setTicket(data.ticket || data)
            setMessages(data.messages || data.ticket?.messages || [])
        } catch (error) {
            toast.error('Failed to load support ticket details')
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        setSending(true)
        try {
            const { data: responseBody } = await API.post(`/support/admin/tickets/${id}/messages`, { message: newMessage })
            const newMsg = responseBody.data?.message || responseBody.message || responseBody
            setMessages([...messages, newMsg])
            setNewMessage('')
            if (ticket.status === 'open') {
                updateStatus('pending')
            }
        } catch (error) {
            toast.error('Failed to send reply')
        } finally {
            setSending(false)
        }
    }

    const updateStatus = async (status) => {
        try {
            await API.patch(`/support/admin/tickets/${id}`, { status })
            setTicket({ ...ticket, status })
            toast.success(`Ticket marked as ${status}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse">Connecting to internal helpdesk...</div>
    if (!ticket) return <div className="p-20 text-center font-bold">Ticket not found</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20">
            <Link to="/admin" className="flex items-center text-gray-500 hover:text-primary-600 mb-8 font-bold transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Admin Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Chat Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px]">
                        <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{ticket.subject}</h2>
                                <p className="text-xs text-gray-400 mt-1 font-bold">Ticket ID: #{ticket._id}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => updateStatus('resolved')}
                                    variant="secondary"
                                    className="rounded-xl px-4 py-2 text-[10px]"
                                    disabled={ticket.status === 'resolved'}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Resolved
                                </Button>
                                <Button
                                    onClick={() => updateStatus('closed')}
                                    variant="outline"
                                    className="rounded-xl px-4 py-2 text-[10px]"
                                    disabled={ticket.status === 'closed'}
                                >
                                    Close Ticket
                                </Button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-gray-50/20">
                            {messages.map((msg, idx) => {
                                const isAdmin = msg.senderRole === 'support' || msg.senderRole === 'admin'
                                return (
                                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex items-end max-w-[85%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'ml-3 bg-primary-600 text-white shadow-lg' : 'mr-3 bg-white border border-gray-100 text-gray-400'
                                                }`}>
                                                {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            </div>
                                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${isAdmin ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                                }`}>
                                                {msg.message}
                                                <div className={`text-[10px] mt-2 font-medium ${isAdmin ? 'text-primary-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-gray-100 flex items-center space-x-4">
                            <input
                                type="text"
                                className="flex-grow bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                placeholder="Write your response to the user..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending || ticket.status === 'closed'}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim() || ticket.status === 'closed'}
                                className="h-14 w-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest text-xs">
                            <Info className="h-4 w-4 mr-2 text-primary-600" /> User Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Name</p>
                                <p className="text-sm font-bold text-gray-900">{ticket.userId?.name || 'Customer'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-600">{ticket.userId?.email || 'N/A'}</p>
                            </div>
                            <hr className="border-gray-50" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded ${ticket.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        ticket.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
