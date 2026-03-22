import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import API from '../../services/api';
import { 
    Users, Plus, Mail, Phone, Trash2, 
    ShieldCheck, Search, Loader2, X 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { toast } from 'react-hot-toast';

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'agent123', // Default password
        phoneNumber: ''
    });

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/admin/agents');
            setAgents(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/agents', formData);
            toast.success('Delivery Agent Created!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: 'agent123', phoneNumber: '' });
            fetchAgents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating agent');
        }
    };

    const handleDeleteAgent = async (id) => {
        if (!window.confirm('Remove this delivery agent?')) return;
        try {
            await API.delete(`/admin/agents/${id}`);
            toast.success('Agent Removed');
            fetchAgents();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredAgents = agents.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Delivery Fleet</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage and onboard your delivery personnel</p>
                </div>
                <Button 
                    onClick={() => setShowModal(true)}
                    className="rounded-2xl shadow-xl shadow-primary-100 flex items-center gap-2 px-8"
                >
                    <Plus className="h-5 w-5" /> Onboard New Agent
                </Button>
            </div>

            {/* Quick Filter */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-primary-50 px-6 py-4 rounded-2xl border border-primary-100 flex flex-col min-w-[140px]">
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Active Agents</span>
                        <span className="text-2xl font-black text-primary-700 leading-none">{agents.length}</span>
                    </div>
                </div>
            </div>

            {/* Agents Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Agent Details</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Credentials</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Joined Date</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {filteredAgents.map(agent => (
                                    <tr key={agent._id} className="hover:bg-primary-50/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                    {agent.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-none mb-1">{agent.name}</p>
                                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {agent.phoneNumber || 'No phone'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                {agent.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-gray-400 font-medium tracking-tight">
                                            {new Date(agent.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDeleteAgent(agent._id)}
                                                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAgents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center text-gray-400 font-black tracking-widest uppercase text-xs">No agents found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Onboard Agent</h3>
                                <p className="text-gray-500 font-medium text-xs mt-1">Their portal access will be granted instantly</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        
                        <form onSubmit={handleCreateAgent} className="p-8 space-y-5">
                            <Input 
                                label="Full Name" 
                                placeholder="E.g. Rahul Kumar"
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                containerClassName="rounded-2xl"
                            />
                            <Input 
                                label="Email Address" 
                                type="email"
                                placeholder="E.g. rahul@delivery.com"
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                            <Input 
                                label="Phone Number" 
                                placeholder="E.g. +91 9876543210"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-2">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> Security Note
                                </p>
                                <p className="text-xs font-semibold text-amber-800">Assigning default password: <span className="font-black underline">agent123</span>. They can change this later.</p>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 rounded-2xl border-2" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button className="flex-1 rounded-2xl font-black shadow-xl shadow-primary-200" type="submit">Complete Onboarding</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
