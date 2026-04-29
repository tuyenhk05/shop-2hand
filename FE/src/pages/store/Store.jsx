import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, TreeSelect } from 'antd';
import { getAllProducts } from '../../services/client/products';
import { getAllCategories } from '../../services/client/category.service';
import { addToCartApi } from '../../services/client/cart.service';
import { addToWishlistApi, getWishlistApi, removeFromWishlistApi } from '../../services/client/wishlist.service';
import { getCookie } from '../../helpers/cookie';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from "../../hooks/useScrollToTop";
import { useSelector } from 'react-redux';

// ─── Helper ───────────────────────────────────────────────────
const conditionLabel = (c) => ({ new: 'Mới', like_new: 'Như mới', good: 'Tốt', fair: 'Khá', poor: 'Cũ' }[c] || c);

const getMainImageHelper = (product) => {
    if (product.images && product.images.length > 0) {
        const primary = product.images.find(img => img.isPrimary);
        if (primary && primary.imageUrl) return primary.imageUrl;
        return product.images[0].imageUrl;
    }
    return 'https://placehold.co/400x500?text=No+Image';
};

const formatPriceHelper = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// ─── ProductCard tách riêng để tránh re-mount khi state thay đổi ───
const ProductCard = memo(({ item, isLarge, wishlisted, onWishlist, onCart, onNavigate }) => {
    const isMuseumQuality = item.condition === 'like_new' || item.price > 1000;
    return (
        <AnimateWhenVisible direction="fadeInUp" className="group cursor-pointer h-full">
            <div onClick={() => onNavigate(`/products/${item.slug || item._id}`)} className="h-full flex flex-col">
                {/* Ảnh */}
                <div className={`relative overflow-hidden rounded-2xl bg-surface-container-low flex-shrink-0 ${isLarge ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
                    <img
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        src={getMainImageHelper(item)}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500/eeeeee/aaaaaa?text=No+Image'; }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Badge */}
                    {isMuseumQuality && (
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm text-on-surface text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">✦ Chọn lọc</span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
                        <button
                            onClick={(e) => onWishlist(e, item._id || item.slug)}
                            className={`w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${wishlisted ? 'bg-primary text-white' : 'bg-white/90 text-primary hover:bg-primary hover:text-white'}`}
                            title={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                        >
                            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                        <button
                            onClick={(e) => onCart(e, item._id || item.slug)}
                            className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-lg active:scale-90 transition-all hover:bg-primary hover:text-white"
                            title="Thêm vào giỏ"
                        >
                            <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
                        </button>
                    </div>

                    {/* Giá nổi khi hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 py-4 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-1 group-hover:translate-y-0 pointer-events-none">
                        <span className="text-white font-manrope font-bold text-xl drop-shadow-lg">{formatPriceHelper(item.price)}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 px-0.5 flex-1">
                    <h3 className={`font-notoSerif font-bold text-on-surface leading-snug mb-1.5 line-clamp-2 ${isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-xl'}`}>
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs text-on-surface-variant">{item.categoryId?.name || 'Thời trang'}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/60 inline-block" />
                        <span className="text-xs text-on-surface-variant">{conditionLabel(item.condition)}</span>
                        {item.brandId?.name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-outline-variant/60 inline-block" />
                                <span className="text-xs font-semibold text-primary">{item.brandId.name}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-primary font-manrope font-bold text-lg">{formatPriceHelper(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-on-surface-variant line-through">{formatPriceHelper(item.originalPrice)}</span>
                        )}
                    </div>
                </div>
            </div>
        </AnimateWhenVisible>
    );
});


const Store = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.auth.isLogin);
    console.log(isLoggedIn);
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // New state for backend categories
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = useSelector((state) => state.auth.userId);

    // Filtering states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || undefined);
    const [selectedCondition, setSelectedCondition] = useState('');
    const [selectedListingType, setSelectedListingType] = useState('');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    // Đồng bộ URL parameter vào state cục bộ
    useEffect(() => {
        const q = searchParams.get('q');
        const cat = searchParams.get('category');
        if (q !== null) setSearchQuery(q);
        if (cat !== null) setSelectedCategory(cat);
    }, [searchParams]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setSearchParams(prev => {
            if (val) prev.set('q', val);
            else prev.delete('q');
            return prev;
        });
    };

    // Advanced Filter Modal
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('latest'); // latest, price_asc, price_desc
    // Số lượng sản phẩm hiển thị (Load More)
    const [visibleCount, setVisibleCount] = useState(10);

    // Reset pagination when any filter changes
    useEffect(() => {
        setVisibleCount(10);
    }, [selectedCategory, selectedCondition, selectedListingType, searchQuery, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);
                
                if (productRes && (productRes.data || productRes.success)) {
                    setProducts(productRes.data || productRes);
                }
                
                if (categoryRes && categoryRes.success) {
                    setCategories(categoryRes.data);
                }
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchWishlist = async () => {
            if (!userId) {
                setWishlistIds([]);
                return;
            }
            try {
                const res = await getWishlistApi(userId);
                if (res && res.data) {
                    // Chuẩn hóa tất cả IDs thành string để so sánh chính xác
                    const ids = res.data
                        .map(item => String(item.productId?._id || item.productId || ''))
                        .filter(Boolean);
                    setWishlistIds(ids);
                }
            } catch (error) {
                console.error("Fetch wishlist error:", error);
            }
        };

        fetchProductsAndCategories();
        fetchWishlist();
    }, [userId]);

    // Build tree data for TreeSelect
    const categoryTreeData = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        
        const map = {};
        const roots = [];
        
        // 1. Initialize map
        categories.forEach(cat => {
            map[cat._id] = {
                title: cat.name,
                value: cat._id,
                key: cat._id,
                children: []
            };
        });
        
        // 2. Build tree
        categories.forEach(cat => {
            const parentId = cat.parent_id?._id || cat.parent_id;
            
            if (parentId && map[parentId]) {
                map[parentId].children.push(map[cat._id]);
            } else {
                roots.push(map[cat._id]);
            }
        });
        
        return roots;
    }, [categories]);

    // Recursive helper to get all descendant IDs of a category
    const getAllDescendantIds = (categoryId, allCategories) => {
        let descendantIds = [];
        const children = allCategories.filter(cat => {
            const pid = cat.parent_id?._id || cat.parent_id;
            return pid === categoryId;
        });
        
        children.forEach(child => {
            descendantIds.push(child._id);
            // recursive call
            descendantIds = descendantIds.concat(getAllDescendantIds(child._id, allCategories));
        });
        
        return descendantIds;
    };

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();
        if (!userId) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        try {
            const res = await addToCartApi(userId, productId, 1);
            if (res && res.success) {
                message.success('Đã thêm vào giỏ hàng!');
            } else {
                message.warning(res.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleAddToWishlist = async (e, productId) => {
        e.stopPropagation();
        if (!userId) {
            message.warning('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
            navigate('/login');
            return;
        }
        const pid = String(productId);
        const isFavorite = wishlistIds.includes(pid);

        try {
            if (isFavorite) {
                const res = await removeFromWishlistApi(userId, pid);
                if (res && res.success) {
                    setWishlistIds(prev => prev.filter(id => id !== pid));
                    message.info('Đã xóa khỏi danh sách yêu thích.');
                }
            } else {
                const res = await addToWishlistApi(userId, pid);
                if (res && res.success) {
                    setWishlistIds(prev => [...prev, pid]);
                    message.success('Đã thêm vào danh sách yêu thích!');
                } else if (res && res.message) {
                    message.warning(res.message);
                }
            }
        } catch (error) {
            console.error('Lỗi khi thao tác wishlist:', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    // Helper kiểm tra 1 sản phẩm có đang được yêu thích không
    const isWishlisted = (item) => wishlistIds.includes(String(item._id || item.slug || ''));

    // Helper format price
    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    // Helper get image
    const getMainImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.isPrimary);
            if (primary && primary.imageUrl) return primary.imageUrl;
            return product.images[0].imageUrl;
        }
        return 'https://placehold.co/400x500?text=No+Image';
    }

    // Trích xuất các danh mục duy nhất
    const uniqueCategories = [...new Set(products.map(item => item.categoryId?.name).filter(Boolean))];
    const uniqueConditions = [...new Set(products.map(item => item.condition).filter(Boolean))];
    const uniqueListingTypes = [...new Set(products.map(item => item.listingType).filter(Boolean))];

    // Tạo Banner nổi bật lấy 4 SP đầu (hoặc ngẫu nhiên)
    const featuredProducts = products.slice(0, 4);
    // Tạo Banner xem gần đây (lấy 5 SP cuối)
    const recentProducts = [...products].reverse().slice(0, 5);
    const totalCO2Saved = products.length * 14;

    // ---- FILTERING LOGIC ----
    let filteredProducts = products.filter(p => {
        if (selectedCategory) {
            const productCatId = String(p.categoryId?._id || p.categoryId || '');
            const selectedCatStr = String(selectedCategory);
            const validIds = [selectedCatStr, ...getAllDescendantIds(selectedCatStr, categories).map(String)];
            
            if (!validIds.includes(productCatId)) {
                return false;
            }
        }
        
        if (selectedCondition && p.condition !== selectedCondition) return false;
        if (selectedListingType && p.listingType !== selectedListingType) return false;
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;

        return true;
    });

    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else {
        // Mặc định: Sắp xếp theo position tăng dần, sau đó đến ngày tạo giảm dần
        filteredProducts.sort((a, b) => {
            const posA = a.position || 0;
            const posB = b.position || 0;
            if (posA !== posB) return posA - posB;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }


    return (
        <div className="pt-10 pb-32 px-6 max-w-7xl mx-auto w-full relative">
            {/* Search & Editorial Header */}
            <AnimateWhenVisible direction="fadeInDown" className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-7xl font-notoSerif font-bold tracking-tighter text-on-surface mb-4">Kho lưu trữ</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
                            Tuyển chọn các tạo tác đồ cũ, được nâng niu với sự tôn trọng dành cho thiết kế cao cấp. Sự sang trọng bền vững cho nhà sưu tập có ý thức.
                        </p>
                    </div>
                    <div className="w-full md:w-96">
                        <div className="relative flex items-center bg-surface-container-highest rounded-xl p-1">
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-on-surface placeholder-on-surface-variant/60 outline-none"
                                placeholder="Tìm kiếm sản phẩm tuyển chọn..."
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-sm font-medium transition-transform active:scale-95 shadow-sm">
                                <span className="material-symbols-outlined text-sm" data-icon="search">search</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Featured Curations Banner (Dynamic API Data) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {featuredProducts.length > 0 ? (
                        featuredProducts.map((item, idx) => (
                            <div key={idx} onClick={() => navigate(`/products/${item.slug || item._id}`)} className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer">
                                <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={getMainImage(item)} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-end p-4">
                                    <span className="text-white font-notoSerif font-bold text-lg leading-tight line-clamp-2">{item.title}</span>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>

                {/* Smart Filters (Dynamic from API Data) */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-4 overflow-x-auto hide-scrollbar pb-2">

                        {/* Category */}
                        <div className="flex items-center gap-2 pr-4 border-r border-outline-variant/30 min-w-[250px]">
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex-shrink-0">Danh mục</span>
                            <TreeSelect
                                style={{ width: '100%', minWidth: '200px' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 1000 }}
                                treeData={categoryTreeData}
                                placeholder="Tất cả danh mục"
                                treeDefaultExpandAll
                                allowClear
                                value={selectedCategory}
                                onChange={(newValue) => {
                                    setSelectedCategory(newValue || undefined);
                                    setSearchParams(prev => {
                                        if (newValue) prev.set('category', newValue);
                                        else prev.delete('category');
                                        return prev;
                                    });
                                }}
                            />
                        </div>

                        {/* Condition */}
                        <div className="flex items-center gap-2 pr-4 border-r border-outline-variant/30">
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tình trạng</span>
                            <div className="flex gap-2">
                                <span
                                    onClick={() => setSelectedCondition('')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${selectedCondition === '' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                                    Tất cả
                                </span>
                                {uniqueConditions.length > 0 && uniqueConditions.map((cond, idx) => (
                                    <span key={idx}
                                        onClick={() => setSelectedCondition(cond)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${selectedCondition === cond ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                                        {cond === 'like_new' ? 'Như mới' : cond === 'good' ? 'Tốt' : cond === 'fair' ? 'Khá' : cond === 'new' ? 'Mới' : cond}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Listing Type */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loại đăng</span>
                            <div className="flex gap-2">
                                <span
                                    onClick={() => setSelectedListingType('')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${selectedListingType === '' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                                    Tất cả
                                </span>
                                {uniqueListingTypes.length > 0 && uniqueListingTypes.map((type, idx) => (
                                    <span key={idx}
                                        onClick={() => setSelectedListingType(type)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${selectedListingType === type ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                                        {type === 'direct_sale' ? 'Trực tiếp' : type === 'consignment' ? 'Ký gửi' : type === 'buyback' ? 'Thu mua' : type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-outline-variant/10">
                        <span className="text-sm font-manrope text-on-surface-variant italic">Đang hiển thị {filteredProducts.length} tác phẩm tuyển chọn</span>
                        <button onClick={() => setIsAdvancedFilterOpen(true)} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                            <span className="material-symbols-outlined text-lg" data-icon="tune">tune</span> Bộ lọc Nâng cao
                        </button>
                    </div>
                </div>
            </AnimateWhenVisible>

            {/* Advanced Filters Modal Overlay */}
            {isAdvancedFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
                        <button onClick={() => setIsAdvancedFilterOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
                            <span className="material-symbols-outlined" data-icon="close">close</span>
                        </button>
                        <h3 className="font-notoSerif text-2xl font-bold mb-6 text-on-surface">Bộ lọc Nâng cao</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">Khoảng giá</label>
                                <div className="flex items-center gap-4">
                                    <input type="number" placeholder="Tối thiểu" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-4 py-2 bg-surface-container rounded-lg focus:outline-primary border-none" />
                                    <span className="text-on-surface-variant">-</span>
                                    <input type="number" placeholder="Tối đa" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-4 py-2 bg-surface-container rounded-lg focus:outline-primary border-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">Sắp xếp theo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setSortBy('latest')} className={`py-2 rounded-lg text-sm font-medium border ${sortBy === 'latest' ? 'border-primary bg-primary-fixed text-on-primary-fixed' : 'border-outline-variant/30 hover:bg-surface-container'}`}>Mới nhất</button>
                                    <button onClick={() => setSortBy('price_asc')} className={`py-2 rounded-lg text-sm font-medium border ${sortBy === 'price_asc' ? 'border-primary bg-primary-fixed text-on-primary-fixed' : 'border-outline-variant/30 hover:bg-surface-container'}`}>Giá: Thấp tới Cao</button>
                                    <button onClick={() => setSortBy('price_desc')} className={`col-span-2 py-2 rounded-lg text-sm font-medium border ${sortBy === 'price_desc' ? 'border-primary bg-primary-fixed text-on-primary-fixed' : 'border-outline-variant/30 hover:bg-surface-container'}`}>Giá: Cao tới Thấp</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('latest'); }} className="flex-1 py-3 text-sm font-bold bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors">
                                Xóa bộ lọc
                            </button>
                            <button onClick={() => setIsAdvancedFilterOpen(false)} className="flex-1 py-3 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-lg hover:opacity-90 transition-opacity">
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid – bố cục 2 cột xen kẽ (7+5 / 5+7) */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-20 text-on-surface-variant font-bold">
                        Đang lấy dữ liệu từ kho lưu trữ...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-on-surface-variant">
                        Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </div>
                ) : (() => {
                    // Gom sản phẩm thành từng hàng 2 SP
                    const visible = filteredProducts.slice(0, visibleCount);
                    const rows = [];
                    for (let r = 0; r < visible.length; r += 2) {
                        rows.push(visible.slice(r, r + 2));
                    }

                    return rows.map((row, rowIdx) => {
                        const isEvenRow = rowIdx % 2 === 0;
                        const [left, right] = row;

                        return (
                            <React.Fragment key={rowIdx}>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                                    <div className={`${isEvenRow ? 'md:col-span-7' : 'md:col-span-5'} ${isEvenRow ? '' : 'md:mt-16'}`}>
                                        <ProductCard
                                            item={left}
                                            isLarge={isEvenRow}
                                            wishlisted={wishlistIds.includes(String(left._id || ''))}
                                            onWishlist={handleAddToWishlist}
                                            onCart={handleAddToCart}
                                            onNavigate={navigate}
                                        />
                                    </div>

                                    {right ? (
                                        <div className={`${isEvenRow ? 'md:col-span-5' : 'md:col-span-7'} ${isEvenRow ? 'md:mt-16' : ''}`}>
                                            <ProductCard
                                                item={right}
                                                isLarge={!isEvenRow}
                                                wishlisted={wishlistIds.includes(String(right._id || ''))}
                                                onWishlist={handleAddToWishlist}
                                                onCart={handleAddToCart}
                                                onNavigate={navigate}
                                            />
                                        </div>
                                    ) : (
                                        <div className={isEvenRow ? 'md:col-span-5' : 'md:col-span-7'} />
                                    )}
                                </div>

                                {/* Banner sau hàng đầu tiên */}
                                {rowIdx === 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
                                        <div className="md:col-span-1 bg-gradient-to-br from-primary/8 to-tertiary/5 border border-primary/15 p-7 rounded-3xl relative overflow-hidden group flex flex-col justify-center min-h-[180px]">
                                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                                            <span className="material-symbols-outlined text-primary text-2xl mb-3">eco</span>
                                            <h4 className="text-base font-notoSerif font-bold text-primary mb-1.5">Thời trang Bền vững</h4>
                                            <p className="text-on-surface-variant text-xs leading-relaxed italic">
                                                "9 tháng thêm vòng đời giúp giảm 20–30% khí thải carbon."
                                            </p>
                                        </div>
                                        <div className="md:col-span-1 bg-surface-container-low border border-outline-variant/20 p-7 rounded-3xl flex flex-col justify-center min-h-[180px]">
                                            <span className="material-symbols-outlined text-tertiary text-2xl mb-3">verified</span>
                                            <h4 className="text-base font-notoSerif font-bold text-on-surface mb-1.5">Kiểm định Chất lượng</h4>
                                            <p className="text-on-surface-variant text-xs leading-relaxed">
                                                Mỗi sản phẩm đều qua quy trình kiểm định nghiêm ngặt.
                                            </p>
                                        </div>
                                        <div className="md:col-span-1 bg-surface-container-low border border-outline-variant/20 p-7 rounded-3xl flex flex-col justify-center min-h-[180px]">
                                            <span className="material-symbols-outlined text-secondary text-2xl mb-3">local_shipping</span>
                                            <h4 className="text-base font-notoSerif font-bold text-on-surface mb-1.5">Giao hàng Toàn quốc</h4>
                                            <p className="text-on-surface-variant text-xs leading-relaxed">
                                                Đóng gói cẩn thận, bảo vệ từng chi tiết sản phẩm.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    });
                })()}

                {/* Load More */}
                {!loading && visibleCount < filteredProducts.length && (
                    <div className="flex justify-center pt-8 pb-4">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className="group flex items-center gap-2 px-10 py-3.5 border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 hover:shadow-md"
                        >
                            <span>Xem thêm tác phẩm</span>
                            <span className="material-symbols-outlined text-sm group-hover:translate-y-0.5 transition-transform">expand_more</span>
                        </button>
                    </div>
                )}
            </div>



            {/* Recently Viewed Section (Dynamic API Data) */}
            <AnimateWhenVisible direction="slideFromLeft" className="mt-32">
                <h2 className="text-2xl font-notoSerif font-bold mb-8">Dành cho bạn gần đây</h2>
                <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-2 px-2">
                    {recentProducts.length > 0 ? (
                        recentProducts.map((item, idx) => (
                            <div key={idx} onClick={() => navigate(`/products/${item.slug || item._id}`)} className="flex-none w-48 group cursor-pointer">
                                <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-3">
                                    <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={getMainImage(item)} />
                                </div>
                                <p className="text-xs font-bold truncate">{item.title}</p>
                                <p className="text-xs text-primary font-semibold mt-1">{formatPrice(item.price)}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 w-full text-center text-sm font-medium text-on-surface-variant flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl">
                            Chưa có dữ liệu sản phẩm tương tự.
                        </div>
                    )}
                </div>
            </AnimateWhenVisible>

            {/* Eco Impact Section */}
            <AnimateWhenVisible direction="fadeInUp">
                <section className="mt-32 p-12 bg-surface-container-low rounded-3xl flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-4xl font-notoSerif font-bold mb-6">Tác động Ý thức của bạn</h2>
                        <p className="text-on-surface-variant mb-8 leading-relaxed">
                            Bằng cách chọn các tác phẩm lưu trữ thay vì sản xuất mới, bạn đang tham gia vào sứ mệnh của Digital Atelier nhằm bảo tồn nghề thủ công đồng thời bảo vệ trái đất của chúng ta.
                        </p>
                        <div className="space-y-6">
                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Giả lập Bù đắp Carbon</label>
                            <div className="relative h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-in-out" style={{ width: (products.length > 0 ? '65%' : '0%') }}></div>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-primary">
                                <span>{products?.length || 0} Sản phẩm Tuyển chọn</span>
                                <span>{totalCO2Saved}kg CO2 đã tiết kiệm</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 aspect-square bg-surface-container-highest rounded-2xl overflow-hidden">
                        <img alt="Eco growth" className="w-full h-full object-cover mix-blend-multiply opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUfQTireXUFoCsP--FGUTaxd4DqPG8FVZsuhtZtgG1WfZ8bGfG5-E6Xerl-JkH54vvNNrGNqSxfTeJbWZqoOtMryuKRIW3n3LzUHr-21pBUMbmCqehnMAd4PLy6cc264SSnV1lHmKm0S9EYgu38kDKBhCYmGJSPChHMMYPtnKVeY9KlgrZjXWkoRSuGodk56Xk2tb5CvuFU9dsv4NpzxYKdiX5-k2hsTJ4k8mq6XGnONk_8BfMGqVtwERDRaPDDJPOLxqgvLioYw14" />
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Enhanced SEO/Archive Info Section */}
            <AnimateWhenVisible direction="fade" className="mt-32 border-t border-outline-variant/20 pt-16">
                <div className="max-w-4xl">
                    <h2 className="text-3xl font-notoSerif font-bold mb-8">Về Kho lưu trữ Atelier</h2>
                    <div className="grid md:grid-cols-2 gap-12 text-on-surface-variant leading-relaxed">
                        <div className="space-y-4">
                            <p className="text-sm">
                                Digital Atelier không chỉ là một cửa hàng; đó là một nỗ lực nhằm định nghĩa lại giá trị của thời gian trong thời trang. Kho lưu trữ của chúng tôi được xây dựng dựa trên niềm tin rằng thiết kế thực sự không bao giờ lỗi thời. Chúng tôi tìm kiếm những tạo tác từ các nhà mốt danh tiếng như Maison Margiela, Hermès, và Raf Simons, tập trung vào những kỷ nguyên đã định hình nên thẩm mỹ hiện đại.
                            </p>
                            <p className="text-sm">
                                Quy trình giám tuyển của chúng tôi bao gồm việc xác minh nguồn gốc nghiêm ngặt và đánh giá tình trạng chi tiết. Mỗi tác phẩm được gán một "Chỉ số Bền vững" dựa trên vòng đời dự kiến và tác động bù đắp so với việc sản xuất mới.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm">
                                Sự sang trọng có ý thức có nghĩa là hiểu được câu chuyện đằng sau mỗi đường may. Từ phong cách tối giản của thập niên 90 đến tinh thần nổi loạn của văn hóa Y2K, kho lưu trữ của chúng tôi mang đến cơ hội sở hữu một phần lịch sử văn hóa. Chúng tôi tự hào được thúc đẩy nền kinh tế tuần hoàn, nơi mỗi sản phẩm là một khoản đầu tư cho cả phong cách cá nhân và hành tinh.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <div className="text-center p-4 bg-surface-container-low rounded-xl flex-1">
                                    <span className="block text-2xl font-bold text-primary">100%</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Xác minh</span>
                                </div>
                                <div className="text-center p-4 bg-surface-container-low rounded-xl flex-1">
                                    <span className="block text-2xl font-bold text-primary">{products?.length > 0 ? (products.length + "+") : "10k+"}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Tác phẩm</span>
                                </div>
                                <div className="text-center p-4 bg-surface-container-low rounded-xl flex-1">
                                    <span className="block text-2xl font-bold text-primary">{uniqueCategories?.length || 0}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Danh mục</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimateWhenVisible>
        </div>
    );
};

export default Store;
