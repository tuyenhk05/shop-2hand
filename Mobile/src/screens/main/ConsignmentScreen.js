import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Image, FlatList, Modal } from 'react-native';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    createConsignmentApi, 
    getConsignmentsApi, 
    updateUserConsignmentStatusApi 
} from '../../services/client/consignment.service';
import { getAllCategories } from '../../services/client/category.service';
import { getAllBrands } from '../../services/client/brand.service';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

const translateConsignmentStatus = (status) => {
    switch (status) {
        case 'pending': return 'Đang chờ định giá';
        case 'valued': return 'Chờ bạn xác nhận';
        case 'approved': return 'Chờ nhận hàng';
        case 'received': return 'Đã nhận & Kiểm định';
        case 'rejected': return 'Đã từ chối/hủy';
        case 'completed': return 'Đã hoàn tất';
        default: return status || 'Đang xử lý';
    }
};

const statusColors = {
    pending: '#94a3b8',
    valued: '#4c6545',
    approved: '#f59e0b',
    received: '#10b981',
    rejected: '#ef4444',
    completed: '#1c1c19',
};

const ConsignmentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { showToast } = useToast();
    const userId = useSelector((state) => state.auth.userId);

    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
    const [consignments, setConsignments] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    
    // View Detail state
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);

    // Form States
    const [step, setStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [condition, setCondition] = useState('excellent');
    const [categoryId, setCategoryId] = useState('');
    const [brandId, setBrandId] = useState('');
    const [gender, setGender] = useState('unisex');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [selectedConsId, setSelectedConsId] = useState(null);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                getAllCategories(),
                getAllBrands()
            ]);
            if (catRes?.success) setCategories(catRes.data || []);
            if (brandRes?.success) setBrands(brandRes.data || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchList = useCallback(async () => {
        if (!userId) return;
        setIsLoadingList(true);
        try {
            const res = await getConsignmentsApi(userId);
            if (res.success) setConsignments(res.consignments || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingList(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isFocused) {
            fetchDropdowns();
            fetchList();
            
            // Check for initial tab from navigation params
            if (route.params?.activeTab) {
                setActiveTab(route.params.activeTab === 'consignor' ? 'list' : route.params.activeTab);
            }
        }
    }, [isFocused, fetchDropdowns, fetchList, route.params]);

    const handleAddImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showToast('Vui lòng cấp quyền truy cập thư viện ảnh.', 'error');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newPreviews = result.assets.map(asset => asset.uri);
            const newFiles = result.assets.map(asset => ({
                uri: asset.uri,
                name: asset.fileName || `consignment_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            }));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleNext = () => {
        if (step === 1) {
            if (previewUrls.length === 0) return showToast('Vui lòng tải lên ít nhất 1 ảnh.', 'error');
            setStep(2);
        } else if (step === 2) {
            if (!title || !description || !categoryId) return showToast('Vui lòng điền thông tin bắt buộc.', 'error');
            setStep(3);
        } else if (step === 3) {
            submitConsignment();
        }
    };

    const submitConsignment = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('condition', condition);
            formData.append('expectedPrice', expectedPrice || 0);
            formData.append('categoryId', categoryId);
            formData.append('brandId', brandId);
            formData.append('gender', gender);
            formData.append('size', size);
            formData.append('color', color);
            formData.append('material', material);

            uploadedFiles.forEach(file => {
                formData.append('images', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type
                });
            });

            const res = await createConsignmentApi(formData);
            if (res.success) {
                showToast('Yêu cầu đã được gửi thành công!', 'success');
                setStep(1);
                setActiveTab('list');
                fetchList();
            } else {
                showToast(res.message || 'Lỗi không xác định', 'error');
            }
        } catch (error) {
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUserAction = async (id, status) => {
        if (status === 'approved') {
            setSelectedConsId(id);
            setIsAddressModalVisible(true);
            return;
        }

        try {
            const res = await updateUserConsignmentStatusApi(id, { status });
            if (res.success) {
                showToast('Đã cập nhật trạng thái.', 'success');
                fetchList();
            }
        } catch (error) {
            showToast('Lỗi khi thao tác.', 'error');
        }
    };

    const confirmAddressAndApprove = async () => {
        try {
            const res = await updateUserConsignmentStatusApi(selectedConsId, { status: 'approved' });
            if (res.success) {
                setIsAddressModalVisible(false);
                showToast('Đã xác nhận. Vui lòng gửi hàng cho Shop!', 'success');
                fetchList();
            }
        } catch (error) {
            showToast('Lỗi khi thao tác.', 'error');
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

    const handleViewDetail = (item) => {
        setSelectedConsignment(item);
        setIsDetailModalVisible(true);
    };

    const renderConsignmentItem = ({ item }) => (
        <TouchableOpacity style={styles.consCard} activeOpacity={0.7} onPress={() => handleViewDetail(item)}>
            <View style={styles.consHeader}>
                <View style={styles.consMainInfo}>
                    <Image 
                        source={{ uri: item.photos?.[0] || 'https://placehold.co/100x120?text=Atelier' }} 
                        style={styles.consThumb} 
                    />
                    <View style={styles.consTextInfo}>
                        <Text style={styles.consTitle} numberOfLines={1}>{item.title || 'Yêu cầu ký gửi'}</Text>
                        <Text style={styles.consMeta}>{item.categoryId?.name} • {item.brandId?.name || 'No Brand'}</Text>
                        <Text style={styles.consDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                </View>
                <View style={styles.consPriceStatus}>
                    <Text style={styles.consPrice}>{formatPrice(item.expectedPrice)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                            {translateConsignmentStatus(item.status)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons based on status */}
            {item.status === 'valued' && (
                <View style={styles.actionRowList}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleUserAction(item._id, 'approved')}>
                        <Text style={styles.acceptBtnText}>CHẤP NHẬN & GỬI ĐỒ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleUserAction(item._id, 'rejected')}>
                        <Text style={styles.rejectBtnText}>TỪ CHỐI</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'pending' && (
                <View style={styles.actionRowList}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleUserAction(item._id, 'rejected')}>
                        <Text style={styles.cancelBtnText}>HỦY YÊU CẦU</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'approved' && (
                <View style={styles.infoRow}>
                    <IconButton icon="information-outline" size={16} iconColor="#f59e0b" />
                    <Text style={styles.infoText}>Vui lòng gửi hàng đến địa chỉ của Shop.</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" size={24} iconColor="#1e293b" onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Quản lý Ký gửi</Text>
                <View style={{ width: 48 }} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'list' && styles.tabActive]} 
                    onPress={() => setActiveTab('list')}
                >
                    <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>LỊCH SỬ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'create' && styles.tabActive]} 
                    onPress={() => setActiveTab('create')}
                >
                    <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>GỬI YÊU CẦU</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'list' ? (
                <View style={styles.content}>
                    {isLoadingList ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#4c6545" />
                        </View>
                    ) : (
                        <FlatList
                            data={consignments}
                            keyExtractor={item => item._id}
                            renderItem={renderConsignmentItem}
                            contentContainerStyle={styles.listPadding}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <IconButton icon="storefront-outline" size={60} iconColor="#e2e8f0" />
                                    <Text style={styles.emptyText}>Bạn chưa có yêu cầu ký gửi nào.</Text>
                                    <Button mode="contained" onPress={() => setActiveTab('create')} style={styles.emptyBtn} buttonColor="#4c6545">
                                        KÝ GỬI NGAY
                                    </Button>
                                </View>
                            }
                            refreshing={isLoadingList}
                            onRefresh={fetchList}
                        />
                    )}
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.formContainer}>
                    {/* Stepper */}
                    <View style={styles.stepper}>
                        <View style={styles.stepTrack}>
                            <View style={[styles.stepFill, { width: `${(step / 3) * 100}%` }]} />
                        </View>
                        <View style={styles.stepLabels}>
                            <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Ảnh</Text>
                            <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Thông tin</Text>
                            <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Xác nhận</Text>
                        </View>
                    </View>

                    {step === 1 && (
                        <View style={styles.formStep}>
                            <Text style={styles.stepTitle}>Hình ảnh sản phẩm</Text>
                            <Text style={styles.stepDesc}>Vui lòng cung cấp ít nhất 1 ảnh chi tiết.</Text>
                            
                            <View style={styles.imageGrid}>
                                {previewUrls.map((url, idx) => (
                                    <View key={idx} style={styles.imageWrapper}>
                                        <Image source={{ uri: url }} style={styles.image} />
                                        <TouchableOpacity style={styles.removeImg} onPress={() => handleRemoveImage(idx)}>
                                            <IconButton icon="close" size={14} iconColor="#fff" style={{ margin: 0 }} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {previewUrls.length < 8 && (
                                    <TouchableOpacity style={styles.addImgBtn} onPress={handleAddImage}>
                                        <IconButton icon="camera-plus" size={30} iconColor="#4c6545" />
                                        <Text style={styles.addImgLabel}>Thêm ảnh</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.inputLabel}>Tình trạng hiện tại</Text>
                            <View style={styles.pillRow}>
                                {['perfect', 'excellent', 'very_good', 'good'].map(val => (
                                    <TouchableOpacity 
                                        key={val} 
                                        style={[styles.pill, condition === val && styles.pillActive]}
                                        onPress={() => setCondition(val)}
                                    >
                                        <Text style={[styles.pillText, condition === val && styles.pillTextActive]}>
                                            {val === 'perfect' ? 'Hoàn hảo' : val === 'excellent' ? 'Tuyệt vời' : val === 'very_good' ? 'Rất tốt' : 'Tốt'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.formStep}>
                            <Text style={styles.stepTitle}>Chi tiết sản phẩm</Text>
                            
                            <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ví dụ: Túi Chanel Boy" />

                            <Text style={styles.inputLabel}>Mô tả *</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline placeholder="Mô tả tình trạng..." />

                            <Text style={styles.inputLabel}>Danh mục *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {categories.map(cat => (
                                    <TouchableOpacity 
                                        key={cat._id} 
                                        style={[styles.pill, categoryId === cat._id && styles.pillActive]}
                                        onPress={() => setCategoryId(cat._id)}
                                    >
                                        <Text style={[styles.pillText, categoryId === cat._id && styles.pillTextActive]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.inputLabel}>Thương hiệu</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {brands.map(brand => (
                                    <TouchableOpacity 
                                        key={brand._id} 
                                        style={[styles.pill, brandId === brand._id && styles.pillActive]}
                                        onPress={() => setBrandId(brand._id)}
                                    >
                                        <Text style={[styles.pillText, brandId === brand._id && styles.pillTextActive]}>{brand.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.inputRow}>
                                <View style={styles.inputCol}>
                                    <Text style={styles.inputLabel}>Size</Text>
                                    <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="S, M, 38..." />
                                </View>
                                <View style={styles.inputCol}>
                                    <Text style={styles.inputLabel}>Màu sắc</Text>
                                    <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Đen, Trắng..." />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Giá kỳ vọng (VNĐ) *</Text>
                            <TextInput style={styles.input} value={expectedPrice} onChangeText={setExpectedPrice} keyboardType="numeric" placeholder="Ví dụ: 1000000" />
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.formStep}>
                            <Text style={styles.stepTitle}>Xác nhận & Gửi</Text>
                            <View style={styles.summaryCard}>
                                <Image source={{ uri: previewUrls[0] }} style={styles.summaryImg} />
                                <View style={styles.summaryContent}>
                                    <Text style={styles.summaryTitle}>{title}</Text>
                                    <Text style={styles.summaryPrice}>{formatPrice(expectedPrice)}</Text>
                                    <Text style={styles.summaryMeta}>{categories.find(c => c._id === categoryId)?.name}</Text>
                                </View>
                            </View>
                            <View style={styles.warningBox}>
                                <Text style={styles.warningText}>Sau khi gửi, chuyên gia của Atelier sẽ thẩm định và báo giá cho bạn trong vòng 24h.</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.actionRow}>
                        {step > 1 && (
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(step - 1)}>
                                <Text style={styles.secondaryBtnText}>QUAY LẠI</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.primaryBtn, step === 1 && { width: '100%' }]} onPress={handleNext} disabled={submitting}>
                            {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>{step === 3 ? 'HOÀN TẤT' : 'TIẾP TỤC'}</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Detail Modal */}
            <Modal visible={isDetailModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '85%' }]}>
                        <Text style={styles.modalTitle}>Chi tiết Yêu cầu Ký gửi</Text>
                        
                        {selectedConsignment && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    {selectedConsignment.photos?.map((p, idx) => (
                                        <Image key={idx} source={{ uri: p }} style={{ width: 120, height: 150, borderRadius: 12, marginRight: 8 }} />
                                    ))}
                                </ScrollView>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tên sản phẩm:</Text>
                                    <Text style={styles.detailValue}>{selectedConsignment.title}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                                    <Text style={[styles.detailValue, { color: statusColors[selectedConsignment.status], fontWeight: 'bold' }]}>
                                        {translateConsignmentStatus(selectedConsignment.status)}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Giá kỳ vọng:</Text>
                                    <Text style={styles.detailValue}>{formatPrice(selectedConsignment.expectedPrice)}</Text>
                                </View>
                                {selectedConsignment.finalPrice > 0 && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Giá Shop định giá:</Text>
                                        <Text style={[styles.detailValue, { color: '#4c6545', fontWeight: 'bold' }]}>{formatPrice(selectedConsignment.finalPrice)}</Text>
                                    </View>
                                )}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Danh mục:</Text>
                                    <Text style={styles.detailValue}>{selectedConsignment.categoryId?.name}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Thương hiệu:</Text>
                                    <Text style={styles.detailValue}>{selectedConsignment.brandId?.name || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Kích thước:</Text>
                                    <Text style={styles.detailValue}>{selectedConsignment.size || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Mô tả:</Text>
                                    <Text style={styles.detailValue}>{selectedConsignment.description}</Text>
                                </View>
                                
                                <View style={{ height: 20 }} />
                            </ScrollView>
                        )}

                        <Button mode="contained" onPress={() => setIsDetailModalVisible(false)} style={styles.modalBtn} buttonColor="#4c6545">
                            ĐÓNG
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Address Modal */}
            <Modal visible={isAddressModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thông tin Gửi hàng</Text>
                        <View style={styles.addressBox}>
                            <Text style={styles.addressLabel}>Địa chỉ Shop:</Text>
                            <Text style={styles.addressValue}>123 Đường Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chí Minh</Text>
                        </View>
                        <Text style={styles.modalNote}>• Vui lòng gửi hàng qua GHTK, Viettel Post...</Text>
                        <Text style={styles.modalNote}>• Hoặc mang trực tiếp đến địa chỉ trên.</Text>
                        <Button mode="contained" onPress={confirmAddressAndApprove} style={styles.modalBtn} buttonColor="#4c6545">
                            TÔI ĐÃ HIỂU & GỬI HÀNG
                        </Button>
                        <TouchableOpacity onPress={() => setIsAddressModalVisible(false)} style={styles.modalClose}>
                            <Text style={styles.modalCloseText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        marginHorizontal: 4,
    },
    tabActive: {
        backgroundColor: '#4c6545',
    },
    tabText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
    },
    tabTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listPadding: {
        padding: 16,
        paddingBottom: 40,
    },
    consCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    consHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    consMainInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    consThumb: {
        width: 60,
        height: 72,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    consTextInfo: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'center',
    },
    consTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    consMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    consDate: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
    },
    consPriceStatus: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    consPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4c6545',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionRowList: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
    },
    acceptBtn: {
        flex: 2,
        backgroundColor: '#4c6545',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    rejectBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    rejectBtnText: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: 'bold',
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#94a3b8',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#fff9eb',
        borderRadius: 10,
        paddingRight: 12,
    },
    infoText: {
        fontSize: 11,
        color: '#b45309',
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 12,
    },
    emptyBtn: {
        marginTop: 24,
        borderRadius: 12,
    },
    formContainer: {
        padding: 20,
    },
    stepper: {
        marginBottom: 24,
    },
    stepTrack: {
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    stepFill: {
        height: '100%',
        backgroundColor: '#4c6545',
    },
    stepLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    stepLabelActive: {
        color: '#4c6545',
    },
    formStep: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    stepDesc: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 20,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    imageWrapper: {
        width: (width - 128) / 3,
        aspectRatio: 1,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeImg: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 12,
    },
    addImgBtn: {
        width: (width - 128) / 3,
        aspectRatio: 1,
        borderRadius: 14,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    addImgLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 20,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: '#4c6545',
    },
    pillText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    pillTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    horizontalScroll: {
        marginTop: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputCol: {
        flex: 1,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
    },
    summaryImg: {
        width: 80,
        height: 100,
        borderRadius: 12,
    },
    summaryContent: {
        marginLeft: 16,
        flex: 1,
        justifyContent: 'center',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    summaryPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4c6545',
        marginTop: 8,
    },
    summaryMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    warningBox: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#fff9eb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    warningText: {
        fontSize: 13,
        color: '#b45309',
        lineHeight: 20,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    primaryBtn: {
        flex: 2,
        backgroundColor: '#4c6545',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    secondaryBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#4c6545',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        color: '#4c6545',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    addressBox: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    addressLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#4c6545',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    addressValue: {
        fontSize: 14,
        color: '#1e293b',
        lineHeight: 20,
    },
    modalNote: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    modalBtn: {
        marginTop: 24,
        borderRadius: 14,
    },
    modalClose: {
        marginTop: 16,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 'bold',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 8,
    },
    detailLabel: {
        width: 120,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
});

export default ConsignmentScreen;
