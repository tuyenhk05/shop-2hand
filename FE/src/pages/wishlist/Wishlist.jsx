import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import AnimateWhenVisible from '../../helpers/animationScroll';
import WishlistItem from './WishlistItem';
import { getWishlistApi, removeFromWishlistApi } from '../../services/client/wishlist.service';
import { addToCartApi } from '../../services/client/cart.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';
import Loading from '../../components/loading/loading';
import ProductCard from '../../components/ProductCard';
import { getRecommendationsApi } from '../../services/client/products';
import { addToWishlistApi } from '../../services/client/wishlist.service';

const Wishlist = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecLoading, setIsRecLoading] = useState(true);
    
    // Giả sử UserID được lưu ở cookie `userId` hoặc lấy từ token
    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            setIsRecLoading(false);
            return;
        }
        fetchWishlists();
        fetchRecommendations();
    }, [userId]);

    const fetchRecommendations = async () => {
        try {
            setIsRecLoading(true);
            const res = await getRecommendationsApi();
            if (res && res.success) {
                setRecommendations(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải gợi ý", error);
        } finally {
            setIsRecLoading(false);
        }
    };

    const fetchWishlists = async () => {
        try {
            setIsLoading(true);
            const response = await getWishlistApi(userId);
            if (response && response.data) {
                setWishlistItems(response.data);
            } else if (response && response.success) {
                setWishlistItems(response.wishlists || response.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            const res = await removeFromWishlistApi(userId, productId);
            if (res && res.success) {
                setWishlistItems(prev => prev.filter(item => {
                    const pid = item.productId?._id || item.productId;
                    return String(pid) !== String(productId);
                }));
                message.info('Đã xóa khỏi danh sách yêu thích.');
            }
        } catch (error) {
            console.error("Lỗi xóa wishlist", error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const res = await addToCartApi(userId, productId, 1);
            if (res && res.success) {
                message.success('Đã thêm vào giỏ hàng!');
            } else {
                message.warning(res.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi thêm vào giỏ hàng', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleToggleWishlist = async (e, productId) => {
        if (e) e.stopPropagation();
        
        const isCurrentlyFavorite = wishlistItems.some(item => {
             const pid = item.productId?._id || item.productId;
             return String(pid) === String(productId);
        }) || recommendations.some(p => String(p._id) === String(productId) && p.isFavorite);

        try {
            if (isCurrentlyFavorite) {
                await handleRemove(productId);
            } else {
                const res = await addToWishlistApi(userId, productId);
                if (res && res.success) {
                    message.success('Đã thêm vào danh sách yêu thích!');
                    fetchWishlists(); // Refresh to update states
                }
            }
        } catch (error) {
            console.error("Lỗi thao tác wishlist", error);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return price.toLocaleString('vi-VN') + '₫';
    }

    return (
        <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 font-manrope">
            <AnimateWhenVisible direction="fade" className="mb-16">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4 font-notoSerif">Sản phẩm đã thích</h1>
                <p className="text-on-surface-variant max-w-xl">
                    Bộ sưu tập cá nhân của bạn về những món đồ thủ công và lưu trữ bền vững. Nơi thời trang gặp gỡ ý thức.
                </p>
            </AnimateWhenVisible>

            {isLoading ? (
                <Loading fullScreen={false} text="Đang tải danh sách yêu thích..." />
            ) : wishlistItems.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-6xl text-outline mb-4">favorite_border</span>
                    <h3 className="font-notoSerif text-xl font-bold mb-2">Danh sách trống</h3>
                    <p className="text-on-surface-variant mb-6">Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
                    <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90">Khám phá cửa hàng</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistItems.map((item, index) => (
                        <AnimateWhenVisible key={item._id || index} direction="fadeInUp" transition={{ delay: index * 0.08 }}>
                            <WishlistItem
                                item={item}
                                formatPrice={formatPrice}
                                onRemove={handleRemove}
                                onAddToCart={handleAddToCart}
                            />
                        </AnimateWhenVisible>
                    ))}
                </div>
            )}

            {/* AI Recommendations Section */}
            <AnimateWhenVisible direction="fade" className="mt-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4 border border-primary/20">
                            <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Gợi ý từ Trợ lý AI</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-on-background leading-tight font-notoSerif">Có thể bạn sẽ thích</h2>
                        <p className="text-on-surface-variant mt-4">Dựa trên phong cách và các sản phẩm bạn đã quan tâm tại Atelier.</p>
                    </div>
                </div>

                {isRecLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[1, 2, 4].map(i => (
                             <div key={i} className="aspect-[3/4] bg-surface-container rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {recommendations.map((product, index) => (
                            <ProductCard
                                key={product._id}
                                item={product}
                                isLarge={false}
                                wishlisted={wishlistItems.some(item => {
                                    const pid = item.productId?._id || item.productId;
                                    return String(pid) === String(product._id);
                                })}
                                onWishlist={(e) => handleToggleWishlist(e, product._id)}
                                onCart={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-on-surface-variant italic">Đang cập nhật thêm gợi ý mới cho bạn...</p>
                )}
            </AnimateWhenVisible>

        </main>
    );
};

export default Wishlist;
