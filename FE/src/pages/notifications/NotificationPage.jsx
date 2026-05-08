import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AnimateWhenVisible from '../../helpers/animationScroll';

const NotificationPage = ({ isAdmin = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = isAdmin ? await getAdminNotificationsApi() : await getNotificationsApi();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [isAdmin]);

    const handleMarkAsRead = async (id) => {
        try {
            const res = isAdmin ? await markAdminAsReadApi(id) : await markAsReadApi(id);
            if (res.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
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
            }
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
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
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <main className={`min-h-screen font-manrope ${isAdmin ? 'bg-surface-container-lowest' : 'pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto'}`}>
            <AnimateWhenVisible direction="fade" className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="font-notoSerif text-4xl font-bold mb-2">Thông báo</h1>
                    <p className="text-on-surface-variant text-sm">Cập nhật những hoạt động mới nhất của bạn.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </AnimateWhenVisible>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <AnimateWhenVisible 
                            key={n._id} 
                            direction="fadeInUp"
                            onClick={() => handleNotificationClick(n)}
                            className={`p-5 rounded-2xl flex gap-5 cursor-pointer transition-all border border-outline-variant/10 group ${
                                !n.isRead ? 'bg-primary/[0.03] border-primary/20 shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                            }`}
                        >
                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                                !n.isRead ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                                <span className="material-symbols-outlined text-[24px]">{getIcon(n.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-4 mb-1">
                                    <h3 className={`text-base font-bold ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                        {n.title}
                                    </h3>
                                    <span className="text-[11px] text-on-surface-variant/60 whitespace-nowrap font-medium uppercase tracking-tighter">
                                        {getTimeAgo(n.createdAt)}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-on-surface-variant font-medium' : 'text-on-surface-variant/70'}`}>
                                    {n.content}
                                </p>
                                {!n.isRead && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                        Mới
                                    </div>
                                )}
                            </div>
                        </AnimateWhenVisible>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant/40">
                    <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl">notifications_off</span>
                    </div>
                    <p className="text-lg font-bold text-on-surface-variant mb-1">Chưa có thông báo</p>
                    <p className="text-sm">Chúng tôi sẽ báo cho bạn khi có tin mới.</p>
                </div>
            )}
        </main>
    );
};

export default NotificationPage;
