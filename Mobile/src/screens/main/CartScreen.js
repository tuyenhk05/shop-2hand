import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { getCartApi, removeFromCartApi } from '../../services/client/cart.service';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '../../context/ToastContext';

const CartScreen = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItemIds, setSelectedItemIds] = useState([]);

    const userId = useSelector((state) => state.auth.userId);

    const fetchCart = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await getCartApi(userId);
            if (response?.success) {
                const items = response.cart || [];
                setCartItems(items);
                // Initially select all items
                const validIds = items.map(item => String(item.productId?._id || item.productId || ''));
                setSelectedItemIds(validIds);
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [userId])
    );

    const handleRemove = async (productId) => {
        const pid = String(productId);
        try {
            const res = await removeFromCartApi(userId, pid);
            if (res?.success) {
                setCartItems(prev => prev.filter(item => {
                    const itemPid = String(item.productId?._id || item.productId || '');
                    return itemPid !== pid;
                }));
            } else {
                showToast('Không thể xóa. Vui lòng thử lại!', 'error');
            }
        } catch (error) {
            console.error('Remove cart item error:', error);
            showToast('Đã xảy ra lỗi. Vui lòng thử lại!', 'error');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cartItems.map(item => String(item.productId?._id || item.productId || '')));
        }
    };

    const toggleSelectItem = (productId) => {
        const pid = String(productId);
        if (selectedItemIds.includes(pid)) {
            setSelectedItemIds(prev => prev.filter(id => id !== pid));
        } else {
            setSelectedItemIds(prev => [...prev, pid]);
        }
    };

    const selectedItems = cartItems.filter(item => {
        const pid = String(item.productId?._id || item.productId || '');
        return selectedItemIds.includes(pid);
    });

    const subtotal = selectedItems.reduce((acc, item) => {
        const product = item.productId || item;
        return acc + (product.price || 0) * (item.quantity || 1);
    }, 0);
    const shippingFee = subtotal > 0 ? 30000 : 0;
    const total = subtotal > 0 ? subtotal + shippingFee : 0;

    const renderItem = ({ item }) => {
        const product = item.productId || item;
        const pid = String(product._id || product.slug);
        const isSelected = selectedItemIds.includes(pid);
        const mainImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || 'https://placehold.co/150x200?text=No+Image';

        return (
            <View style={styles.cartItem}>
                <IconButton 
                    icon={isSelected ? "checkbox-marked" : "checkbox-blank-outline"} 
                    size={22} 
                    iconColor={isSelected ? "#4c6545" : "#64748b"} 
                    style={styles.checkboxButton}
                    onPress={() => toggleSelectItem(pid)}
                />
                <Image source={{ uri: mainImage }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemBrand}>{product.brandId?.name || 'Archive'}</Text>
                    <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.itemCondition}>Tình trạng: {product.condition}</Text>
                </View>
                <IconButton 
                    icon="close" 
                    size={20} 
                    iconColor="#94a3b8" 
                    style={styles.removeButton}
                    onPress={() => handleRemove(product._id || product.slug)}
                />
            </View>
        );
    };

    if (!userId) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem giỏ hàng</Text>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>Đăng nhập</Button>
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
                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    iconColor="#1e293b" 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                />
                <Text style={styles.headerTitle}>Giỏ hàng</Text>
                <View style={{ width: 48 }} /> 
            </View>

            {cartItems.length > 0 && (
                <View style={styles.selectAllRow}>
                    <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                        <IconButton 
                            icon={isAllSelected ? "checkbox-marked" : "checkbox-blank-outline"} 
                            size={22} 
                            iconColor={isAllSelected ? "#4c6545" : "#64748b"} 
                            style={styles.selectAllCheckbox}
                        />
                        <Text style={styles.selectAllText}>Chọn tất cả ({cartItems.length} sản phẩm)</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            <FlatList
                data={cartItems}
                keyExtractor={(item, index) => item.productId?._id || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
                        <Button 
                            mode="outlined" 
                            onPress={() => navigation.navigate('StoreTab')} 
                            style={{ marginTop: 16 }}
                            textColor="#4c6545"
                        >
                            Khám phá cửa hàng
                        </Button>
                    </View>
                )}
            />

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính</Text>
                        <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                        <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={() => {
                            if (selectedItems.length === 0) {
                                showToast('Vui lòng chọn ít nhất một sản phẩm để thanh toán.', 'info');
                                return;
                            }
                            navigation.navigate('Checkout', { items: selectedItems });
                        }} 
                        style={styles.checkoutButton}
                        labelStyle={styles.checkoutButtonText}
                        buttonColor="#4c6545"
                    >
                        TIẾN HÀNH THANH TOÁN
                    </Button>
                </View>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    backButton: {
        margin: 0,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
    },
    selectAllRow: {
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllCheckbox: {
        margin: 0,
        marginRight: 4,
    },
    selectAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        position: 'relative',
    },
    checkboxButton: {
        margin: 0,
        marginRight: 8,
    },
    itemImage: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    itemBrand: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FF8A65',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemCondition: {
        fontSize: 12,
        color: '#64748b',
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    checkoutButton: {
        marginTop: 24,
        paddingVertical: 8,
        borderRadius: 12,
    },
    checkoutButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default CartScreen;
