import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await API.post('/auth/forgot-password', data)
            toast.success('OTP sent to your email')
            navigate('/verify-otp', { state: { email: data.email } })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
                    <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        error={errors.email?.message}
                        {...register('email', { required: 'Email is required' })}
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Send Reset Link
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}
