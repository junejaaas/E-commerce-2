import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSupportStore } from '../../store/supportStore'
import { Plus, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { Link } from 'react-router-dom'

const ticketSchema = z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    category: z.string().min(1, 'Category is required'),
    priority: z.string().min(1, 'Priority is required'),
})

export default function SupportTickets() {
    const { tickets, loading, fetchTickets, createTicket } = useSupportStore()
    const [showCreate, setShowCreate] = useState(false)
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            subject: '',
            category: 'order',
            priority: 'medium'
        }
    })

    useEffect(() => {
        fetchTickets()
    }, [])

    const onSubmit = async (data) => {
        const success = await createTicket(data)
        if (success) {
            setShowCreate(false)
            reset()
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700'
            case 'resolved': return 'bg-green-100 text-green-700'
            case 'closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-orange-100 text-orange-700'
        }
    }

    if (loading && tickets.length === 0) return <div className="p-20"><LoadingSpinner size="lg" /></div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Support Tickets</h1>
                    <p className="text-gray-500 mt-1">Need help? We're here for you.</p>
                </div>
                {!showCreate && (
                    <Button onClick={() => setShowCreate(true)} className="rounded-xl px-6 font-bold">
                        <Plus className="h-5 w-5 mr-2" /> New Ticket
                    </Button>
                )}
            </div>

            {showCreate && (
                <div className="mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-6">Create Support Ticket</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Subject"
                            placeholder="What can we help you with?"
                            error={errors.subject?.message}
                            {...register('subject')}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                                    {...register('category')}
                                >
                                    <option value="order">Order Issues</option>
                                    <option value="payment">Payment Problems</option>
                                    <option value="delivery">Delivery Status</option>
                                    <option value="account">Account Settings</option>
                                    <option value="refund">Refund Request</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                                    {...register('priority')}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Submit Ticket</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {tickets.length === 0 && !showCreate && (
                    <EmptyState
                        icon={MessageSquare}
                        title="No active tickets"
                        description="You haven't created any support tickets yet. If you need help, feel free to open a new one."
                        actionLabel="Create New Ticket"
                        actionPath="#" // Just for satisfying the component, we have a button above
                    />
                )}

                {tickets.map(ticket => (
                    <Link key={ticket._id} to={`/support/tickets/${ticket._id}`} className="block">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{ticket.subject}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Ticket ID: #{ticket._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                                <span className="flex items-center text-gray-500 font-medium">
                                    <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`flex items-center font-bold px-2 py-0.5 rounded-lg ${ticket.priority === 'high' ? 'text-red-600 bg-red-50' :
                                        ticket.priority === 'medium' ? 'text-orange-600 bg-orange-50' :
                                            'text-blue-600 bg-blue-50'
                                    }`}>
                                    <AlertCircle className="h-3 w-3 mr-1" /> {ticket.priority} priority
                                </span>
                                <span className="text-gray-400 capitalize">{ticket.category}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
