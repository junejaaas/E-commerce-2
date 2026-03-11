import { useState, useEffect } from 'react'
import API from '../../services/api'
import { Link } from 'react-router-dom'
import { MessageSquare, Clock, ShieldCheck, Filter, Search, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportPanel() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const { data } = await API.get('/support/admin/tickets')
            setTickets(data.tickets || data)
        } catch (error) {
            toast.error('Failed to load support tickets')
        } finally {
            setLoading(false)
        }
    }

    const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter)

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700'
            case 'pending': return 'bg-orange-100 text-orange-700'
            case 'resolved': return 'bg-green-100 text-green-700'
            case 'closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse">Loading helpdesk...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center">
                        Support Center <span className="ml-3 text-xs bg-primary-600 text-white px-3 py-1 rounded-full uppercase tracking-widest font-black">Admin</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage user inquiries and resolve issues</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {['all', 'open', 'pending', 'resolved', 'closed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredTickets.length === 0 && (
                    <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">No tickets matching filter</p>
                    </div>
                )}

                {filteredTickets.map(ticket => (
                    <Link key={ticket._id} to={`/admin/support/${ticket._id}`} className="block">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all group flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                                    ticket.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                <ShieldCheck className="h-7 w-7" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate">{ticket.subject}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ${getStatusStyle(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs font-medium text-gray-400">
                                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    <span className="text-gray-200">|</span>
                                    <span className="capitalize">{ticket.category}</span>
                                    <span className="text-gray-200">|</span>
                                    <span className="truncate">User ID: {ticket.userId?._id?.slice(-6) || ticket.userId?.slice(-6)}</span>
                                </div>
                            </div>

                            <ChevronRight className="h-6 w-6 text-gray-200 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
