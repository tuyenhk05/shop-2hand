import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const userId = useSelector((state) => state.auth.userId);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadUserInfo = async () => {
            if (!userId) {
                return;
            }
            try {
                setIsLoading(true);
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    setUserName(userData.fullName || userData.name || 'Người dùng Atelier');
                    setUserEmail(userData.email || 'user@example.com');
                } else {
                    setUserName('Người dùng Atelier');
                    setUserEmail('user@example.com');
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin người dùng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isFocused) {
            loadUserInfo();
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

    if (!userId) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4c6545" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* CUSTOMER BASIC INFO SECTION */}
                <View style={styles.userInfoSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                            {userName ? userName[0].toUpperCase() : 'A'}
                        </Text>
                    </View>
                    <View style={styles.userInfoText}>
                        <Text style={styles.fullName}>{userName}</Text>
                        <Text style={styles.email}>{userEmail}</Text>
                    </View>
                </View>

                {/* LINE MENU LIST FOR SCREENS */}
                <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
                        <View style={styles.menuItemLeft}>
                            <IconButton icon="receipt" size={22} iconColor="#4c6545" style={styles.menuIcon} />
                            <Text style={styles.menuItemLabel}>Lịch sử mua hàng</Text>
                        </View>
                        <IconButton icon="chevron-right" size={20} iconColor="#94a3b8" style={styles.menuIconRight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Consignment')}>
                        <View style={styles.menuItemLeft}>
                            <IconButton icon="package-variant-closed" size={22} iconColor="#4c6545" style={styles.menuIcon} />
                            <Text style={styles.menuItemLabel}>Quản lý ký gửi</Text>
                        </View>
                        <IconButton icon="chevron-right" size={20} iconColor="#94a3b8" style={styles.menuIconRight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Cart')}>
                        <View style={styles.menuItemLeft}>
                            <IconButton icon="cart-outline" size={22} iconColor="#4c6545" style={styles.menuIcon} />
                            <Text style={styles.menuItemLabel}>Giỏ hàng của tôi</Text>
                        </View>
                        <IconButton icon="chevron-right" size={20} iconColor="#94a3b8" style={styles.menuIconRight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChatSupport')}>
                        <View style={styles.menuItemLeft}>
                            <IconButton icon="chat-processing-outline" size={22} iconColor="#4c6545" style={styles.menuIcon} />
                            <Text style={styles.menuItemLabel}>Hỗ trợ trực tuyến</Text>
                        </View>
                        <IconButton icon="chevron-right" size={20} iconColor="#94a3b8" style={styles.menuIconRight} />
                    </TouchableOpacity>

                    {/* LOGOUT BUTTON IN LIST */}
                    <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                        <View style={styles.menuItemLeft}>
                            <IconButton icon="logout" size={22} iconColor="#ef4444" style={styles.menuIcon} />
                            <Text style={[styles.menuItemLabel, styles.logoutLabel]}>Đăng xuất</Text>
                        </View>
                        <IconButton icon="chevron-right" size={20} iconColor="#f87171" style={styles.menuIconRight} />
                    </TouchableOpacity>
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
        padding: 24,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 16,
    },
    loginBtn: {
        backgroundColor: '#4c6545',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4c6545',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userInfoText: {
        marginLeft: 16,
    },
    fullName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 2,
    },
    email: {
        fontSize: 13,
        color: '#64748b',
    },
    menuList: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        margin: 0,
        marginRight: 12,
    },
    menuIconRight: {
        margin: 0,
    },
    menuItemLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    logoutItem: {
        borderBottomWidth: 0,
        marginTop: 12,
    },
    logoutLabel: {
        color: '#ef4444',
    }
});

export default ProfileScreen;
