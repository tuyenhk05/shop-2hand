import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCartApi } from '../../services/client/cart.service';
import { createOrderApi } from '../../services/client/order.service';
import { createPaymentUrlApi } from '../../services/client/payment.service';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const userId = useSelector((state) => state.auth.userId);

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        buyerName: '',
        buyerPhone: '',
        shippingAddress: '',
    });

    useEffect(() => {
        const fetchCart = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const response = await getCartApi(userId);
                if (response?.success) {
                    setCartItems(response.cart || []);
                }
            } catch (error) {
                console.error('Fetch cart error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCart();
    }, [userId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.productId || item;
        return acc + (product.price || 0) * (item.quantity || 1);
    }, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const handleCheckout = async () => {
        if (!form.buyerPhone.trim() || !form.shippingAddress.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ số điện thoại và địa chỉ giao hàng.');
            return;
        }

        try {
            const orderRes = await createOrderApi({
                buyerId: userId,
                items: cartItems.map(i => {
                    const product = i.productId || i;
                    return {
                        productId: product._id || product,
                        quantity: i.quantity || 1,
                        priceAtSale: product.price || 0
                    };
                }),
                totalAmount: total,
                shippingAddress: form.shippingAddress.trim(),
                buyerName: form.buyerName.trim() || 'Khách hàng',
                buyerPhone: form.buyerPhone.trim(),
                paymentMethod: "vnpay"
            });

            if (orderRes.success && orderRes.order?._id) {
                const payRes = await createPaymentUrlApi({
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderRes.order._id}`,
                    orderId: orderRes.order._id
                });

                if (payRes.success && payRes.url) {
                    // Open browser for VNPay
                    Linking.openURL(payRes.url);
                    Alert.alert('Thành công', 'Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán trên trình duyệt.');
                    navigation.navigate('StoreTab'); // Or History if it exists in Tab
                } else {
                    Alert.alert('Lỗi', 'Không thể tạo cổng thanh toán VNPAY.');
                }
            } else {
                Alert.alert('Lỗi', orderRes.message || 'Lỗi đặt hàng. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Lỗi', 'Quá trình thanh toán xảy ra lỗi.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Shipping Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nguyễn Văn A"
                            value={form.buyerName}
                            onChangeText={(text) => setForm({...form, buyerName: text})}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0901234567"
                            keyboardType="phone-pad"
                            value={form.buyerPhone}
                            onChangeText={(text) => setForm({...form, buyerPhone: text})}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Địa chỉ nhận hàng *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                            multiline
                            numberOfLines={3}
                            value={form.shippingAddress}
                            onChangeText={(text) => setForm({...form, shippingAddress: text})}
                        />
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <View style={styles.paymentCard}>
                        <IconButton icon="credit-card-outline" size={24} iconColor="#4A5D4E" />
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentTitle}>Ví VNPAY / Thẻ Ngân hàng</Text>
                            <Text style={styles.paymentDesc}>Thanh toán bảo mật qua cổng VNPay</Text>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tóm tắt đơn hàng ({cartItems.length} sản phẩm)</Text>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tạm tính</Text>
                            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                            <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Tổng cộng</Text>
                            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                        </View>
                    </View>
                </View>
                
            </ScrollView>

            <View style={styles.bottomBar}>
                <Button 
                    mode="contained" 
                    onPress={handleCheckout}
                    style={styles.checkoutButton}
                    labelStyle={styles.checkoutButtonText}
                    buttonColor="#FF8A65"
                    disabled={cartItems.length === 0}
                >
                    XÁC NHẬN ĐẶT HÀNG
                </Button>
            </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#4A5D4E',
        borderRadius: 12,
        padding: 12,
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 8,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    paymentDesc: {
        fontSize: 12,
        color: '#64748b',
    },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8A65',
    },
    bottomBar: {
        backgroundColor: '#fff',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    checkoutButton: {
        paddingVertical: 8,
        borderRadius: 12,
    },
    checkoutButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default CheckoutScreen;
