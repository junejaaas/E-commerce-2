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
    const [editingProduct, setEditingProduct] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState('all') // 'all', 'low', 'out'
    const [selectedProducts, setSelectedProducts] = useState([])
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isUploading, setIsUploading] = useState(false)

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            status: 'active',
            tags: '',
            variants: '',
            isFeatured: false,
            seoTitle: '',
            seoDescription: ''
        }
    })

    const [imageUrlInputs, setImageUrlInputs] = useState([''])
    const addImageUrlInput = () => setImageUrlInputs([...imageUrlInputs, ''])
    const updateImageUrlInput = (index, value) => {
        const newInputs = [...imageUrlInputs]
        newInputs[index] = value
        setImageUrlInputs(newInputs)
    }
    const removeImageUrlInput = (index) => {
        if (imageUrlInputs.length > 1) {
            setImageUrlInputs(imageUrlInputs.filter((_, i) => i !== index))
        }
    }

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

    const onFormSubmit = async (data) => {
        setLoading(true)
        try {
            let categoryId = data.category

            if (isNewCategory) {
                const { data: newCat } = await API.post('/products/categories', { name: data.category })
                categoryId = newCat._id
                await fetchCategories()
            } else if (typeof data.category === 'object' && data.category?._id) {
                // Handle cases where reset(product) might have put the category object in data
                categoryId = data.category._id
            }

            const { 
                _id, id, sold, ratingsAverage, ratingsQuantity, createdAt, updatedAt, slug, __v,
                imageUrl, // legacy field from previous versions
                category, // we handle this separately
                ...sanitizedData 
            } = data

            const productData = {
                ...sanitizedData,
                category: categoryId,
                price: Number(data.price),
                stock: Number(data.stock),
                discountPrice: data.discountPrice !== "" ? Number(data.discountPrice) : 0,
                // Filter out empty URL inputs
                images: imageUrlInputs.filter(url => url.trim() !== ''),
                // Parse comma-separated strings
                tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(t => t) : (data.tags || []),
                variants: typeof data.variants === 'string' ? data.variants.split(',').map(v => v.trim()).filter(v => v) : (data.variants || [])
            }

            if (editingProduct) {
                await API.patch(`/products/${editingProduct._id}`, productData)
                toast.success('Product updated')
            } else {
                await API.post('/products', productData)
                toast.success('Product created')
            }
            handleCloseForm()
            fetchProducts()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setIsUploading(true)
        const formData = new FormData()
        files.forEach(file => formData.append('images', file))
        formData.append('prefix', 'product')

        try {
            const { data } = await API.post('/products/upload-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const newUrls = data.data.urls
            setImageUrlInputs(prev => {
                const filtered = prev.filter(url => url.trim() !== '')
                return [...filtered, ...newUrls]
            })
            toast.success(`${files.length} image(s) uploaded`)
        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return
        try {
            await Promise.all(selectedProducts.map(id => API.delete(`/products/${id}`)))
            toast.success('Selected products deleted')
            setSelectedProducts([])
            fetchProducts()
        } catch (error) {
            toast.error('Bulk delete failed')
        }
    }

    const bulkToggleStatus = async () => {
        try {
            await Promise.all(selectedProducts.map(id => {
                const product = products.find(p => p._id === id)
                const newStatus = product.status === 'active' ? 'inactive' : 'active'
                return API.patch(`/products/${id}`, { status: newStatus })
            }))
            toast.success('Status updated for selected products')
            setSelectedProducts([])
            fetchProducts()
        } catch (error) {
            toast.error('Bulk status update failed')
        }
    }

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(filteredProducts.map(p => p._id))
        }
    }

    const toggleSelect = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleCloseForm = () => {
        setShowAddForm(false)
        setEditingProduct(null)
        setIsNewCategory(false)
        setImageUrlInputs([''])
        reset({
            name: '',
            brand: '',
            category: '',
            price: '',
            stock: '',
            sku: '',
            discountPrice: '',
            description: '',
            status: 'active',
            tags: '',
            variants: ''
        })
    }

    const toggleStatus = async (product) => {
        const newStatus = product.status === 'active' ? 'inactive' : 'active'
        try {
            await API.patch(`/products/${product._id}`, { status: newStatus })
            toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
            fetchProducts()
        } catch (error) {
            toast.error('Failed to update status')
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

    const startEdit = (product) => {
        setEditingProduct(product)
        setShowAddForm(true)
        
        // Populate form fields
        reset({
            ...product,
            category: product.category?._id || product.category,
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            variants: Array.isArray(product.variants) ? product.variants.join(', ') : ''
        })
        
        // Handle images
        if (product.images && product.images.length > 0) {
            setImageUrlInputs(product.images)
        } else {
            setImageUrlInputs([''])
        }

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = searchTerm === '' ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'low' && p.stock > 0 && p.stock < 10) ||
            (stockFilter === 'out' && p.stock === 0)
        const matchesCategory = categoryFilter === 'all' || 
            (p.category?._id === categoryFilter || p.category === categoryFilter)
        return matchesSearch && matchesStock && matchesCategory
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
                {!showAddForm && (
                    <Button onClick={() => setShowAddForm(true)} className="rounded-2xl px-8 shadow-xl shadow-primary-100">
                        <Plus className="h-5 w-5 mr-2" /> New Product
                    </Button>
                )}
                {selectedProducts.length > 0 && (
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-xs font-black text-primary-600 uppercase tracking-widest">{selectedProducts.length} Selected</span>
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-xl space-x-1">
                            <button onClick={bulkToggleStatus} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all flex items-center">
                                <Plus className="h-3 w-3 mr-1" /> Toggle Status
                            </button>
                            <button onClick={bulkDelete} className="px-4 py-2 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-all flex items-center">
                                <Trash2 className="h-3 w-3 mr-1" /> Delete All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Search + Stock Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm min-w-[150px]"
                >
                    <option value="all">Categories: All</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
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
                    <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Name" {...register('name', { required: true })} />
                            <Input label="Brand" {...register('brand', { required: true })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        
                        {/* Media Upload Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                            
                            <div className="p-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-4 hover:bg-gray-100/50 transition-colors">
                                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto" />
                                <div>
                                    <p className="text-sm font-bold text-gray-500">Upload images from your computer</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 2MB</p>
                                </div>
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    id="file-upload" 
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => document.getElementById('file-upload').click()}
                                    isLoading={isUploading}
                                    className="rounded-xl"
                                >
                                    Select Files
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 py-2">
                                <span className="h-[1px] bg-gray-100 flex-1"></span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or enter URLs manually</span>
                                <span className="h-[1px] bg-gray-100 flex-1"></span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {imageUrlInputs.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder={`Image URL ${index + 1}`}
                                            value={url}
                                            onChange={(e) => updateImageUrlInput(index, e.target.value)}
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageUrlInput(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addImageUrlInput}
                                className="flex items-center text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Manual URL
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Price" type="number" {...register('price', { required: true })} />
                            <Input label="Discount Price" type="number" {...register('discountPrice')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="SKU" {...register('sku', { required: true })} />
                            <Input label="Stock" type="number" {...register('stock', { required: true })} />
                        </div>

                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Advanced Settings</h3>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs font-bold text-gray-700 tracking-wider">Mark as Featured</span>
                                    <input type="checkbox" {...register('isFeatured')} className="h-6 w-6 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="SEO Meta Title" {...register('seoTitle')} placeholder="For search engines" />
                                <Input label="SEO Meta Description" {...register('seoDescription')} placeholder="Short snippet for Google" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
                                <Input label="Tags (comma separated)" {...register('tags')} />
                                <Input label="Variants (e.g. Red, Blue, XL)" {...register('variants')} />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <select
                                        {...register('status')}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <textarea
                            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Product Description"
                            {...register('description', { required: true })}
                        />
                        <div className="flex justify-end pt-4 gap-4">
                            <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>{editingProduct ? 'Update Product' : 'Create Product'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600" 
                                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Product / SKU</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Stats</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
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
                                    <tr key={product._id} className={`${selectedProducts.includes(product._id) ? 'bg-primary-50/30' : 'hover:bg-gray-50/30'} transition-colors group`}>
                                        <td className="px-8 py-6">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600" 
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelect(product._id)}
                                            />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-gray-50 p-1 shrink-0 border border-gray-100 relative">
                                                    <img src={imgSrc} className="h-full w-full object-contain" />
                                                    {product.isFeatured && (
                                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm">
                                                            <Plus className="h-3 w-3 rotate-45" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {product._id.slice(-6)}</p>
                                                        {product.sku && (
                                                            <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest bg-primary-50 px-1.5 rounded">SKU: {product.sku}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                                                {product.category?.name || product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sold</span>
                                                <span className="font-bold text-gray-700">{product.sold || 0}</span>
                                                <div className="flex items-center mt-1 text-yellow-500">
                                                    <span className="text-[10px] font-black mr-1">{product.ratingsAverage || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary-600">${product.price}</span>
                                                {product.discountPrice > 0 && (
                                                    <span className="text-[10px] text-red-500 font-bold line-through ml-0.5 opacity-50">Was ${product.discountPrice + product.price}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-600">
                                            <span className={product.stock === 0 ? 'text-red-500 font-black' : product.stock < 10 ? 'text-orange-500' : ''}>
                                                {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${product.status === 'active'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {product.status || 'active'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit className="h-5 w-5" /></button>
                                                <button onClick={() => deleteProduct(product._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
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
