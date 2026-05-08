import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { connectNotificationSocket, getNotificationsApi } from '../services/client/notification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);
    const userId = useSelector((state) => state.auth.userId);

    const fetchUnreadCount = async () => {
        if (!userId) return;
        const res = await getNotificationsApi();
        if (res && res.success) {
            const count = res.data.filter(n => !n.isRead).length;
            setUnreadCount(count);
            setNotifications(res.data);
        }
    };

    useEffect(() => {
        if (!userId) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();

        const socket = connectNotificationSocket();
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Mobile socket connected');
            socket.emit('join', userId);
        });

        socket.on('new_notification', (notification) => {
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev]);
            // Optional: Show a local notification/toast
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, notifications, fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
