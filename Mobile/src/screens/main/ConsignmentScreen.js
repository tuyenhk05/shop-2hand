import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createConsignmentApi } from '../../services/client/consignment.service';
import { getAllCategories } from '../../services/client/category.service';
import { getAllBrands } from '../../services/client/brand.service';

const { width } = Dimensions.get('window');

const ConsignmentScreen = () => {
    const navigation = useNavigation();
    const userId = useSelector((state) => state.auth.userId);

    // States matching the FE 3-step wizard
    const [step, setStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState([]); // Array of strings (URLs/Placeholders)
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
    const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

    // Fetch drop down lists exactly like FE
    useEffect(() => {
        const fetchData = async () => {
            const [catRes, brandRes] = await Promise.all([
                getAllCategories(),
                getAllBrands()
            ]);
            if (catRes?.success) setCategories(catRes.data || []);
            if (brandRes?.success) setBrands(brandRes.data || []);
        };
        fetchData();
    }, []);

    // Simulated image picker exactly for mobile preview environment
    const handleAddImage = () => {
        const mockImageUrl = 'https://dummyimage.com/400x500/4c6545/ffffff.png?text=Atelier+Mock';
        setUploadedFiles(prev => [...prev, mockImageUrl]);
        setPreviewUrls(prev => [...prev, mockImageUrl]);
    };

    const handleRemoveImage = (indexToRemove) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleNext = () => {
        if (step === 1) {
            if (previewUrls.length === 0) {
                setAlert({ type: 'error', message: 'Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.' });
                return;
            }
            setAlert(null);
            setStep(2);
        } else if (step === 2) {
            if (!title || !description || !categoryId) {
                setAlert({ type: 'error', message: 'Vui lòng điền tên, mô tả và chọn danh mục.' });
                return;
            }
            setAlert(null);
            setStep(3);
        } else if (step === 3) {
            submitConsignment();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const submitConsignment = async () => {
        if (!userId) {
            setAlert({ type: 'error', message: 'Vui lòng đăng nhập để gửi bán sản phẩm.' });
            return;
        }

        try {
            setSubmitting(true);
            setAlert(null);

            // FormData to send to creating consignment API exactly like FE
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

            uploadedFiles.forEach(fileUrl => {
                formData.append('images', fileUrl);
            });

            const res = await createConsignmentApi(formData);

            if (res && res.success) {
                setAlert({ type: 'success', message: 'Yêu cầu ký gửi đã được gửi thành công!' });
                setTimeout(() => navigation.navigate('ProfileTab'), 1500);
            } else {
                setAlert({ type: 'error', message: 'Lưu yêu cầu thất bại: ' + (res.message || 'Lỗi không xác định') });
            }
        } catch (error) {
            console.error("Lỗi gửi ký gửi", error);
            setAlert({ type: 'error', message: 'Có lỗi xảy ra kết nối server.' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" size={24} iconColor="#4c6545" onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Ký gửi Atelier</Text>
                <View style={{ width: 48 }} />
            </View>

            {/* Step Stepper Indicator */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepTrack}>
                    <View style={[styles.stepFill, { width: `${(step / 3) * 100}%` }]} />
                </View>
                <View style={styles.stepTextRow}>
                    <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>01 Ảnh & Tình trạng</Text>
                    <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>02 Chi tiết</Text>
                    <Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>03 Xác nhận</Text>
                </View>
            </View>

            {/* Beautiful alert boxes */}
            {alert && (
                <View style={[styles.alertBox, alert.type === 'success' ? styles.alertSuccess : styles.alertError]}>
                    <IconButton 
                        icon={alert.type === 'success' ? 'check-circle' : 'alert-circle'} 
                        iconColor={alert.type === 'success' ? '#1b4332' : '#7f1d1d'} 
                        size={20}
                        style={styles.alertIcon} 
                    />
                    <Text style={[styles.alertText, alert.type === 'success' ? styles.alertTextSuccess : styles.alertTextError]}>
                        {alert.message}
                    </Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* STEP 1: IMAGES & CONDITION */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.sectionTitle}>Hình ảnh sản phẩm</Text>
                        <Text style={styles.sectionSubtitle}>
                            Tải lên các góc độ chi tiết của sản phẩm để chúng tôi định giá tốt nhất.
                        </Text>

                        <View style={styles.imageGrid}>
                            {previewUrls.map((imgUrl, index) => (
                                <View key={index} style={styles.imageBox}>
                                    <Image source={{ uri: imgUrl }} style={styles.imageItem} />
                                    <TouchableOpacity style={styles.deleteOverlay} onPress={() => handleRemoveImage(index)}>
                                        <IconButton icon="delete" size={18} iconColor="#fff" style={{ margin: 0 }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            
                            {previewUrls.length < 8 && (
                                <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                                    <IconButton icon="camera-plus" size={28} iconColor="#4c6545" style={{ margin: 0 }} />
                                    <Text style={styles.addImageLabel}>Thêm ảnh</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.label}>Tình trạng hiện tại</Text>
                        <View style={styles.conditionSelectRow}>
                            {[
                                { val: 'perfect', lbl: 'Hoàn hảo' },
                                { val: 'excellent', lbl: 'Tuyệt vời' },
                                { val: 'very_good', lbl: 'Rất tốt' },
                                { val: 'good', lbl: 'Tốt' }
                            ].map(cond => (
                                <TouchableOpacity 
                                    key={cond.val} 
                                    style={[styles.condPill, condition === cond.val && styles.condPillActive]} 
                                    onPress={() => setCondition(cond.val)}
                                >
                                    <Text style={[styles.condPillText, condition === cond.val && styles.condPillTextActive]}>
                                        {cond.lbl}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* STEP 2: DETAILED PRODUCT INFO */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

                        <Text style={styles.label}>Tên sản phẩm *</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ví dụ: Túi Chanel Boy Size M Black"
                            placeholderTextColor="#94a3b8"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Mô tả sản phẩm *</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            placeholder="Mô tả về tình trạng chi tiết, phụ kiện đi kèm..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.label}>Danh mục *</Text>
                        <View style={styles.selectScroll}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {categories.map(cat => (
                                    <TouchableOpacity 
                                        key={cat._id} 
                                        style={[styles.selectPill, categoryId === cat._id && styles.selectPillActive]} 
                                        onPress={() => setCategoryId(cat._id)}
                                    >
                                        <Text style={[styles.selectPillText, categoryId === cat._id && styles.selectPillTextActive]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <Text style={styles.label}>Thương hiệu</Text>
                        <View style={styles.selectScroll}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {brands.map(brand => (
                                    <TouchableOpacity 
                                        key={brand._id} 
                                        style={[styles.selectPill, brandId === brand._id && styles.selectPillActive]} 
                                        onPress={() => setBrandId(brand._id)}
                                    >
                                        <Text style={[styles.selectPillText, brandId === brand._id && styles.selectPillTextActive]}>
                                            {brand.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.rowFields}>
                            <View style={styles.fieldItem}>
                                <Text style={styles.label}>Giới tính</Text>
                                <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Ví dụ: unisex" placeholderTextColor="#94a3b8" />
                            </View>
                            <View style={styles.fieldItem}>
                                <Text style={styles.label}>Kích cỡ (Size)</Text>
                                <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="S, M, 41" placeholderTextColor="#94a3b8" />
                            </View>
                        </View>

                        <View style={styles.rowFields}>
                            <View style={styles.fieldItem}>
                                <Text style={styles.label}>Màu sắc</Text>
                                <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Ví dụ: Đen" placeholderTextColor="#94a3b8" />
                            </View>
                            <View style={styles.fieldItem}>
                                <Text style={styles.label}>Chất liệu</Text>
                                <TextInput style={styles.input} value={material} onChangeText={setMaterial} placeholder="Cotton, Da" placeholderTextColor="#94a3b8" />
                            </View>
                        </View>

                        <Text style={styles.label}>Giá bạn kỳ vọng (VNĐ) *</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ví dụ: 5000000"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            value={expectedPrice}
                            onChangeText={setExpectedPrice}
                        />
                    </View>
                )}

                {/* STEP 3: CONFIRMATION & REVIEW */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.sectionTitle}>Xác nhận thông tin</Text>
                        
                        <View style={styles.previewSummaryCard}>
                            <Image source={{ uri: previewUrls[0] }} style={styles.previewImg} />
                            <View style={styles.previewInfoCol}>
                                <Text style={styles.previewTitle}>{title || 'Chưa đặt tên'}</Text>
                                <Text style={styles.previewDesc} numberOfLines={2}>{description || 'Chưa có mô tả'}</Text>
                                <Text style={styles.previewPrice}>Giá kỳ vọng: {formatPrice(expectedPrice)}</Text>
                            </View>
                        </View>

                        <View style={styles.gridDetails}>
                            <View style={styles.detailItemBox}>
                                <Text style={styles.detailLabel}>Danh mục</Text>
                                <Text style={styles.detailValue}>
                                    {categories.find(c => c._id === categoryId)?.name || 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.detailItemBox}>
                                <Text style={styles.detailLabel}>Thương hiệu</Text>
                                <Text style={styles.detailValue}>
                                    {brands.find(b => b._id === brandId)?.name || 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.detailItemBox}>
                                <Text style={styles.detailLabel}>Tình trạng</Text>
                                <Text style={styles.detailValue}>
                                    {condition === 'perfect' ? 'Hoàn hảo' : condition === 'excellent' ? 'Tuyệt vời' : condition === 'very_good' ? 'Rất tốt' : 'Tốt'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.disclaimerBox}>
                            <Text style={styles.disclaimerText}>
                                Khi nhấn <Text style={{ fontWeight: 'bold' }}>Hoàn tất</Text>, yêu cầu của bạn sẽ được gửi tới đội ngũ thẩm định. Chúng tôi sẽ phản hồi lại mức giá đề xuất trong vòng 24h.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Actions Bottom Bar */}
                <View style={styles.actionRow}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Text style={styles.backBtnText}>QUAY LẠI</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={[styles.nextBtn, step === 1 && { width: '100%' }]} 
                        onPress={handleNext}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.nextBtnText}>
                                {step === 3 ? 'HOÀN TẤT KÝ GỬI' : 'TIẾP TỤC BƯỚC TIẾP'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf9f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fcf9f4',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    stepperContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    stepTrack: {
        height: 4,
        backgroundColor: '#e5e2dd',
        borderRadius: 2,
        overflow: 'hidden',
    },
    stepFill: {
        height: '100%',
        backgroundColor: '#4c6545',
    },
    stepTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    stepText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    stepTextActive: {
        color: '#4c6545',
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    alertSuccess: {
        backgroundColor: '#d1fae5',
        borderColor: '#a7f3d0',
    },
    alertError: {
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
    },
    alertIcon: {
        margin: 0,
        padding: 0,
    },
    alertText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        marginLeft: 4,
    },
    alertTextSuccess: {
        color: '#065f46',
    },
    alertTextError: {
        color: '#991b1b',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    stepContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1c1c19',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 24,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    imageBox: {
        width: (width - 104) / 3,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    imageItem: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    deleteOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 12,
    },
    addImageBtn: {
        width: (width - 104) / 3,
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#c6c8b8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fcf9f4',
    },
    addImageLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4c6545',
        marginTop: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 16,
    },
    conditionSelectRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    condPill: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    condPillActive: {
        backgroundColor: '#4c6545',
    },
    condPillText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    condPillTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fcf9f4',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1c1c19',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    selectScroll: {
        marginBottom: 4,
    },
    selectPill: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 8,
    },
    selectPillActive: {
        backgroundColor: '#4c6545',
    },
    selectPillText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    selectPillTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    rowFields: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fieldItem: {
        width: '48%',
    },
    previewSummaryCard: {
        flexDirection: 'row',
        backgroundColor: '#fcf9f4',
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
    },
    previewImg: {
        width: 70,
        height: 85,
        borderRadius: 10,
        backgroundColor: '#e5e2dd',
    },
    previewInfoCol: {
        marginLeft: 14,
        flex: 1,
        justifyContent: 'center',
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1c1c19',
    },
    previewDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    previewPrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4c6545',
        marginTop: 4,
    },
    gridDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    detailItemBox: {
        flex: 1,
        minWidth: '45%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1c19',
    },
    disclaimerBox: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fde68a',
        borderRadius: 12,
        padding: 14,
    },
    disclaimerText: {
        fontSize: 13,
        color: '#78350f',
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    backBtn: {
        width: '32%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#4c6545',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    nextBtn: {
        width: '64%',
        backgroundColor: '#4c6545',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    }
});

export default ConsignmentScreen;
