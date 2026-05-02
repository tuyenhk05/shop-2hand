import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWishlistApi, removeFromWishlistApi } from '../../services/client/wishlist.service';
import { addToCartApi } from '../../services/client/cart.service';

const { width } = Dimensions.get('window');

const WishlistScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const userId = useSelector((state) => state.auth.userId);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

    const showCustomAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/400x500/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchWishlists = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const response = await getWishlistApi(userId);
            if (response && response.data) {
                setWishlistItems(response.data || []);
            } else if (response && response.success) {
                setWishlistItems(response.wishlists || response.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchWishlists();
        }
    }, [userId, isFocused]);

    const handleRemove = async (productId) => {
        try {
            const res = await removeFromWishlistApi(userId, productId);
            if (res && res.success) {
                setWishlistItems(prev => prev.filter(item => {
                    const pid = item.productId?._id || item.productId;
                    return String(pid) !== String(productId);
                }));
                showCustomAlert('success', 'Đã xóa khỏi danh sách yêu thích.');
            }
        } catch (error) {
            console.error("Lỗi xóa wishlist", error);
            showCustomAlert('error', 'Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const res = await addToCartApi(userId, productId, 1);
            if (res && res.success) {
                showCustomAlert('success', 'Đã thêm vào giỏ hàng thành công!');
            } else {
                showCustomAlert('error', res.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi thêm vào giỏ hàng', error);
            showCustomAlert('error', 'Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    if (!userId) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem danh sách yêu thích</Text>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }} buttonColor="#4A5D4E">
                    Đăng nhập
                </Button>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8A65" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="arrow-left" size={24} iconColor="#1e293b" style={{ margin: 0 }} />
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sản phẩm đã thích</Text>
                <Text style={styles.headerSubtitle}>Lưu trữ phong cách bền vững cho bạn.</Text>
            </View>

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

            {wishlistItems.length === 0 ? (
                <View style={styles.emptyBox}>
                    <IconButton icon="heart-outline" size={48} iconColor="#64748b" />
                    <Text style={styles.emptyText}>Danh sách của bạn đang trống.</Text>
                    <Button mode="contained" onPress={() => navigation.navigate('StoreTab')} style={{ marginTop: 16 }} buttonColor="#4A5D4E">
                        Khám phá ngay
                    </Button>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {wishlistItems.map((item, idx) => {
                        const product = item.productId;
                        if (!product) return null;
                        const mainImage = product.images?.[0]?.imageUrl || product.images?.find(img => img.isPrimary)?.imageUrl || product.image;

                        return (
                            <TouchableOpacity 
                                key={item._id || idx}
                                style={styles.itemCard}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('ProductDetail', { id: product.slug || product._id })}
                            >
                                <Image source={{ uri: getImageUrl(mainImage) }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
                                        <IconButton icon="close" size={20} iconColor="#94a3b8" onPress={() => handleRemove(product._id || product.slug)} style={styles.removeBtn} />
                                    </View>
                                    <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
                                    <View style={styles.cardActions}>
                                        <Button mode="outlined" onPress={() => handleAddToCart(product._id || product.slug)} style={styles.cartBtn} textColor="#4A5D4E" borderColor="#4A5D4E">
                                            THÊM VÀO GIỎ
                                        </Button>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef9f7',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fef9f7',
        padding: 24,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 12,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    itemImage: {
        width: 100,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    removeBtn: {
        margin: 0,
        padding: 0,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8A65',
        marginVertical: 6,
    },
    cardActions: {
        flexDirection: 'row',
    },
    cartBtn: {
        flex: 1,
        borderRadius: 8,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 16,
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

export default WishlistScreen;
