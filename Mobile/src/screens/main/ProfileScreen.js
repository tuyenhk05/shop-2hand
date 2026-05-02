import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrdersApi } from '../../services/client/order.service';
import { getConsignmentsApi } from '../../services/client/consignment.service';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const userId = useSelector((state) => state.auth.userId);

    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'consignor'
    const [orders, setOrders] = useState([]);
    const [consignments, setConsignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const userName = useSelector(state => state.auth.userName) || 'Người dùng Atelier';

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [ordersRes, consignmentsRes] = await Promise.all([
                    getOrdersApi(userId),
                    getConsignmentsApi(userId)
                ]);

                if (ordersRes?.success) {
                    setOrders(ordersRes.orders || []);
                }
                if (consignmentsRes?.success) {
                    setConsignments(consignmentsRes.consignments || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isFocused) {
            loadDashboardData();
        }
    }, [userId, isFocused]);

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        dispatch({ type: 'LOGOUT' });
                        navigation.replace('Login');
                    }
                }
            ]
        );
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

    const translateConsignmentStatus = (status) => {
        switch (status) {
            case 'pending': return 'Đang thẩm định';
            case 'valued': return 'Chờ xác nhận';
            case 'approved': return 'Chờ nhận hàng';
            case 'received': return 'Đã nhận hàng';
            case 'rejected': return 'Đã từ chối/hủy';
            case 'completed': return 'Đã hoàn tất';
            default: return status || 'Đang chờ';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/100x100/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        // Prepend backend URL if it's a relative path (local upload)
        return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const processingOrders = useMemo(() => {
        return orders.filter(o => ['pending_payment', 'processing', 'shipped'].includes(o.status));
    }, [orders]);

    const totalCarbonSaved = useMemo(() => {
        return orders.reduce((total, order) => {
            if (order.status !== 'cancelled' && order.status !== 'returned') {
                let itemCount = 0;
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        itemCount += (item.quantity || 1);
                    });
                }
                return total + (itemCount * 14);
            }
            return total;
        }, 0);
    }, [orders]);

    if (!userId) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
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
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Xin chào,</Text>
                    <Text style={styles.userName}>{userName}</Text>
                </View>
                <IconButton icon="logout" size={24} onPress={handleLogout} />
            </View>

            {/* Tab Toggle */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'buyer' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('buyer')}
                >
                    <Text style={[styles.tabText, activeTab === 'buyer' && styles.tabTextActive]}>Mua hàng</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'consignor' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('consignor')}
                >
                    <Text style={[styles.tabText, activeTab === 'consignor' && styles.tabTextActive]}>Ký gửi</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {activeTab === 'buyer' ? (
                    <View style={styles.tabContent}>
                        {/* UTILITIES SHORTCUTS */}
                        <View style={styles.utilityRow}>
                            <TouchableOpacity style={styles.utilityBtn} onPress={() => navigation.navigate('Wishlist')}>
                                <IconButton icon="heart" size={24} iconColor="#FF8A65" style={styles.utilIcon} />
                                <Text style={styles.utilityLabel}>Yêu thích</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityBtn} onPress={() => navigation.navigate('OrderHistory')}>
                                <IconButton icon="receipt" size={24} iconColor="#4A5D4E" style={styles.utilIcon} />
                                <Text style={styles.utilityLabel}>Đơn hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityBtn} onPress={() => navigation.navigate('ChatSupport')}>
                                <IconButton icon="chat-processing" size={24} iconColor="#3b82f6" style={styles.utilIcon} />
                                <Text style={styles.utilityLabel}>Hỗ trợ</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Đơn đang xử lý</Text>
                                <Text style={styles.statValue}>{processingOrders.length}</Text>
                            </View>
                            <View style={[styles.statBox, styles.statBoxEco]}>
                                <Text style={[styles.statLabel, {color: '#fff'}]}>Carbon tiết kiệm</Text>
                                <Text style={[styles.statValue, {color: '#fff'}]}>{totalCarbonSaved.toFixed(1)}kg</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Lịch sử mua hàng</Text>
                        
                        {orders.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
                            </View>
                        ) : (
                            orders.map(order => (
                                <TouchableOpacity key={order._id} style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { id: order._id })}>
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
                                                    source={{ uri: getImageUrl(item.productId?.image || item.productId?.images?.find(img => img.isPrimary)?.imageUrl || item.productId?.images?.[0]?.imageUrl) }} 
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
                            ))
                        )}
                    </View>
                ) : (
                    <View style={styles.tabContent}>
                        {/* Consignor Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Đã gửi</Text>
                                <Text style={styles.statValue}>{consignments.length}</Text>
                            </View>
                            <View style={[styles.statBox, {backgroundColor: '#e0e7ff'}]}>
                                <Text style={styles.statLabel}>Đã duyệt/Nhận</Text>
                                <Text style={styles.statValue}>{consignments.filter(c => ['valued', 'approved', 'received', 'completed'].includes(c.status)).length}</Text>
                            </View>
                        </View>

                        <Button 
                            mode="contained" 
                            onPress={() => navigation.navigate('Consignment')} 
                            style={styles.consignmentBtn}
                            labelStyle={styles.consignmentLabel}
                            buttonColor="#4c6545"
                        >
                            + GỬI BÁN ĐỒ CŨ
                        </Button>

                        <Text style={styles.sectionTitle}>Nhật ký ký gửi</Text>
                        
                        {consignments.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Bạn chưa có yêu cầu ký gửi nào.</Text>
                            </View>
                        ) : (
                            consignments.map(item => (
                                <View key={item._id} style={styles.orderCard}>
                                    <View style={styles.orderHeader}>
                                        <Text style={styles.orderId} numberOfLines={1}>{item.title || 'Yêu cầu'}</Text>
                                        <View style={[styles.statusBadge, {backgroundColor: '#f1f5f9'}]}>
                                            <Text style={[styles.statusText, {color: '#475569'}]}>{translateConsignmentStatus(item.status)}</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.orderItemRow}>
                                        <Image 
                                            source={{ uri: getImageUrl(item.photos?.[0]) }} 
                                            style={styles.orderItemImg} 
                                        />
                                        <View style={styles.orderItemInfo}>
                                            <Text style={styles.orderItemTitle}>{item.brandId?.name || 'No Brand'}</Text>
                                            <Text style={styles.orderItemQty}>{item.categoryId?.name || 'Chưa phân loại'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.orderFooter}>
                                        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                                        <Text style={styles.orderTotal}>Đề xuất: {formatPrice(item.expectedPrice)}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    welcomeText: {
        fontSize: 14,
        color: '#64748b',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#1e293b',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    tabContent: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    utilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    utilityBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginHorizontal: 4,
    },
    utilIcon: {
        margin: 0,
        padding: 0,
    },
    utilityLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        marginTop: 4,
    },
    statBox: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statBoxEco: {
        backgroundColor: '#4A5D4E',
        borderColor: '#4A5D4E',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    emptyBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
    consignmentBtn: {
        marginBottom: 24,
        borderRadius: 12,
        paddingVertical: 4,
    },
    consignmentLabel: {
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 1,
    },
});

export default ProfileScreen;
