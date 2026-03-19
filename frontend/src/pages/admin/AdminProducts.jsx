import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { PackagePlus, Image as ImageIcon, LayoutGrid, Trash2, Edit, X, Save, Search, Plus, AlertTriangle } from 'lucide-react'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [isNewCategory, setIsNewCategory] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState('all') // 'all', 'low', 'out'

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()

    const watchedOriginalPrice = watch('originalPrice')
    const watchedDiscountPercentage = watch('discountPercentage')

    // Auto-calculate discounted price when original price or percentage changes
    useEffect(() => {
        if (watchedOriginalPrice && watchedDiscountPercentage) {
            const disco = Math.round(watchedOriginalPrice * (1 - watchedDiscountPercentage / 100))
            setValue('discountedPrice', disco)
        }
    }, [watchedOriginalPrice, watchedDiscountPercentage, setValue])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products')
            setProducts(data.data?.products || data.products || [])
        } catch (error) {
            toast.error('Failed to fetch products')
        } finally {
            setFetching(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/products/categories')
            setCategories(Array.isArray(data) ? data : data.data || [])
        } catch (error) {
            console.error('Failed to fetch categories', error)
        }
    }

    const onCreateSubmit = async (data) => {
        setLoading(true)
        try {
            let categoryId = data.category

            if (isNewCategory) {
                const { data: newCat } = await API.post('/products/categories', { name: data.category })
                categoryId = newCat._id
                await fetchCategories()
            }

            const { imageUrl, ...rest } = data
            const productData = {
                ...rest,
                category: categoryId,
                images: [imageUrl || 'https://via.placeholder.com/300']
            }
            await API.post('/products', productData)
            toast.success('Product created')
            reset()
            setShowAddForm(false)
            setIsNewCategory(false)
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
        setEditData({ 
            ...product,
            originalPrice: product.originalPrice || product.price
        })
    }

    const saveEdit = async () => {
        try {
            // Only send fields that the validation allows
            const updatePayload = {
                name: editData.name,
                originalPrice: Number(editData.originalPrice),
                discountedPrice: Number(editData.discountedPrice),
                discountPercentage: Number(editData.discountPercentage),
                stock: Number(editData.stock),
                description: editData.description,
                brand: editData.brand,
                category: editData.category?._id || editData.category,
                isFeatured: editData.isFeatured
            }

            await API.patch(`/products/${editingId}`, updatePayload)
            toast.success('Product updated')
            setEditingId(null)
            fetchProducts()
        } catch (error) {
            console.error('Update product error:', error.response?.data || error)
            toast.error(error.response?.data?.message || 'Failed to update product')
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = searchTerm === '' ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'low' && p.stock > 0 && p.stock < 10) ||
            (stockFilter === 'out' && p.stock === 0)
        return matchesSearch && matchesStock
    })

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length
    const outOfStockCount = products.filter(p => p.stock === 0).length

    if (fetching) return <div className="p-20 text-center animate-pulse">Initializing inventory...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
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

            {/* Search + Stock Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by product name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {[
                        { key: 'all', label: `All (${products.length})` },
                        { key: 'low', label: `Low Stock (${lowStockCount})` },
                        { key: 'out', label: `Out of Stock (${outOfStockCount})` },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStockFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${stockFilter === f.key
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {showAddForm && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit(onCreateSubmit)} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Name" {...register('name', { required: true })} />
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Category</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewCategory(!isNewCategory)}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline"
                                    >
                                        {isNewCategory ? 'Select Existing' : 'Add New?'}
                                    </button>
                                </div>
                                {isNewCategory ? (
                                    <Input
                                        placeholder="New Category Name"
                                        {...register('category', { required: true })}
                                    />
                                ) : (
                                    <select
                                        {...register('category', { required: true })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Input label="Original Price" type="number" {...register('originalPrice', { required: true })} />
                            <Input label="Discount %" type="number" {...register('discountPercentage')} />
                            <Input label="Discounted Price" type="number" {...register('discountedPrice')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Stock" type="number" {...register('stock', { required: true })} />
                            <Input label="Brand" {...register('brand', { required: true })} />
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            <Input label="Image URL" {...register('imageUrl')} />
                        </div>
                        <textarea
                            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Product Description"
                            {...register('description', { required: true })}
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
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <AlertTriangle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">No products found</p>
                                    </td>
                                </tr>
                            )}
                            {filteredProducts.map(product => {
                                const imgSrc = typeof product.images?.[0] === 'string'
                                    ? product.images[0]
                                    : (product.images?.[0]?.url || 'https://via.placeholder.com/40')
                                return (
                                    <tr key={product._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-gray-50 p-1 shrink-0 border border-gray-100">
                                                    <img src={imgSrc} className="h-full w-full object-contain" />
                                                </div>
                                                <div>
                                                    {editingId === product._id ? (
                                                        <div className="space-y-2 w-full">
                                                            <input
                                                                className="font-bold text-gray-900 border-b border-primary-500 outline-none w-full"
                                                                value={editData.name}
                                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                                placeholder="Name"
                                                            />
                                                            <input
                                                                className="text-xs text-gray-600 border-b border-gray-200 outline-none w-full"
                                                                value={editData.brand}
                                                                onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                                                                placeholder="Brand"
                                                            />
                                                            <textarea
                                                                className="text-[10px] text-gray-500 border border-gray-100 rounded-md outline-none w-full p-1 h-12"
                                                                value={editData.description}
                                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                                placeholder="Description"
                                                            />
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editData.isFeatured}
                                                                    onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })}
                                                                    id={`featured-${product._id}`}
                                                                />
                                                                <label htmlFor={`featured-${product._id}`} className="text-[10px] font-bold uppercase text-gray-400">Featured</label>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium italic">{product.brand}</p>
                                                        </>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {product._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                                {editingId === product._id ? (
                                                    <select
                                                        className="text-xs font-black text-gray-500 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded-full outline-none focus:ring-1 focus:ring-primary-500"
                                                        value={editData.category?._id || editData.category}
                                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                                                        {product.category?.name || product.category}
                                                    </span>
                                                )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {editingId === product._id ? (
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-[10px] w-12 text-gray-400 font-bold">Orig:</span>
                                                        <input
                                                            type="number"
                                                            className="font-black text-gray-600 border-b border-gray-200 outline-none w-20 text-xs"
                                                            value={editData.originalPrice}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const newData = { ...editData, originalPrice: val };
                                                                if (newData.discountPercentage) {
                                                                    newData.discountedPrice = Math.round(val * (1 - newData.discountPercentage / 100));
                                                                }
                                                                setEditData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-[10px] w-12 text-gray-400 font-bold">Disc %:</span>
                                                        <input
                                                            type="number"
                                                            className="font-black text-primary-600 border-b border-primary-500 outline-none w-20 text-xs"
                                                            value={editData.discountPercentage}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const newData = { ...editData, discountPercentage: val };
                                                                if (newData.originalPrice) {
                                                                    newData.discountedPrice = Math.round(newData.originalPrice * (1 - val / 100));
                                                                }
                                                                setEditData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className={`font-black ${product.discountedPrice ? 'text-gray-400 line-through text-xs' : 'text-primary-600'}`}>
                                                        ${product.originalPrice || product.price}
                                                    </span>
                                                    {product.discountedPrice && (
                                                        <span className="font-black text-primary-600">
                                                            ${product.discountedPrice}
                                                            <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">-{product.discountPercentage}%</span>
                                                        </span>
                                                    )}
                                                </div>
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
                                                <span className={product.stock === 0 ? 'text-red-500 font-black' : product.stock < 10 ? 'text-orange-500' : ''}>
                                                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                                                </span>
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
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
