import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../../services/api'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { toast } from 'react-hot-toast'

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()
    const { email, otp } = location.state || {}
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)

    if (!email || !otp) {
        navigate('/forgot-password')
        return null
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await API.post('/auth/reset-password', {
                email,
                otp,
                newPassword: data.password
            })
            toast.success('Password reset successful!')
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-gray-500 mt-2">Enter your new secure password</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Min 8 characters' }
                        })}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                            validate: value => value === watch('password') || 'Passwords do not match'
                        })}
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    )
}
