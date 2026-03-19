import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutGrid, Trash2, Edit, X, Save, Plus, AlertTriangle } from 'lucide-react'

export default function AdminCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [editingCategory, setEditingCategory] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)

    const { register, handleSubmit, reset, setValue } = useForm()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/products/categories')
            setCategories(Array.isArray(data) ? data : data.data || [])
        } catch (error) {
            toast.error('Failed to fetch categories')
        } finally {
            setFetching(false)
        }
    }

    const onFormSubmit = async (data) => {
        setLoading(true)
        try {
            if (editingCategory) {
                await API.patch(`/products/categories/${editingCategory._id}`, data)
                toast.success('Category updated')
            } else {
                await API.post('/products/categories', data)
                toast.success('Category created')
            }
            fetchCategories()
            handleCloseForm()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed')
        } finally {
            setLoading(true) // Re-fetching will set to false
            setLoading(false)
        }
    }

    const deleteCategory = async (id) => {
        if (!window.confirm('Delete this category? This may fail if products are assigned to it.')) return
        try {
            await API.delete(`/products/categories/${id}`)
            toast.success('Category deleted')
            fetchCategories()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category')
        }
    }

    const startEdit = (category) => {
        setEditingCategory(category)
        setShowAddForm(true)
        setValue('name', category.name)
        setValue('description', category.description || '')
    }

    const handleCloseForm = () => {
        setShowAddForm(false)
        setEditingCategory(null)
        reset({ name: '', description: '' })
    }

    if (fetching) return <div className="p-20 text-center animate-pulse">Loading Categories...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center">
                        Categories <span className="ml-3 text-xs bg-primary-600 text-white px-3 py-1 rounded-full uppercase tracking-widest font-black">Management</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Organize and structure your product inventory</p>
                </div>
                {!showAddForm && (
                    <Button onClick={() => setShowAddForm(true)} className="rounded-2xl px-8 h-14 font-bold shadow-xl shadow-primary-100">
                        <Plus className="h-5 w-5 mr-2" /> Add Category
                    </Button>
                )}
            </div>

            {showAddForm && (
                <div className="mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </h2>
                        <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                        <Input label="Category Name" {...register('name', { required: true })} placeholder="e.g. Electronics" />
                        <div className="flex justify-end pt-4 gap-4">
                            <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>{editingCategory ? 'Update Category' : 'Create Category'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Icon / Label</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Slug</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center">
                                        <AlertTriangle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">No categories found</p>
                                    </td>
                                </tr>
                            )}
                            {categories.map(category => (
                                <tr key={category._id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100">
                                                <LayoutGrid className="h-6 w-6" />
                                            </div>
                                            <p className="font-bold text-gray-900 text-lg uppercase tracking-tight">{category.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                            {category.slug || category.name.toLowerCase().replace(/ /g, '-')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => startEdit(category)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => deleteCategory(category._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
