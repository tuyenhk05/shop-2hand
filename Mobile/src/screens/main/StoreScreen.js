import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllProducts } from '../../services/client/products';
import { getAllCategories } from '../../services/client/category.service';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const StoreScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialCategory = route.params?.category;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);

    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory]);

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);
                
                if (productRes?.data || productRes?.success) {
                    setProducts(productRes.data || productRes);
                }
                
                if (categoryRes?.success) {
                    setCategories(categoryRes.data);
                }
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsAndCategories();
    }, []);

    // Recursive helper exactly like FE
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

    // Filter logic exactly matching FE
    const filteredProducts = products.filter(p => {
        if (selectedCategory) {
            const productCatId = String(p.categoryId?._id || p.categoryId || '');
            const selectedCatStr = String(selectedCategory);
            const validIds = [selectedCatStr, ...getAllDescendantIds(selectedCatStr, categories)];
            if (!validIds.includes(productCatId)) return false;
        }
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Kho lưu trữ</Text>
            <Text style={styles.subtitle}>
                Tuyển chọn các tạo tác đồ cũ, được nâng niu với sự tôn trọng dành cho thiết kế cao cấp.
            </Text>

            <View style={styles.searchContainer}>
                <TextInput
                    mode="outlined"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#4A5D4E"
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>

            {/* Simple Category Filter */}
            <View style={styles.categoriesScroll}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[{ _id: null, name: 'Tất cả' }, ...categories]}
                    keyExtractor={(item) => String(item._id || 'all')}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryPill,
                                selectedCategory === item._id && styles.categoryPillActive
                            ]}
                            onPress={() => setSelectedCategory(item._id)}
                        >
                            <Text style={[
                                styles.categoryPillText,
                                selectedCategory === item._id && styles.categoryPillTextActive
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                    Đang hiển thị {filteredProducts.length} sản phẩm
                </Text>
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
                <ActivityIndicator size="large" color="#4A5D4E" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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
        padding: 24,
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
        marginBottom: 24,
        lineHeight: 20,
    },
    searchContainer: {
        marginBottom: 24,
    },
    searchInput: {
        backgroundColor: '#fff',
    },
    categoriesScroll: {
        marginBottom: 16,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryPillActive: {
        backgroundColor: '#4A5D4E',
        borderColor: '#4A5D4E',
    },
    categoryPillText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    categoryPillTextActive: {
        color: '#fff',
    },
    resultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 16,
        marginBottom: 8,
    },
    resultsText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    productWrapper: {
        width: '47%',
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
    },
});

export default StoreScreen;
