import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { IconButton } from 'react-native-paper';

const { width } = Dimensions.get('window');

/**
 * ConfirmModal - Custom styled confirm dialog thay thế Alert.alert
 * 
 * Props:
 *   visible      {boolean}   - hiển thị modal hay không
 *   title        {string}    - tiêu đề dialog
 *   message      {string}    - nội dung thông báo
 *   confirmText  {string}    - text nút xác nhận (mặc định: 'Xác nhận')
 *   cancelText   {string}    - text nút hủy (mặc định: 'Hủy')
 *   confirmType  {string}    - 'danger' | 'primary' (mặc định: 'primary')
 *   icon         {string}    - tên icon từ react-native-paper (optional)
 *   onConfirm    {function}  - callback khi bấm xác nhận
 *   onCancel     {function}  - callback khi bấm hủy
 */
const ConfirmModal = ({
    visible = false,
    title = 'Xác nhận',
    message = '',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmType = 'primary',
    icon,
    onConfirm,
    onCancel,
}) => {
    const isDanger = confirmType === 'danger';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Icon header */}
                    {icon && (
                        <View style={[styles.iconWrapper, isDanger ? styles.iconDanger : styles.iconPrimary]}>
                            <IconButton
                                icon={icon}
                                size={28}
                                iconColor={isDanger ? '#dc2626' : '#4c6545'}
                                style={styles.icon}
                            />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    {!!message && (
                        <Text style={styles.message}>{message}</Text>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn]}
                            onPress={onCancel}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, isDanger ? styles.dangerBtn : styles.confirmBtn]}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                        >
                            <Text style={isDanger ? styles.dangerText : styles.confirmText}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#0f172a',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconPrimary: {
        backgroundColor: '#f0f4ef',
    },
    iconDanger: {
        backgroundColor: '#fef2f2',
    },
    icon: {
        margin: 0,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.1,
    },
    message: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        width: '100%',
        marginTop: 20,
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    btn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    confirmBtn: {
        backgroundColor: '#4c6545',
    },
    dangerBtn: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    confirmText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    dangerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#dc2626',
    },
});

export default ConfirmModal;
