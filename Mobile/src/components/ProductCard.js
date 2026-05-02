import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { IconButton } from 'react-native-paper';

const conditionLabel = (c) => ({ new: 'Mới', like_new: 'Như mới', good: 'Tốt', fair: 'Khá', poor: 'Cũ' }[c] || c);

const getImageUrl = (url) => {
    if (!url) return 'https://dummyimage.com/400x500/f5f5f5/333333.png?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://192.168.1.14:3001${url.startsWith('/') ? '' : '/'}${url}`;
};

const getMainImageHelper = (product) => {
    if (product?.images && product.images.length > 0) {
        const primary = product.images.find(img => img.isPrimary);
        if (primary && primary.imageUrl) return getImageUrl(primary.imageUrl);
        return getImageUrl(product.images[0].imageUrl);
    }
    return 'https://dummyimage.com/400x500/f5f5f5/333333.png?text=No+Image';
};

const formatPriceHelper = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = memo(({ item, isLarge, wishlisted, onWishlist, onCart, onNavigate }) => {
    if (!item) return null;
    const isMuseumQuality = item.condition === 'like_new' || item.price > 1000000;
    
    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => onNavigate(item.slug || item._id)} 
            style={styles.container}
        >
            <View style={[styles.imageContainer, isLarge ? styles.largeAspect : styles.normalAspect]}>
                <Image
                    source={{ uri: getMainImageHelper(item) }}
                    style={styles.image}
                    resizeMode="cover"
                />
                
                {isMuseumQuality && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>✦ CHỌN LỌC</Text>
                    </View>
                )}

                <View style={styles.actionsContainer}>
                    <IconButton
                        icon={wishlisted ? 'cards-heart' : 'heart-outline'}
                        iconColor={wishlisted ? '#fff' : '#4c6545'}
                        containerColor={wishlisted ? '#4c6545' : 'rgba(255, 255, 255, 0.9)'}
                        size={18}
                        onPress={(e) => {
                            // React Native onPress doesn't have stopPropagation, we use it natively but since it's nested in TouchableOpacity, it might trigger the parent.
                            // However, IconButton handles its own onPress usually blocking the parent if it's hit directly.
                            onWishlist && onWishlist(item._id || item.slug);
                        }}
                        style={styles.actionButton}
                    />
                    <IconButton
                        icon="cart-plus"
                        iconColor="#4c6545"
                        containerColor="rgba(255, 255, 255, 0.9)"
                        size={18}
                        onPress={() => onCart && onCart(item._id || item.slug)}
                        style={styles.actionButton}
                    />
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={[styles.title, isLarge ? styles.titleLarge : styles.titleNormal]} numberOfLines={2}>
                    {item.title}
                </Text>
                
                <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>{item.categoryId?.name || 'Thời trang'}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{conditionLabel(item.condition)}</Text>
                    {item.brandId?.name && (
                        <>
                            <View style={styles.dot} />
                            <Text style={styles.brandText}>{item.brandId.name}</Text>
                        </>
                    )}
                </View>
                
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{formatPriceHelper(item.price)}</Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.originalPrice}>{formatPriceHelper(item.originalPrice)}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 16,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    normalAspect: {
        aspectRatio: 3/4,
    },
    largeAspect: {
        aspectRatio: 4/3,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 1,
    },
    actionsContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'column',
    },
    actionButton: {
        margin: 4,
        width: 32,
        height: 32,
    },
    infoContainer: {
        marginTop: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    titleNormal: {
        fontSize: 14,
    },
    titleLarge: {
        fontSize: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 11,
        color: '#666',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ccc',
        marginHorizontal: 6,
    },
    brandText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4c6545',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
});

export default ProductCard;
