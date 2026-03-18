import { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Eye, EyeOff } from 'lucide-react'

export const Input = forwardRef(({ label, error, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType}
                    className={twMerge(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all',
                        isPassword && 'pr-11',
                        error ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-primary-500"
                        tabIndex="-1"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
})

Input.displayName = 'Input'
