import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { getProductById } from '../../services/client/products';
import { addToCartApi } from '../../services/client/cart.service';
import { addToWishlistApi, getWishlistApi, removeFromWishlistApi } from '../../services/client/wishlist.service';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params || {};

    const [product, setProduct] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

    const showCustomAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await getProductById(id);
                if (res?.data || res?.success) {
                    const prod = res.data || res;
                    setProduct(prod);
                    return prod._id;
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
                if (res?.data) {
                    const isFav = res.data.some(item => (item.productId?._id || item.productId) === productId);
                    setIsFavorite(isFav);
                }
            } catch (error) {
                console.error("Check wishlist error:", error);
            }
        };

        if (id) {
            fetchProductDetail().then(prodId => {
                if (prodId) checkWishlistStatus(prodId);
            });
        } else {
            setLoading(false);
        }
    }, [id, userId]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (!userId) {
            showCustomAlert('error', 'Vui lòng đăng nhập để thêm vào giỏ hàng!');
            setTimeout(() => navigation.navigate('Login'), 1500);
            return;
        }
        try {
            const res = await addToCartApi(userId, product._id || product.slug, 1);
            if (res?.success) {
                showCustomAlert('success', 'Đã thêm vào giỏ hàng thành công!');
            } else {
                showCustomAlert('error', res?.message || 'Không thể thêm vào giỏ hàng.');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            showCustomAlert('error', 'Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleAddToWishlist = async () => {
        if (!product) return;
        if (!userId) {
            showCustomAlert('error', 'Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
            setTimeout(() => navigation.navigate('Login'), 1500);
            return;
        }
        const productId = product._id || product.slug;

        try {
            if (isFavorite) {
                const res = await removeFromWishlistApi(userId, productId);
                if (res?.success) {
                    setIsFavorite(false);
                    showCustomAlert('success', 'Đã xóa khỏi danh sách yêu thích!');
                }
            } else {
                const res = await addToWishlistApi(userId, productId);
                if (res?.success) {
                    setIsFavorite(true);
                    showCustomAlert('success', 'Đã thêm vào danh sách yêu thích!');
                }
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            showCustomAlert('error', 'Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF8A65" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Sản phẩm này không còn nữa</Text>
                <Button mode="text" onPress={() => navigation.goBack()}>Quay lại</Button>
            </View>
        );
    }

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const rrpPrice = Math.round(product.price * 2.2 / 1000) * 1000;
    const savePercent = Math.round(((rrpPrice - product.price) / rrpPrice) * 100);

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    onPress={() => navigation.goBack()} 
                />
                <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                <IconButton 
                    icon={isFavorite ? "cards-heart" : "heart-outline"} 
                    iconColor={isFavorite ? "#4c6545" : "#333"}
                    size={24} 
                    onPress={handleAddToWishlist} 
                />
            </SafeAreaView>

            {alert && (
                <View style={[styles.alertBox, alert.type === 'success' ? styles.alertSuccess : styles.alertError]}>
                    <IconButton 
                        icon={alert.type === 'success' ? 'check-circle' : 'alert-circle'} 
                        iconColor={alert.type === 'success' ? '#1b4332' : '#7f1d1d'} 
                        size={20}
                        style={styles.alertIcon} 
                    />
                    <Text style={[styles.alertText, alert.type === 'success' ? styles.alertTextSuccess : styles.alertTextError]}>
                        {alert.message}
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                        {product.images && product.images.length > 0 ? (
                            product.images.map((img, idx) => (
                                <Image 
                                    key={idx} 
                                    source={{ uri: img.imageUrl }} 
                                    style={styles.galleryImage} 
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <Image 
                                source={{ uri: 'https://placehold.co/800x1000?text=No+Image' }} 
                                style={styles.galleryImage} 
                            />
                        )}
                    </ScrollView>
                    
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>Xác minh 100%</Text>
                    </View>
                    {product.status === 'sold' && (
                        <View style={[styles.badgeContainer, styles.soldBadgeContainer]}>
                            <Text style={[styles.badgeText, styles.soldBadgeText]}>ĐÃ BÁN</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.brandConditionRow}>
                        <Text style={styles.brandText}>{product.brandId?.name || 'Archive Collection'}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.conditionText}>Tình trạng: {product.condition}</Text>
                    </View>

                    <Text style={styles.title}>{product.title}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formatPrice(product.price)}</Text>
                        <Text style={styles.originalPrice}>Gốc {formatPrice(rrpPrice)}</Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveBadgeText}>RẺ HƠN {savePercent}%</Text>
                        </View>
                    </View>

                    {/* Condition Report */}
                    <View style={styles.reportContainer}>
                        <Text style={styles.reportTitle}>Báo cáo tình trạng</Text>
                        <View style={styles.reportRow}>
                            <Text style={styles.reportLabel}>Hạng {product.condition === 'like_new' ? 'A+' : product.condition === 'good' ? 'A' : 'B'}</Text>
                            <Text style={styles.reportScore}>{product.condition === 'like_new' ? '9.5' : product.condition === 'good' ? '8.0' : '7.0'}/10</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: product.condition === 'like_new' ? '95%' : product.condition === 'good' ? '80%' : '70%' }]} />
                        </View>

                        <Text style={styles.descText}>{product.description || 'Sản phẩm đã qua quá trình kiểm định của hệ thống.'}</Text>

                        <View style={styles.attributesGrid}>
                            <View style={styles.attributeItem}>
                                <Text style={styles.attributeLabel}>Size:</Text>
                                <Text style={styles.attributeValue}>{product.size || 'Freesize'}</Text>
                            </View>
                            <View style={styles.attributeItem}>
                                <Text style={styles.attributeLabel}>Màu sắc:</Text>
                                <Text style={styles.attributeValue}>{product.color || 'Đang cập nhật'}</Text>
                            </View>
                            <View style={styles.attributeItem}>
                                <Text style={styles.attributeLabel}>Chất liệu:</Text>
                                <Text style={styles.attributeValue}>{product.material || 'Hỗn hợp'}</Text>
                            </View>
                            <View style={styles.attributeItem}>
                                <Text style={styles.attributeLabel}>Giới tính:</Text>
                                <Text style={styles.attributeValue}>{product.gender || 'Unisex'}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Environmental Impact Section */}
                    <View style={styles.ecoContainer}>
                        <View style={styles.ecoHeaderRow}>
                            <Text style={styles.ecoTitle}>Tác động môi trường</Text>
                        </View>
                        <View style={styles.ecoStatsRow}>
                            <View style={styles.ecoStatItem}>
                                <Text style={styles.ecoStatValue}>-12.5kg</Text>
                                <Text style={styles.ecoStatLabel}>Khí CO2 tiết kiệm</Text>
                            </View>
                            <View style={styles.ecoStatItem}>
                                <Text style={styles.ecoStatValue}>8.400L</Text>
                                <Text style={styles.ecoStatLabel}>Nước sạch bảo tồn</Text>
                            </View>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '75%', backgroundColor: '#4c6545' }]} />
                        </View>
                        <Text style={styles.ecoDescText}>Bạn đang cứu sống 2 cây xanh bằng việc chọn sản phẩm này.</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
                {product.status === 'sold' ? (
                    <View style={styles.soldNotice}>
                        <Text style={styles.soldNoticeText}>Sản phẩm này đã hết hàng.</Text>
                    </View>
                ) : (
                    <Button 
                        mode="contained" 
                        onPress={handleAddToCart}
                        style={styles.addToCartButton}
                        labelStyle={styles.addToCartLabel}
                        buttonColor="#4c6545"
                    >
                        ĐƯA VÀO GIỎ HÀNG
                    </Button>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef9f7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    galleryContainer: {
        height: width * 1.25,
        width: width,
        position: 'relative',
        backgroundColor: '#f5f5f5',
    },
    galleryImage: {
        width: width,
        height: width * 1.25,
    },
    badgeContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 1,
    },
    soldBadgeContainer: {
        top: 48,
        backgroundColor: '#ef4444',
    },
    soldBadgeText: {
        color: '#fff',
    },
    infoContainer: {
        padding: 24,
    },
    brandConditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    brandText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF8A65',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        marginHorizontal: 8,
    },
    conditionText: {
        fontSize: 12,
        color: '#666',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        lineHeight: 36,
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 14,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
        marginRight: 12,
    },
    saveBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    saveBadgeText: {
        color: '#d97706',
        fontSize: 10,
        fontWeight: 'bold',
    },
    reportContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    reportTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    reportRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reportLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reportScore: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF8A65',
    },
    descText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 16,
    },
    attributesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 16,
    },
    attributeItem: {
        width: '50%',
        flexDirection: 'row',
        marginBottom: 8,
    },
    attributeLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        width: 60,
    },
    attributeValue: {
        fontSize: 12,
        color: '#333',
    },
    bottomBar: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addToCartButton: {
        paddingVertical: 6,
        borderRadius: 12,
    },
    addToCartLabel: {
        fontWeight: 'bold',
        letterSpacing: 1,
        fontSize: 14,
    },
    soldNotice: {
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    soldNoticeText: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    ecoContainer: {
        marginTop: 20,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    ecoHeaderRow: {
        marginBottom: 8,
    },
    ecoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4c6545',
        letterSpacing: 1,
    },
    ecoStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    ecoStatItem: {
        flex: 1,
    },
    ecoStatValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    ecoStatLabel: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '600',
    },
    ecoDescText: {
        fontSize: 12,
        color: '#475569',
        fontStyle: 'italic',
        marginTop: 6,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    alertSuccess: {
        backgroundColor: '#d1fae5',
        borderColor: '#a7f3d0',
    },
    alertError: {
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
    },
    alertIcon: {
        margin: 0,
        padding: 0,
    },
    alertText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        marginLeft: 4,
    },
    alertTextSuccess: {
        color: '#065f46',
    },
    alertTextError: {
        color: '#991b1b',
    },
});

export default ProductDetailScreen;
