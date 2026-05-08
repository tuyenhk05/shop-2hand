import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
    getNotificationsApi,
    markAsReadApi,
    markAllAsReadApi,
} from '../../services/client/notification.service';

const PRIMARY_COLOR = '#FF8A65';

const NotificationScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const fetchNotifications = async () => {
        const res = await getNotificationsApi();
        if (res && res.success) {
            setNotifications(res.data || []);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        const res = await markAsReadApi(id);
        if (res && res.success) {
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsReadApi();
        if (res && res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    const handleNotificationClick = (item) => {
        if (!item.isRead) {
            handleMarkAsRead(item._id);
        }
        
        if (item.link) {
            if (item.link.includes('/history')) {
                navigation.navigate('OrderHistory');
            } else if (item.link.includes('/dashboard?tab=consignor')) {
                navigation.navigate('Consignment', { activeTab: 'consignor' });
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_status': return 'package-variant-closed';
            case 'consignment_status': return 'storefront';
            case 'new_order': return 'receipt';
            case 'new_consignment': return 'handshake';
            default: return 'bell';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => handleNotificationClick(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, !item.isRead ? styles.unreadIcon : styles.readIcon]}>
                <Icon name={getIcon(item.type)} size={24} color={!item.isRead ? PRIMARY_COLOR : '#666'} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
                </View>
                <Text style={[styles.content, !item.isRead && styles.unreadContent]} numberOfLines={2}>
                    {item.content}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                {notifications.some(n => !n.isRead) && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllText}>Đọc tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="bell-off-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef9f7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    markAllText: {
        fontSize: 14,
        color: PRIMARY_COLOR,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: 'rgba(255, 138, 101, 0.05)',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    unreadIcon: {
        backgroundColor: 'rgba(255, 138, 101, 0.1)',
    },
    readIcon: {
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        flex: 1,
    },
    unreadText: {
        color: '#1a1a1a',
        fontWeight: '700',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
    content: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    unreadContent: {
        color: '#444',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: PRIMARY_COLOR,
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 15,
    },
});

export default NotificationScreen;
