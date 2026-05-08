import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { getAllProducts } from '../../services/client/products';
import { getAllCategories } from '../../services/client/category.service';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationContext';
import { IMAGE_BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { unreadCount } = useNotifications();

    const defaultCategoryImages = [
        require('../../../assets/images/thoi_trang_nam.avif'),
        require('../../../assets/images/thoi_trang_nu.avif'),
        require('../../../assets/images/phu_kien_va_trang_suc.avif'),
        require('../../../assets/images/giay_dep.avif'),
    ];

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/400x500/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        const dataFetch = async () => {
            setLoading(true);
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);

                if (productRes.success) {
                    setProducts(productRes.data);
                }
                if (categoryRes.success) {
                    setCategories(categoryRes.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            } finally {
                setLoading(false);
            }
        };
        dataFetch();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4c6545" />
                <Text style={styles.loadingText}>Đang tải trang chủ...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* LOGO & SEARCH HEADER */}
                <View style={styles.header}>
                    <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
                    <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('StoreTab')}>
                        <IconButton icon="magnify" size={18} iconColor="#64748b" style={{ margin: 0 }} />
                        <Text style={styles.searchPlaceholder}>Tìm kiếm sản phẩm...</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.notificationBtn} 
                        onPress={() => navigation.navigate('Notification')}
                    >
                        <IconButton icon="bell-outline" size={24} iconColor="#1e293b" style={{ margin: 0 }} />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* SMALL CATEGORY BOXES ROW */}
                <View style={styles.categoriesSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryBoxes}>
                        {categories.slice(0, 4).map((cat, idx) => {
                            const imageSource = idx < 4 ? defaultCategoryImages[idx] : { uri: getImageUrl(cat.image) };
                            return (
                                <TouchableOpacity 
                                    key={cat._id || idx} 
                                    style={styles.categoryBox}
                                    onPress={() => navigation.navigate('StoreTab', { category: cat._id })}
                                >
                                    <Image source={imageSource} style={styles.categoryBoxImage} />
                                    <Text style={styles.categoryBoxText} numberOfLines={1}>{cat.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ECO-FRIENDLY ENVIRONMENTAL MESSAGE */}
                <View style={styles.ecoBanner}>
                    <View style={styles.ecoBadge}>
                        <Text style={styles.ecoBadgeText}>THÔNG ĐIỆP XANH</Text>
                    </View>
                    <Text style={styles.ecoTitle}>Thời trang bền vững, bảo vệ môi trường</Text>
                    <Text style={styles.ecoText}>Sử dụng sản phẩm second-hand giúp giảm thiểu lượng rác thải dệt may ra môi trường và tiết kiệm hàng ngàn lít nước sạch.</Text>
                </View>

                {/* PRODUCTS LIST GRID */}
                <View style={styles.productsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('StoreTab')}>
                            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.productsGrid}>
                        {products.slice(0, 10).map((item, index) => (
                            <View key={item._id || index} style={styles.productCardWrapper}>
                                <ProductCard 
                                    item={item} 
                                    onNavigate={(id) => navigation.navigate('ProductDetail', { id })}
                                    wishlisted={false}
                                />
                            </View>
                        ))}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fef9f7',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#4c6545',
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#fef9f7',
    },
    logo: {
        width: 80,
        height: 40,
    },
    searchBar: {
        flex: 1,
        height: 42,
        backgroundColor: '#fff',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchPlaceholder: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 4,
    },
    notificationBtn: {
        marginLeft: 10,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF8A65',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    categoriesSection: {
        paddingVertical: 12,
    },
    categoryBoxes: {
        paddingHorizontal: 16,
    },
    categoryBox: {
        alignItems: 'center',
        marginRight: 16,
        width: 75,
    },
    categoryBoxImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    categoryBoxText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 6,
        textAlign: 'center',
    },
    ecoBanner: {
        backgroundColor: '#f1f5eb',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#d1e3ce',
    },
    ecoBadge: {
        backgroundColor: '#4c6545',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 8,
    },
    ecoBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    ecoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1b321a',
        marginBottom: 4,
    },
    ecoText: {
        fontSize: 12,
        color: '#4c6545',
        lineHeight: 18,
    },
    productsSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    seeAllText: {
        fontSize: 13,
        color: '#4c6545',
        fontWeight: '600',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
});

export default HomeScreen;
