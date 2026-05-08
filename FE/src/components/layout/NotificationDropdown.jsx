import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    getNotificationsApi, 
    markAsReadApi, 
    markAllAsReadApi, 
    connectNotificationSocket 
} from '../../services/client/notification.service';
import {
    getAdminNotificationsApi, 
    markAdminAsReadApi, 
    markAdminAllAsReadApi
} from '../../services/admin/notification.service';
import { getCookie } from '../../helpers/cookie';

const NotificationDropdown = ({ isAdmin = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const token = getCookie('token') || localStorage.getItem('token');

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = isAdmin ? await getAdminNotificationsApi() : await getNotificationsApi();
            if (res.success) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Socket setup
        const socket = connectNotificationSocket();
        socketRef.current = socket;

        socket.on('connect', () => {
            if (isAdmin) {
                socket.emit('admin_join');
            } else if (userId) {
                socket.emit('join', userId);
            }
        });

        socket.on('new_notification', (newNotif) => {
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
            
            // Optional: Play a subtle sound or show a toast
        });

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            socket.disconnect();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAdmin, userId, token]);

    const handleMarkAsRead = async (id) => {
        try {
            const res = isAdmin ? await markAdminAsReadApi(id) : await markAsReadApi(id);
            if (res.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = isAdmin ? await markAdminAllAsReadApi() : await markAllAsReadApi();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_status': return 'shopping_bag';
            case 'consignment_status': return 'storefront';
            case 'new_order': return 'receipt_long';
            case 'new_consignment': return 'handshake';
            default: return 'notifications';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return new Date(date).toLocaleDateString('vi-VN');
    };

    if (!token && !isAdmin) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all relative ${
                    isOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
            >
                <span className="material-symbols-outlined hover:scale-105 transition-transform" style={{ fontVariationSettings: "'wght' 300" }}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#fef9f7]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                        <h3 className="font-headline font-bold text-on-surface">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/20 scrollbar-track-transparent">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-outline-variant/5">
                                {notifications.map((n) => (
                                    <div 
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 flex gap-4 cursor-pointer transition-colors hover:bg-surface-container-low relative ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                                    >
                                        {!n.isRead && (
                                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        )}
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                                            !n.isRead ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                                        }`}>
                                            <span className="material-symbols-outlined text-[20px]">{getIcon(n.type)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-0.5">
                                                <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap mt-0.5">
                                                    {getTimeAgo(n.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs line-clamp-2 leading-relaxed ${!n.isRead ? 'text-on-surface-variant font-medium' : 'text-on-surface-variant/70'}`}>
                                                {n.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant/40">
                                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                                <p className="text-sm font-medium">Chưa có thông báo nào</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-surface-container-low/30 border-t border-outline-variant/10 text-center">
                        <Link 
                            to={isAdmin ? "/admin/notifications" : "/notifications"} 
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                        >
                            Xem tất cả thông báo
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
