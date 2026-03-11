import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { User, Mail, Shield, Camera, Package, MapPin, HelpCircle, Phone, Calendar, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import API from '../../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user, fetchMe } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name,
            email: user?.email,
            phoneNumber: user?.phoneNumber || '',
            gender: user?.gender || '',
            dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            // Remove sensitive or non-updatable fields
            const { email, ...updateData } = data
            await API.patch('/users/me', updateData)
            await fetchMe()
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            return toast.error('Please upload an image file')
        }

        if (file.size > 2 * 1024 * 1024) {
            return toast.error('File size must be less than 2MB')
        }

        const formData = new FormData()
        formData.append('avatar', file)

        setUploadingAvatar(true)
        try {
            await API.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            await fetchMe()
            toast.success('Profile picture updated')
        } catch (error) {
            toast.error(error.message || 'Failed to upload profile picture')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')
    const avatarUrl = user?.profilePicture?.startsWith('http') 
        ? user.profilePicture 
        : `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${user?.profilePicture}`

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-black text-gray-900 mb-10">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="relative inline-block mb-4">
                            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-black text-primary-600 uppercase border-4 border-white shadow-lg overflow-hidden">
                                {user?.profilePicture ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt={user.name} 
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerText = user?.name?.charAt(0);
                                        }}
                                    />
                                ) : (
                                    user?.name?.charAt(0)
                                )}
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                            <button 
                                onClick={() => document.getElementById('avatar-upload').click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Shield className="h-3 w-3 mr-1" /> {user?.role}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        <Link to="/orders" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <Package className="h-5 w-5 mr-3 text-gray-400" /> My Orders
                        </Link>
                        <Link to="/addresses" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <MapPin className="h-5 w-5 mr-3 text-gray-400" /> Addresses
                        </Link>
                        <Link to="/support/tickets" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <HelpCircle className="h-5 w-5 mr-3 text-gray-400" /> Support Tickets
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h4>

                        <Input
                            label="Full Name"
                            placeholder="Your Name"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your@email.com"
                            disabled
                            {...register('email')}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <Input
                                    label="Phone Number"
                                    placeholder="10-digit number"
                                    error={errors.phoneNumber?.message}
                                    {...register('phoneNumber', { 
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Phone number must be 10 digits'
                                        }
                                    })}
                                />
                                {!user?.phoneNumber && (
                                    <span className="absolute right-0 top-0 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Add</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Gender</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none transition-all"
                                        {...register('gender')}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    {!user?.gender && (
                                        <span className="absolute right-0 -top-6 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Add</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <Input
                                label="Date of Birth"
                                type="date"
                                error={errors.dob?.message}
                                {...register('dob')}
                            />
                            {!user?.dob && (
                                <span className="absolute right-0 top-0 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Add</span>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <Button type="submit" isLoading={loading} className="w-full sm:w-auto px-10 rounded-xl font-bold">
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
