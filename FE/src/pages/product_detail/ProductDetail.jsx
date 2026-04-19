import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { getProductById } from '../../services/products';
import { addToCartApi } from '../../services/cart.service';
import { addToWishlistApi, getWishlistApi, removeFromWishlistApi } from '../../services/wishlist.service';
import { getCookie } from '../../helpers/cookie';
import AnimateWhenVisible from '../../helpers/animationScroll';
import Loading from '../../components/loading/loading';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    // Khai báo trước useEffect để tránh lỗi Temporal Dead Zone
    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        window.scrollTo(0, 0); // cuộn lên đầu khi vào trang
        const fetchProductDetail = async () => {
            try {
                const res = await getProductById(slug);
                if (res && res.data) {
                    setProduct(res.data);
                    return res.data._id;
                } else if (res && res.success) {
                    setProduct(res.data);
                    return res.data._id;
                }
                return null;
            } catch (error) {
                console.error("Fetch product detail error:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkWishlistStatus = async (productId) => {
            if (!userId) return;
            try {
                const res = await getWishlistApi(userId);
                if (res && res.data) {
                    const isFav = res.data.some(item => (item.productId?._id || item.productId) === productId);
                    setIsFavorite(isFav);
                }
            } catch (error) {
                console.error("Check wishlist error:", error);
            }
        };

        if (slug) {
            fetchProductDetail().then(prodId => {
                if (prodId) checkWishlistStatus(prodId);
            });
        }
    }, [slug, userId]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (!userId) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        try {
            const res = await addToCartApi(userId, product._id || product.slug, 1);
            if (res && res.success) {
                message.success('Đã đưa sản phẩm vào Giỏ hàng!');
            } else {
                message.warning(res.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleAddToWishlist = async () => {
        if (!product) return;
        if (!userId) {
            message.warning('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
            navigate('/login');
            return;
        }
        const productId = product._id || product.slug;

        try {
            if (isFavorite) {
                const res = await removeFromWishlistApi(userId, productId);
                if (res && res.success) {
                    setIsFavorite(false);
                    message.info('Đã xóa khỏi danh sách yêu thích.');
                }
            } else {
                const res = await addToWishlistApi(userId, productId);
                if (res && res.success) {
                    setIsFavorite(true);
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

    if (loading) return <Loading fullScreen={true} text="Đang tải sản phẩm..." />;

    if (!product) {
        return (
            <div className="pt-32 pb-32 flex flex-col items-center justify-center w-full min-h-[70vh] text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-4" data-icon="error_outline">error_outline</span>
                <p className="text-xl font-bold mb-4">Không tìm thấy tác phẩm này</p>
                <button onClick={() => navigate('/products')} className="text-primary hover:underline">Quay lại Kho lưu trữ</button>
            </div>
        );
    }

    // Helper getImage - fallback mechanism
    const getProductImg = (index) => {
        if (!product.images || product.images.length === 0) {
            return 'https://placehold.co/800x1000?text=No+Image';
        }
        if (index < product.images.length) {
            return product.images[index].imageUrl;
        }
        // Fallback to first image if index out of bounds
        return product.images[0].imageUrl;
    };

    const formatPrice = (price) => {
        if (!price) return '0';
        return price.toLocaleString();
    };

    // Calculate dynamic fake metrics
    const rrpPrice = product ? Math.round(product.price * 2.2 / 1000) * 1000 : 0;
    const savePercent = product ? Math.round(((rrpPrice - product.price) / rrpPrice) * 100) : 0;
    const co2Saved = product ? (product.price / 100000).toFixed(1) : 0;
    const waterSaved = product ? Math.round(product.price / 500) : 0;
    const pastPrice1 = product ? Math.round(product.price * 0.75) : 0;
    const pastPrice2 = product ? Math.round(product.price * 0.88) : 0;

    const marketData = product ? [
        { month: 'T10', price: Math.round(product.price * 0.92) },
        { month: 'T11', price: Math.round(product.price * 0.95) },
        { month: 'T12', price: Math.round(product.price * 0.98) },
        { month: 'T1', price: product.price },
    ] : [];

    return (
        <main className="pt-10 pb-32 max-w-7xl mx-auto px-6">

            {/* Action Bar (Back) */}
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-lg" data-icon="arrow_back">arrow_back</span>
                    Trở về
                </button>
            </div>

            {/* Hero Section: Immersive PDP Layout */}
            <AnimateWhenVisible direction="fadeInDown" className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">

                {/* Gallery Grid (Asymmetrical Editorial Style) */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div className="col-span-2 aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-low group relative">
                        <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={product.title}
                            src={getProductImg(0)}
                        />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <span className="bg-tertiary-container/90 backdrop-blur text-on-tertiary-container px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                Xác minh 100%
                            </span>
                            {product.status === 'sold' && (
                                <span className="bg-red-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-red-500/20">
                                    Đã bán
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="detail 2" src={getProductImg(1)} />
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="detail 3" src={getProductImg(2)} />
                    </div>
                </div>

                {/* Product Info (Sticky) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-primary font-manrope text-[11px] uppercase tracking-[0.2em] font-bold">
                                {product.brandId?.name || 'Archive Collection'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                            <span className="text-on-surface-variant font-manrope text-[11px] uppercase tracking-[0.2em]">
                                Tình trạng: {product.condition}
                            </span>
                        </div>

                        <h1 className="font-notoSerif text-4xl md:text-5xl text-on-background leading-tight mb-6 tracking-tighter italic">
                            {product.title}
                        </h1>

                        <div className="flex flex-wrap items-baseline gap-4 mb-8">
                            <p className="text-3xl font-manrope font-light text-on-background">${formatPrice(product.price)}</p>
                            <p className="text-on-surface-variant line-through font-manrope text-sm">Gốc ${formatPrice(rrpPrice)}</p>
                            <span className="text-primary text-xs font-bold bg-primary-fixed px-2 py-0.5 rounded">RẺ HƠN {savePercent}%</span>
                        </div>

                        <div className="space-y-8 mb-12">
                            {/* Condition Report */}
                            <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm">
                                <h3 className="font-manrope text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Báo cáo tình trạng</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Hạng {product.condition === 'like_new' ? 'A+' : product.condition === 'good' ? 'A' : 'B'} ({product.condition})</span>
                                    <span className="text-xs text-primary font-bold">{product.condition === 'like_new' ? '9.5' : product.condition === 'good' ? '8.0' : '7.0'}/10</span>
                                </div>
                                <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: product.condition === 'like_new' ? '95%' : product.condition === 'good' ? '80%' : '70%' }}></div>
                                </div>
                                <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">
                                    {product.description || 'Sản phẩm đã qua quá trình kiểm định của hệ thống. Độ bền cấu trúc hoàn hảo. Đã được giặt hấp sinh thái cao cấp.'}
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-on-surface-variant border-t border-outline-variant/10 pt-4">
                                    <div className="flex justify-between pr-4 border-r border-outline-variant/10">
                                        <span className="font-bold">Size:</span> <span>{product.size || 'Freesize'}</span>
                                    </div>
                                    <div className="flex justify-between pl-4">
                                        <span className="font-bold">Màu sắc:</span> <span>{product.color || 'Đang cập nhật'}</span>
                                    </div>
                                    <div className="flex justify-between pr-4 border-r border-outline-variant/10">
                                        <span className="font-bold">Chất liệu:</span> <span>{product.material || 'Hỗn hợp'}</span>
                                    </div>
                                    <div className="flex justify-between pl-4">
                                        <span className="font-bold">Giới tính:</span> <span>{product.gender || 'Unisex'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.status === 'sold'}
                                    className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${
                                        product.status === 'sold'
                                        ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed shadow-none'
                                        : 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20'
                                    }`}
                                >
                                    {product.status === 'sold' ? 'Sản phẩm đã hết hàng' : 'Đưa vào Bộ sưu tập'}
                                </button>
                                <button
                                    onClick={handleAddToWishlist}
                                    className={`px-5 border border-outline-variant rounded-xl flex items-center justify-center transition-colors ${isFavorite ? 'bg-primary text-white border-primary' : 'hover:bg-surface-container-low text-primary'}`}
                                    title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                </button>
                            </div>

                            {product.status === 'sold' && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                                    <span className="material-symbols-outlined shrink-0">info</span>
                                    <p className="text-xs font-medium">Sản phẩm này đã được một khách hàng khác sở hữu. Bạn có thể thêm vào danh sách yêu thích để nhận thông báo nếu sản phẩm tương tự xuất hiện!</p>
                                </div>
                            )}
                        </div>

                        {/* Transparency Details */}
                        <div className="grid grid-cols-2 gap-6 border-t border-outline-variant/10 pt-8">
                            <div className="flex flex-col gap-2">
                                <span className="material-symbols-outlined text-primary text-xl" data-icon="eco">eco</span>
                                <h4 className="text-[11px] font-bold uppercase tracking-widest">CO2 Đã tránh</h4>
                                <p className="text-sm font-light">{co2Saved}kg CO2 tiết kiệm</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="material-symbols-outlined text-primary text-xl" data-icon="verified_user">verified_user</span>
                                <h4 className="text-[11px] font-bold uppercase tracking-widest">Xác thực</h4>
                                <p className="text-sm font-light">Kiểm định nội bộ 12 bước</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimateWhenVisible>

            {/* Section: Wear & Tear Detailed Analysis */}
            <AnimateWhenVisible direction="fadeInUp" className="mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                        <h2 className="font-notoSerif text-3xl mb-4 italic">Hồ sơ Hao mòn</h2>
                        <p className="text-on-surface-variant font-light leading-relaxed">
                            Chúng tôi luôn tin vào sự minh bạch tuyệt đối. Mỗi tác phẩm cổ điển đều mang một câu chuyện. Dưới đây chúng tôi ghi lại các điểm mài mòn chuẩn xác nhất, giúp bạn thêm yêu hành trình của thiết kế.
                        </p>
                    </div>
                    <div className="flex gap-2 whitespace-nowrap overflow-x-auto hide-scrollbar pb-2">
                        <span className="px-4 py-2 bg-surface-container-low rounded-full text-[10px] uppercase font-bold tracking-widest">Nếp gấp</span>
                        <span className="px-4 py-2 bg-surface-container-low rounded-full text-[10px] uppercase font-bold tracking-widest">Đường may</span>
                        <span className="px-4 py-2 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-widest">Nguyên vẹn</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Wear Point 1 */}
                    <div className="group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-high mb-4">
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 0" src={getProductImg(1)} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2">01. Bề mặt vải</h4>
                        <p className="text-sm text-on-surface-variant font-light">Những gờ nối và kết cấu sợi còn rất liền lạc. Rất ít dấu hiệu bị xù lông.</p>
                    </div>
                    {/* Wear Point 2 */}
                    <div className="group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-high mb-4">
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 1" src={getProductImg(2)} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2">02. Lớp lót</h4>
                        <p className="text-sm text-on-surface-variant font-light">Phần lớp vật liệu bên trong được giữ gìn nguyên vẹn, không có hiện tượng cộm hoặc đổi màu do mồ hôi.</p>
                    </div>
                    {/* Wear Point 3 */}
                    <div className="group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-high mb-4">
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 2" src={getProductImg(0)} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2">03. Cấu trúc tổng thể</h4>
                        <p className="text-sm text-on-surface-variant font-light">Form dáng cứng cáp nguyên lý. Chưa từng có dấu tích can thiệp bằng bàn ủi nhiệt độ sai quy chuẩn.</p>
                    </div>
                </div>
            </AnimateWhenVisible>

            {/* Section: Resale Value & Price History (Dynamic Data Binding) */}
            <AnimateWhenVisible direction="slideFromLeft">
                <section className="bg-surface-container-low rounded-[2rem] p-8 md:p-16 mb-24 flex flex-col lg:flex-row gap-16 overflow-hidden">
                    <div className="lg:w-1/3">
                        <h2 className="font-notoSerif text-3xl mb-6 italic">Động học Thị trường</h2>
                        <p className="text-on-surface-variant text-sm font-light leading-relaxed mb-8">
                            Các thiết kế thời trang xa xỉ thường giữ hoặc tăng giá trị theo thời gian. Biểu đồ lịch sử giá ước tính giúp bạn nhìn nhận tác phẩm này như một khoản đầu tư thanh khoản cao.
                        </p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-outline-variant/20 pb-2">
                                <span className="text-xs font-bold uppercase tracking-widest">Khả năng thu hồi vốn</span>
                                <span className="text-primary font-bold">78%</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-outline-variant/20 pb-2">
                                <span className="text-xs font-bold uppercase tracking-widest">Biến động giá trị</span>
                                <span className="text-primary flex items-center gap-1 font-bold">
                                    <span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
                                    +4.2% / Năm
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Price Chart Dynamic Generation */}
                    <div className="lg:w-2/3 h-64 md:h-80 flex items-end gap-2 md:gap-4 px-4 border-l border-b border-outline-variant/20 relative">
                        {/* Vertical lines */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-5">
                            <div className="border-r border-on-surface h-full"></div>
                            <div className="border-r border-on-surface h-full"></div>
                            <div className="border-r border-on-surface h-full"></div>
                            <div className="border-r border-on-surface h-full"></div>
                        </div>

                        <div className="flex-1 bg-primary/20 rounded-t-lg h-[40%] relative group">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">${formatPrice(pastPrice1)}</div>
                            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-tighter text-on-surface-variant">2021</div>
                        </div>
                        <div className="flex-1 bg-primary/30 rounded-t-lg h-[55%] relative group">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">${formatPrice(pastPrice2)}</div>
                            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-tighter text-on-surface-variant">2022</div>
                        </div>
                        <div className="flex-1 bg-primary/50 rounded-t-lg h-[70%] relative group">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">${formatPrice(product.price - 15)}</div>
                            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-tighter text-on-surface-variant">2023</div>
                        </div>
                        <div className="flex-1 bg-primary rounded-t-lg h-[85%] relative group ring-4 ring-primary/10">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded z-10">${formatPrice(product.price)}</div>
                            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-tighter font-bold text-primary">Hiện nay</div>
                        </div>
                        <div className="flex-1 bg-surface-container-high border-t border-dashed border-primary-container h-[90%] relative group">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Ước tính ${formatPrice(product.price + 50)}</div>
                            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-tighter text-on-surface-variant italic">2026</div>
                        </div>
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Eco Impact Slider Component */}
            <AnimateWhenVisible direction="fade" className="mb-24 max-w-2xl mx-auto text-center px-6">
                <h3 className="font-notoSerif text-2xl mb-8 italic">Tác động Ý thức của bạn</h3>
                <div className="relative py-12 px-8 bg-surface-container-lowest rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Dòng nước cứu nguy</p>
                            <p className="text-2xl font-manrope font-light text-primary">{waterSaved.toLocaleString()} Lít</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Khí thải Cải thiện</p>
                            <p className="text-2xl font-manrope font-light text-primary">{co2Saved} KG</p>
                        </div>
                    </div>

                    {/* Range Slider View */}
                    <div className="relative h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
                        <div className="absolute top-0 left-0 h-full w-[65%] bg-primary"></div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-light">
                        Bằng việc chọn secondhand cho thiết kế này, bạn đã chặn đứng chi phí môi trường bắt buộc bị tiêu hao nếu sản xuất một cái mới.
                    </p>
                </div>
            </AnimateWhenVisible>
        </main>
    );
};

export default ProductDetail;
