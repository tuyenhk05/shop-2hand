import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllProducts } from '../../services/client/products';
import { getAllCategories } from '../../services/client/category.service';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const defaultCategoryImages = [
        require('../../../assets/images/thoi_trang_nam.avif'),
        require('../../../assets/images/thoi_trang_nu.avif'),
        require('../../../assets/images/phu_kien_va_trang_suc.avif'),
        require('../../../assets/images/giay_dep.avif'),
    ];

    const getImageUrl = (url) => {
        if (!url) return 'https://dummyimage.com/400x500/f5f5f5/333333.png?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
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
                <ActivityIndicator size="large" color="#FF8A65" />
                <Text style={styles.loadingText}>Atelier loading...</Text>
            </View>
        );
    }

    const featuredProduct = products[0];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* LOGO HEADER */}
                <View style={styles.logoHeader}>
                    <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
                </View>

                {/* HERO SECTION */}
                <View style={styles.heroSection}>
                    <View style={styles.heroTextContainer}>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>NGUỒN GỐC ĐƯỢC TUYỂN CHỌN</Text>
                        </View>
                        <Text style={styles.heroTitle}>
                            Di sản được{'\n'}
                            <Text style={styles.heroTitleHighlight}>tái tạo.</Text>
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Khám phá những món đồ thời trang second-hand được tái định nghĩa như những tác phẩm nghệ thuật cao cấp.
                        </Text>
                        <TouchableOpacity 
                            style={styles.heroButton}
                            onPress={() => navigation.navigate('StoreTab')}
                        >
                            <Text style={styles.heroButtonText}>ĐẾN CỬA HÀNG</Text>
                        </TouchableOpacity>
                    </View>

                    {featuredProduct && (
                        <TouchableOpacity 
                            style={styles.heroImageContainer}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('ProductDetail', { id: featuredProduct.slug || featuredProduct._id })}
                        >
                            <Image 
                                source={{ uri: getImageUrl(featuredProduct?.images?.find(img => img.isPrimary)?.imageUrl || featuredProduct?.images?.[0]?.imageUrl) }}
                                style={styles.heroImage}
                            />
                            <View style={styles.heroImageOverlay}>
                                <Text style={styles.heroImageBadge}>Archive Nổi Bật</Text>
                                <View style={styles.heroImageInfo}>
                                    <Text style={styles.heroImageTitle} numberOfLines={1}>{featuredProduct.title}</Text>
                                    <View style={styles.heroImagePriceContainer}>
                                        <Text style={styles.heroImagePrice}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(featuredProduct.price)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* NEW ARRIVALS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('StoreTab')}>
                            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {products.slice(0, 5).map((item, index) => (
                            <View key={item._id || index} style={styles.productCardWrapper}>
                                <ProductCard 
                                    item={item} 
                                    onNavigate={(id) => navigation.navigate('ProductDetail', { id })}
                                    wishlisted={false}
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* FEATURED BRANDS */}
                <View style={[styles.section, styles.brandsSection]}>
                    <Text style={styles.brandsTitle}>— CÁC NHÀ MỐT LƯU TRỮ —</Text>
                    <View style={styles.brandsContainer}>
                        {['CHANEL', 'PRADA', 'Céline', 'GUCCI', 'HERMÈS'].map((brand, idx) => (
                            <Text key={idx} style={[styles.brandItem, brand === 'Céline' && styles.brandItalic]}>
                                {brand}
                            </Text>
                        ))}
                    </View>
                </View>

                {/* CURATED CATEGORIES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Khám phá theo dòng</Text>
                            <Text style={styles.sectionSubtitle}>Tuyển tập thẩm mỹ được cá nhân hóa.</Text>
                        </View>
                    </View>
                    
                    <View style={styles.categoriesGrid}>
                        {categories.slice(0, 4).map((cat, idx) => {
                            // Temporary fallback to web's default logic since require needs static strings in React Native
                            // We use the imported defaultCategoryImages array for the first 4.
                            const imageSource = idx < 4 ? defaultCategoryImages[idx] : { uri: getImageUrl(cat.image) };

                            return (
                                <TouchableOpacity 
                                    key={cat._id || idx}
                                    style={styles.categoryItem}
                                    onPress={() => navigation.navigate('StoreTab', { category: cat._id })}
                                >
                                    <Image source={imageSource} style={styles.categoryImage} />
                                    <View style={styles.categoryOverlay}>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categoryExplore}>KHÁM PHÁ ➔</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                {/* AUTHENTICATION SNIPPET */}
                <View style={styles.authSnippetContainer}>
                    <Text style={styles.authSnippetBadge}>— BẢO CHỨNG NIỀM TIN</Text>
                    <Text style={styles.authSnippetTitle}>Xác minh{'\n'}<Text style={styles.authSnippetTitleItalic}>thủ công.</Text></Text>
                    <Text style={styles.authSnippetDesc}>
                        Mọi món đồ gia nhập Atelier đều trải qua quy trình kiểm định 12 bước bởi các chuyên gia độc lập.
                    </Text>
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
        color: '#FF8A65',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    logoHeader: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    logo: {
        width: 120,
        height: 40,
    },
    heroSection: {
        padding: 24,
        marginBottom: 16,
    },
    heroTextContainer: {
        marginBottom: 32,
    },
    badgeContainer: {
        backgroundColor: '#E4E5DE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    badgeText: {
        color: '#4A5D4E',
        fontSize: 10,
        fontWeight: 'bold',
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#1e293b',
        lineHeight: 48,
        marginBottom: 16,
    },
    heroTitleHighlight: {
        fontStyle: 'italic',
        color: '#9a3412',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 24,
    },
    heroButton: {
        backgroundColor: '#4A5D4E',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    heroButtonText: {
        color: '#E4E5DE',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    heroImageContainer: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroImageOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 16,
    },
    heroImageBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FF8A65',
        marginBottom: 4,
        letterSpacing: 1,
    },
    heroImageInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    heroImageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    heroImagePriceContainer: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    heroImagePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    seeAllText: {
        color: '#FF8A65',
        fontWeight: 'bold',
        fontSize: 14,
    },
    horizontalScroll: {
        paddingRight: 24,
    },
    productCardWrapper: {
        width: width * 0.45,
        marginRight: 16,
    },
    brandsSection: {
        backgroundColor: '#ebe8e3',
        paddingVertical: 40,
        alignItems: 'center',
    },
    brandsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#46483c',
        letterSpacing: 2,
        marginBottom: 24,
    },
    brandsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    brandItem: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#46483c',
        opacity: 0.7,
        marginHorizontal: 8,
    },
    brandItalic: {
        fontStyle: 'italic',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        aspectRatio: 3/4,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    categoryName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    categoryExplore: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    authSnippetContainer: {
        marginHorizontal: 24,
        backgroundColor: '#4c6545',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    authSnippetBadge: {
        color: '#ceebc2',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 16,
    },
    authSnippetTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
        marginBottom: 16,
    },
    authSnippetTitleItalic: {
        fontStyle: 'italic',
        fontWeight: '300',
    },
    authSnippetDesc: {
        color: '#ceebc2',
        fontSize: 14,
        lineHeight: 22,
    },
});

export default HomeScreen;
