import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrdersApi } from '../../services/client/order.service';

const OrderHistoryScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const userId = useSelector((state) => state.auth.userId);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending_payment', 'processing', 'shipped'].includes(order.status);
        if (filter === 'completed') return ['delivered', 'paid'].includes(order.status);
        return true;
    });

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/100x100/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchOrders = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await getOrdersApi(userId);
            if (res && res.success) {
                setOrders(res.orders || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử mua hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [userId, isFocused]);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="arrow-left" size={24} iconColor="#1e293b" style={{ margin: 0 }} />
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Lịch sử mua hàng</Text>
                <Text style={styles.subtitle}>Tất cả các đơn đặt hàng và trạng thái hiện tại của chúng.</Text>

                {/* Status Filters */}
                <View style={styles.filterRow}>
                    <TouchableOpacity 
                        style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]} 
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]} 
                        onPress={() => setFilter('pending')}
                    >
                        <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Đang xử lý</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterBtn, filter === 'completed' && styles.filterBtnActive]} 
                        onPress={() => setFilter('completed')}
                    >
                        <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Hoàn thành</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {filteredOrders.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>Bạn không có đơn hàng nào trong mục này.</Text>
                    <Button mode="contained" onPress={() => navigation.navigate('StoreTab')} style={{ marginTop: 16 }} buttonColor="#4c6545">
                        Mua sắm ngay
                    </Button>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {filteredOrders.map((order) => (
                        <TouchableOpacity 
                            key={order._id} 
                            style={styles.orderCard}
                            onPress={() => navigation.navigate('OrderDetail', { id: order._id })}
                        >
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>#{order._id?.slice(-6).toUpperCase()}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{translateStatus(order.status)}</Text>
                                </View>
                            </View>

                            <View style={styles.orderItems}>
                                {order.items?.map((item, idx) => (
                                    <View key={idx} style={styles.orderItemRow}>
                                        <Image 
                                            source={{ uri: getImageUrl(item.productId?.image || item.productId?.images?.[0]?.imageUrl) }} 
                                            style={styles.orderItemImg} 
                                        />
                                        <View style={styles.orderItemInfo}>
                                            <Text style={styles.orderItemTitle} numberOfLines={1}>{item.productId?.title || 'Sản phẩm'}</Text>
                                            <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.orderFooter}>
                                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
                                <Text style={styles.orderTotal}>{formatPrice(order.totalAmount)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    statusBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#d97706',
        textTransform: 'uppercase',
    },
    orderItems: {
        marginBottom: 12,
    },
    orderItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderItemImg: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
    },
    orderItemInfo: {
        marginLeft: 12,
        flex: 1,
    },
    orderItemTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    orderItemQty: {
        fontSize: 12,
        color: '#64748b',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    orderDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    filterRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    filterBtnActive: {
        backgroundColor: '#4c6545',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#475569',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default OrderHistoryScreen;
