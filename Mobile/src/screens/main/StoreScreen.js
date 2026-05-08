import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { TextInput, IconButton, Button, Chip, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllProducts } from '../../services/client/products';
import { getAllCategories } from '../../services/client/category.service';
import { getAllBrands } from '../../services/client/brand.service';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationContext';

const { width, height } = Dimensions.get('window');

const StoreScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialCategory = route.params?.category;
    const { unreadCount } = useNotifications();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
    
    // Advanced Filters
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedCondition, setSelectedCondition] = useState(null);
    const [priceRange, setPriceRange] = useState(null); // { min: number, max: number }
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [productRes, categoryRes, brandRes] = await Promise.all([
                    getAllProducts(),
                    getAllCategories(),
                    getAllBrands()
                ]);
                
                if (productRes?.data || productRes?.success) {
                    setProducts(productRes.data || productRes);
                }
                
                if (categoryRes?.success) {
                    setCategories(categoryRes.data);
                }

                if (brandRes?.success) {
                    setBrands(brandRes.data);
                }
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Recursive helper for category descendants
    const getAllDescendantIds = (catId, allCategories) => {
        let descendantIds = [];
        const children = allCategories.filter(cat => {
            const pid = cat.parent_id?._id || cat.parent_id;
            return String(pid) === String(catId);
        });
        
        children.forEach(child => {
            descendantIds.push(String(child._id));
            descendantIds = descendantIds.concat(getAllDescendantIds(child._id, allCategories));
        });
        
        return descendantIds;
    };

    // Enhanced Filter logic
    const filteredProducts = products.filter(p => {
        // Search Query
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Category
        if (selectedCategory) {
            const productCatId = String(p.categoryId?._id || p.categoryId || '');
            const selectedCatStr = String(selectedCategory);
            const validIds = [selectedCatStr, ...getAllDescendantIds(selectedCatStr, categories)];
            if (!validIds.includes(productCatId)) return false;
        }

        // Brand
        if (selectedBrand && String(p.brandId?._id || p.brandId) !== String(selectedBrand)) {
            return false;
        }

        // Gender
        if (selectedGender && p.gender !== selectedGender && p.gender !== 'unisex') {
            return false;
        }

        // Condition
        if (selectedCondition && p.condition !== selectedCondition) {
            return false;
        }

        // Price Range
        if (priceRange) {
            if (p.price < priceRange.min) return false;
            if (priceRange.max && p.price > priceRange.max) return false;
        }

        return true;
    });

    const resetFilters = () => {
        setSelectedCategory(null);
        setSelectedBrand(null);
        setSelectedGender(null);
        setSelectedCondition(null);
        setPriceRange(null);
        setSearchQuery('');
    };

    const renderFilterModal = () => (
        <Modal
            visible={isFilterModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsFilterModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
                        <IconButton icon="close" size={24} onPress={() => setIsFilterModalVisible(false)} />
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
                        {/* Gender */}
                        <Text style={styles.filterLabel}>Giới tính</Text>
                        <View style={styles.chipGroup}>
                            {['nam', 'nữ', 'unisex'].map(g => (
                                <Chip 
                                    key={g}
                                    selected={selectedGender === g}
                                    onPress={() => setSelectedGender(selectedGender === g ? null : g)}
                                    style={[styles.chip, selectedGender === g && styles.chipActive]}
                                    selectedColor={selectedGender === g ? '#fff' : '#64748b'}
                                    showSelectedCheck={false}
                                    theme={{ colors: { primary: '#4c6545' } }}
                                >
                                    {g === 'nam' ? 'Nam' : g === 'nữ' ? 'Nữ' : 'Unisex'}
                                </Chip>
                            ))}
                        </View>

                        <Divider style={styles.divider} />

                        {/* Price Range */}
                        <Text style={styles.filterLabel}>Khoảng giá</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { label: 'Dưới 1M', min: 0, max: 1000000 },
                                { label: '1M - 5M', min: 1000000, max: 5000000 },
                                { label: 'Trên 5M', min: 5000000, max: null },
                            ].map(range => (
                                <Chip 
                                    key={range.label}
                                    selected={priceRange?.label === range.label}
                                    onPress={() => setPriceRange(priceRange?.label === range.label ? null : range)}
                                    style={[styles.chip, priceRange?.label === range.label && styles.chipActive]}
                                    selectedColor={priceRange?.label === range.label ? '#fff' : '#64748b'}
                                    showSelectedCheck={false}
                                    theme={{ colors: { primary: '#4c6545' } }}
                                >
                                    {range.label}
                                </Chip>
                            ))}
                        </View>

                        <Divider style={styles.divider} />

                        {/* Condition */}
                        <Text style={styles.filterLabel}>Tình trạng</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { id: 'perfect', label: 'Hoàn hảo' },
                                { id: 'excellent', label: 'Tuyệt vời' },
                                { id: 'very_good', label: 'Rất tốt' },
                                { id: 'good', label: 'Tốt' },
                            ].map(cond => (
                                <Chip 
                                    key={cond.id}
                                    selected={selectedCondition === cond.id}
                                    onPress={() => setSelectedCondition(selectedCondition === cond.id ? null : cond.id)}
                                    style={[styles.chip, selectedCondition === cond.id && styles.chipActive]}
                                    selectedColor={selectedCondition === cond.id ? '#fff' : '#64748b'}
                                    showSelectedCheck={false}
                                    theme={{ colors: { primary: '#4c6545' } }}
                                >
                                    {cond.label}
                                </Chip>
                            ))}
                        </View>

                        <Divider style={styles.divider} />

                        {/* Brands */}
                        <Text style={styles.filterLabel}>Thương hiệu</Text>
                        <View style={styles.chipGroup}>
                            {brands.map(brand => (
                                <Chip 
                                    key={brand._id}
                                    selected={selectedBrand === brand._id}
                                    onPress={() => setSelectedBrand(selectedBrand === brand._id ? null : brand._id)}
                                    style={[styles.chip, selectedBrand === brand._id && styles.chipActive]}
                                    selectedColor={selectedBrand === brand._id ? '#fff' : '#64748b'}
                                    showSelectedCheck={false}
                                    theme={{ colors: { primary: '#4c6545' } }}
                                >
                                    {brand.name}
                                </Chip>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button mode="outlined" onPress={resetFilters} style={styles.footerBtn} textColor="#4c6545" borderColor="#4c6545">
                            Đặt lại
                        </Button>
                        <Button mode="contained" onPress={() => setIsFilterModalVisible(false)} style={styles.footerBtn} buttonColor="#4c6545">
                            Áp dụng
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Cửa hàng</Text>
                <View style={styles.headerActions}>
                    <IconButton 
                        icon="bell-outline" 
                        size={26} 
                        iconColor="#4c6545" 
                        onPress={() => navigation.navigate('Notification')}
                    />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    )}
                    <IconButton 
                        icon="cart-outline" 
                        size={26} 
                        iconColor="#4c6545" 
                        onPress={() => navigation.navigate('Cart')}
                    />
                </View>
            </View>
            
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <TextInput
                        mode="outlined"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#4c6545"
                        left={<TextInput.Icon icon="magnify" />}
                        dense
                    />
                </View>
                <TouchableOpacity 
                    style={styles.filterBtn} 
                    onPress={() => setIsFilterModalVisible(true)}
                >
                    <IconButton icon="tune" size={20} iconColor="#fff" style={{ margin: 0 }} />
                    <Text style={styles.filterBtnText}>Lọc</Text>
                </TouchableOpacity>
            </View>

            {/* Category Chips Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                <Chip
                    selected={selectedCategory === null}
                    onPress={() => setSelectedCategory(null)}
                    style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
                    selectedColor={selectedCategory === null ? '#fff' : '#64748b'}
                    theme={{ colors: { primary: '#4c6545' } }}
                    showSelectedCheck={false}
                >
                    Tất cả
                </Chip>
                {categories.map(cat => (
                    <Chip
                        key={cat._id}
                        selected={selectedCategory === cat._id}
                        onPress={() => setSelectedCategory(cat._id)}
                        style={[styles.categoryChip, selectedCategory === cat._id && styles.categoryChipActive]}
                        selectedColor={selectedCategory === cat._id ? '#fff' : '#64748b'}
                        theme={{ colors: { primary: '#4c6545' } }}
                        showSelectedCheck={false}
                    >
                        {cat.name}
                    </Chip>
                ))}
            </ScrollView>

            <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                    Đang hiển thị {filteredProducts.length} sản phẩm
                </Text>
                {(selectedCategory || selectedBrand || selectedGender || selectedCondition || priceRange) && (
                    <TouchableOpacity onPress={resetFilters}>
                        <Text style={styles.clearFiltersText}>Xóa tất cả bộ lọc</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.productWrapper}>
            <ProductCard 
                item={item}
                onNavigate={(id) => navigation.navigate('ProductDetail', { id })}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4c6545" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderFilterModal()}
            <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
                        <Button mode="text" onPress={resetFilters} textColor="#4c6545">
                            Xem tất cả sản phẩm
                        </Button>
                    </View>
                )}
            />
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
    listContent: {
        paddingBottom: 24,
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 6,
        left: 20,
        backgroundColor: '#FF8A65',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        zIndex: 1,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    searchContainer: {
        flex: 1,
        marginRight: 12,
    },
    searchInput: {
        backgroundColor: '#fff',
        height: 44,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4c6545',
        borderRadius: 8,
        paddingRight: 12,
        height: 44,
    },
    filterBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    categoriesScroll: {
        paddingBottom: 16,
    },
    categoryChip: {
        marginRight: 8,
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
    },
    categoryChipActive: {
        backgroundColor: '#4c6545',
        borderColor: '#4c6545',
    },
    resultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    resultsText: {
        fontSize: 13,
        color: '#64748b',
        fontStyle: 'italic',
    },
    clearFiltersText: {
        fontSize: 13,
        color: '#ef4444',
        fontWeight: '600',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    productWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
        marginBottom: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: height * 0.8,
        paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalBody: {
        padding: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 12,
        marginTop: 8,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
    },
    chipActive: {
        backgroundColor: '#4c6545',
        borderColor: '#4c6545',
    },
    divider: {
        marginVertical: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    footerBtn: {
        flex: 1,
        marginHorizontal: 8,
    },
});

export default StoreScreen;
