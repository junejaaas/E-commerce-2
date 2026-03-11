import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { useAddressStore } from '../../store/addressStore'

const addressSchema = z.object({
    fullName: z.string().min(2, 'Full name is too short'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    street: z.string().min(5, 'Street address is too short'),
    city: z.string().min(2, 'City is too short'),
    state: z.string().min(2, 'State is too short'),
    postalCode: z.string().min(6, 'Invalid postal code'),
    country: z.string().min(2, 'Country is too short'),
    isDefault: z.boolean().optional()
})

export default function AddressForm({ address, initialData, onSuccess, onCancel }) {
    const { addAddress, updateAddress, loading } = useAddressStore()
    const dataToUse = address || initialData;
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: dataToUse || {
            fullName: '',
            phoneNumber: '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            isDefault: false
        }
    })

    const onSubmit = async (data) => {
        let success = false
        if (dataToUse?._id) {
            success = await updateAddress(dataToUse._id, data)
        } else {
            success = await addAddress(data)
        }
        
        if (success && onSuccess) {
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                />
                <Input
                    label="Phone Number"
                    placeholder="1234567890"
                    error={errors.phoneNumber?.message}
                    {...register('phoneNumber')}
                />
            </div>

            <Input
                label="Street Address"
                placeholder="House No, Building, Street, Area"
                error={errors.street?.message}
                {...register('street')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="City"
                    placeholder="City"
                    error={errors.city?.message}
                    {...register('city')}
                />
                <Input
                    label="State"
                    placeholder="State"
                    error={errors.state?.message}
                    {...register('state')}
                />
                <Input
                    label="Postal Code"
                    placeholder="123456"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                />
            </div>

            <Input
                label="Country"
                placeholder="Country"
                error={errors.country?.message}
                {...register('country')}
            />

            <div className="flex items-center space-x-2">
                <input type="checkbox" id="isDefault" {...register('isDefault')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">Set as default address</label>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-6">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" isLoading={loading}>
                    {dataToUse?._id ? 'Update Address' : 'Save Address'}
                </Button>
            </div>
        </form>
    )
}
