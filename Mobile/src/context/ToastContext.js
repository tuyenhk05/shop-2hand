import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { IconButton } from 'react-native-paper';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
    const [opacity] = useState(new Animated.Value(0));

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setToast(null));
        }, 2500);
    }, [opacity]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View style={[styles.toastContainer, styles[toast.type], { opacity }]}>
                    <IconButton 
                        icon={toast.type === 'success' ? 'check-circle' : 'alert-circle'} 
                        iconColor={toast.type === 'success' ? '#1b4332' : '#7f1d1d'} 
                        size={18}
                        style={styles.icon}
                    />
                    <Text style={[styles.toastText, styles[`text_${toast.type}`]]}>{toast.message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback if provider isn't mounted yet
        return {
            showToast: (msg, type) => console.log(`Toast fallback [${type}]: ${msg}`)
        };
    }
    return context;
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 9999,
        borderWidth: 1,
    },
    success: {
        backgroundColor: '#f4fbf7',
        borderColor: '#a7f3d0',
    },
    error: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    info: {
        backgroundColor: '#f0f9ff',
        borderColor: '#bae6fd',
    },
    icon: {
        margin: 0,
        padding: 0,
        marginRight: 4,
    },
    toastText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    text_success: {
        color: '#065f46',
    },
    text_error: {
        color: '#991b1b',
    },
    text_info: {
        color: '#0369a1',
    },
});
