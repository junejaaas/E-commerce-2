import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import API from '../../services/api'
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeliveryResetPassword() {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()
    const { fetchMe, logout } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        if (oldPassword === newPassword) {
            toast.error('New password must be different from the old password')
            return
        }

        setLoading(true)
        try {
            await API.patch('/delivery/reset-password', {
                oldPassword,
                newPassword
            })
            
            toast.success('Password updated successfully!')
            await fetchMe() // Refresh user data so mustResetPassword = false
            navigate('/delivery')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tighter">
                    Action Required
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
                    For your security, you must change your temporary password before accessing the delivery system.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-primary-500 transition-colors text-sm font-medium"
                                    placeholder="Enter current password"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-primary-500 transition-colors text-sm font-medium"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-primary-500 transition-colors text-sm font-medium"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password securely'}
                            </button>
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
