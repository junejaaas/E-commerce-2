import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { PackagePlus, Image as ImageIcon, LayoutGrid, Trash2, Edit, X, Save, Search, Plus } from 'lucide-react'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products')
            setProducts(data.products || data)
        } catch (error) {
            toast.error('Failed to fetch products')
        } finally {
            setFetching(false)
        }
    }

    const onCreateSubmit = async (data) => {
        setLoading(true)
        try {
            const productData = {
                ...data,
                images: [{ public_id: 'default', url: data.imageUrl || 'https://via.placeholder.com/300' }]
            }
            await API.post('/products', productData)
            toast.success('Product created')
            reset()
            setShowAddForm(false)
            fetchProducts()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        try {
            await API.delete(`/products/${id}`)
            toast.success('Product deleted')
            setProducts(products.filter(p => p._id !== id))
        } catch (error) {
            toast.error('Failed to delete product')
        }
    }

    const [editData, setEditData] = useState({})
    const startEdit = (product) => {
        setEditingId(product._id)
        setEditData({ ...product })
    }

    const saveEdit = async () => {
        try {
            await API.patch(`/products/${editingId}`, editData)
            toast.success('Product updated')
            setEditingId(null)
            fetchProducts()
        } catch (error) {
            toast.error('Failed to update product')
        }
    }

    if (fetching) return <div className="p-20 text-center animate-pulse">Initializing inventory...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center">
                        Inventory <span className="ml-3 text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">{products.length} Items</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your store's products and stock</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-2xl px-8 shadow-xl shadow-primary-100">
                    {showAddForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {showAddForm ? 'Cancel' : 'New Product'}
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit(onCreateSubmit)} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Name" {...register('name', { required: true })} />
                            <Input label="Category" {...register('category', { required: true })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Input label="Price" type="number" {...register('price', { required: true })} />
                            <Input label="Stock" type="number" {...register('stock', { required: true })} />
                            <Input label="Image URL" {...register('imageUrl')} />
                        </div>
                        <textarea
                            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Product Description"
                            {...register('description')}
                        />
                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={loading}>Create Product</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-50 p-1 shrink-0 border border-gray-100">
                                                <img src={product.images?.[0]?.url} className="h-full w-full object-contain" />
                                            </div>
                                            <div>
                                                {editingId === product._id ? (
                                                    <input
                                                        className="font-bold text-gray-900 border-b border-primary-500 outline-none w-full"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                )}
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {product._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                                            {product.category?.name || product.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        {editingId === product._id ? (
                                            <input
                                                type="number"
                                                className="font-black text-primary-600 border-b border-primary-500 outline-none w-20"
                                                value={editData.price}
                                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-black text-primary-600">${product.price}</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 font-bold text-gray-600">
                                        {editingId === product._id ? (
                                            <input
                                                type="number"
                                                className="border-b border-primary-500 outline-none w-16"
                                                value={editData.stock}
                                                onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                                            />
                                        ) : (
                                            <span className={product.stock < 10 ? 'text-orange-500' : ''}>{product.stock} units</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            {editingId === product._id ? (
                                                <>
                                                    <button onClick={saveEdit} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><Save className="h-5 w-5" /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit className="h-5 w-5" /></button>
                                                    <button onClick={() => deleteProduct(product._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
                                                </>
                                            )}
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
