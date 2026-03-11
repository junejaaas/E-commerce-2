import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../../services/api'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)

    if (!email) {
        navigate('/forgot-password')
        return null
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await API.post('/auth/verify-otp', { email, otp: data.otp })
            toast.success('OTP Verified!')
            navigate('/reset-password', { state: { email, otp: data.otp } })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
                    <p className="text-gray-500 mt-2">Enter the 6-digit code sent to {email}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="OTP Code"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        error={errors.otp?.message}
                        {...register('otp', {
                            required: 'OTP is required',
                            pattern: { value: /^[0-9]{6}$/, message: 'Must be 6 digits' }
                        })}
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Verify OTP
                    </Button>
                </form>
            </div>
        </div>
    )
}
