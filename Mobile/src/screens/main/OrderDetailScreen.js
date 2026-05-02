import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrderByIdApi } from '../../services/client/order.service';

const OrderDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const orderId = route.params?.id;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/100x100/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchOrderDetails = async () => {
        if (!orderId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await getOrderByIdApi(orderId);
            if (res && res.success) {
                setOrder(res.order);
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'pending_payment': return 'Chờ thanh toán';
            case 'paid': return 'Đã thanh toán';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đang giao';
            case 'delivered': return 'Đã giao';
            case 'cancelled': return 'Đã hủy';
            case 'returned': return 'Hoàn trả';
            default: return status || 'Đang xử lý';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8A65" />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
                <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} buttonColor="#4A5D4E">Quay lại</Button>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Top Header */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
                <View>
                    <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                    <Text style={styles.headerSubtitle}>Mã đơn: #{order._id?.slice(-6).toUpperCase()}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Order Summary Status */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionLabel}>TRẠNG THÁI ĐƠN HÀNG</Text>
                    <View style={styles.statusContent}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{translateStatus(order.status)}</Text>
                        </View>
                        <Text style={styles.orderDate}>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                </View>

                {/* Shipping Details */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>THÔNG TIN GIAO HÀNG</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.customerName}>{order.buyerName || 'Người nhận'}</Text>
                        <Text style={styles.customerPhone}>{order.buyerPhone || 'Chưa cung cấp SĐT'}</Text>
                        <Text style={styles.customerAddress}>{order.shippingAddress || 'Chưa có địa chỉ'}</Text>
                    </View>
                </View>

                {/* Items details */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionLabel}>SẢN PHẨM</Text>
                    {order.items?.map((item, idx) => {
                        const product = item.productId;
                        if (!product) return null;
                        const mainImage = product.image || product.images?.[0]?.imageUrl;

                        return (
                            <View key={idx} style={styles.itemRow}>
                                <Image source={{ uri: getImageUrl(mainImage) }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
                                    <Text style={styles.itemQty}>Số lượng: x{item.quantity}</Text>
                                    <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Total Invoice Details */}
                <View style={styles.totalSection}>
                    <Text style={styles.sectionLabel}>THANH TOÁN</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Phương thức thanh toán</Text>
                        <Text style={styles.totalValue}>{order.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Thanh toán trực tuyến'}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.finalTotalRow]}>
                        <Text style={styles.finalTotalLabel}>Tổng số tiền</Text>
                        <Text style={styles.finalTotalValue}>{formatPrice(order.totalAmount)}</Text>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    statusSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statusContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#d97706',
        textTransform: 'uppercase',
    },
    orderDate: {
        fontSize: 12,
        color: '#64748b',
    },
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    infoContent: {},
    customerName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    customerAddress: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    itemsSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 16,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    itemQty: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    totalSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    totalValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    finalTotalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        marginTop: 4,
    },
    finalTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    finalTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
    },
});

export default OrderDetailScreen;
