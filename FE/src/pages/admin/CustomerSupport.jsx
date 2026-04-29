import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message, Badge } from 'antd';
import {
    getAllConversationsAdminApi,
    getConversationDetailAdminApi,
    closeConversationApi,
    markReadByAdminApi,
    connectSupportSocket,
    disconnectSupportSocket
} from '../../services/client/support.service';
import { getOrderById } from '../../services/admin/orders.service.jsx';
import { useSelector } from 'react-redux';
import { Modal, Descriptions, Tag } from 'antd';

const statusLabel = {
    open: 'Chờ phản hồi',
    in_progress: 'Đang xử lý',
    closed: 'Đã đóng'
};

const statusColor = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-500'
};

const filterTabs = [
    { key: '', label: 'Tất cả' },
    { key: 'open', label: 'Chờ phản hồi' },
    { key: 'in_progress', label: 'Đang xử lý' },
    { key: 'closed', label: 'Đã đóng' }
];

const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const CustomerSupport = () => {
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
    const [isOrderLoading, setIsOrderLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const socketRef = useRef(null);

    // Lấy danh sách conversations
    const fetchConversations = useCallback(async (status = '') => {
        try {
            setIsLoading(true);
            const res = await getAllConversationsAdminApi(status ? { status } : {});
            if (res.success) setConversations(res.data);
        } catch {
            message.error('Không thể tải danh sách hội thoại');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mở một conversation
    const openConversation = useCallback(async (conv) => {
        setActiveConv(conv);
        try {
            const res = await getConversationDetailAdminApi(conv._id);
            if (res.success) {
                setMessages(res.data.messages || []);
                // Đánh dấu đã đọc
                await markReadByAdminApi(conv._id);
                setConversations(prev =>
                    prev.map(c => c._id === conv._id ? { ...c, unreadByAdmin: 0 } : c)
                );
            }
        } catch {
            message.error('Không thể tải tin nhắn');
        }

        // Join socket room
        if (socketRef.current) {
            socketRef.current.emit('join_conversation', conv._id);
        }
    }, []);

    // Kết nối socket
    useEffect(() => {
        const socket = connectSupportSocket();
        socketRef.current = socket;

        // Admin join admin_room để nhận tất cả notifications
        socket.on('connect', () => {
            socket.emit('admin_join');
        });
        if (socket.connected) {
            socket.emit('admin_join');
        }

        socket.on('new_message', ({ conversationId, message: msg }) => {
            // Cập nhật messages nếu đang xem conversation đó
            setActiveConv(prev => {
                if (prev?._id === conversationId) {
                    setMessages(prevMsgs => [...prevMsgs, msg]);
                }
                return prev;
            });

            // Cập nhật danh sách
            setConversations(prev =>
                prev.map(c => {
                    if (c._id !== conversationId) return c;
                    return {
                        ...c,
                        lastMessageAt: msg.createdAt,
                        unreadByAdmin: msg.sender === 'customer' ? (c.unreadByAdmin || 0) + 1 : c.unreadByAdmin
                    };
                }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        });

        socket.on('conversation_closed', ({ conversationId }) => {
            setConversations(prev =>
                prev.map(c => c._id === conversationId ? { ...c, status: 'closed' } : c)
            );
            setActiveConv(prev => prev?._id === conversationId ? { ...prev, status: 'closed' } : prev);
        });

        return () => {
            socket.off('connect');
            socket.off('new_message');
            socket.off('conversation_closed');
        };
    }, []);

    useEffect(() => {
        fetchConversations(activeTab);
    }, [fetchConversations, activeTab]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !activeConv || activeConv.status === 'closed' || !hasPerm('support_reply')) return;
        const content = inputText.trim();
        setInputText('');
        setIsSending(true);

        socketRef.current?.emit('send_message', {
            conversationId: activeConv._id,
            sender: 'admin',
            content
        });

        setIsSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClose = async (convId) => {
        try {
            await closeConversationApi(convId);
            message.success('Đã đóng hội thoại');
            setConversations(prev =>
                prev.map(c => c._id === convId ? { ...c, status: 'closed' } : c)
            );
            setActiveConv(prev => prev?._id === convId ? { ...prev, status: 'closed' } : prev);
        } catch {
            message.error('Không thể đóng hội thoại');
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            setIsOrderLoading(true);
            const res = await getOrderById(orderId);
            if (res.success) {
                setViewingOrder(res.data);
                setIsOrderModalVisible(true);
            }
        } catch {
            message.error('Không thể tải thông tin đơn hàng');
        } finally {
            setIsOrderLoading(false);
        }
    };

    const formatMoney = (val) =>
        val != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

    const STATUS_CONFIG = {
        pending_payment: { color: 'orange',  label: 'Chờ thanh toán' },
        paid:            { color: 'cyan',    label: 'Đã thanh toán' },
        processing:      { color: 'blue',    label: 'Đang xử lý' },
        shipped:         { color: 'purple',  label: 'Đang giao' },
        delivered:       { color: 'green',   label: 'Đã giao' },
        cancelled:       { color: 'red',     label: 'Đã hủy' },
        returned:        { color: 'volcano', label: 'Hoàn trả' },
    };

    const PAYMENT_CONFIG = {
        vnpay:         { color: 'blue',    label: 'VNPAY' },
        momo:          { color: 'purple',  label: 'MoMo' },
        cod:           { color: 'default', label: 'COD' },
        bank_transfer: { color: 'geekblue', label: 'Chuyển khoản' },
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>
            {/* Page Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface flex items-center gap-2">
                        Chăm sóc Khách hàng
                        {totalUnread > 0 && (
                            <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                                {totalUnread} mới
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-0.5">Quản lý và phản hồi tin nhắn từ khách hàng</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-outline-variant/10 bg-surface-container-lowest">
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === tab.key
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-on-surface-variant hover:text-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden" style={{ minHeight: '500px' }}>
                {/* Sidebar: Conversation List */}
                <div className="w-80 border-r border-outline-variant/10 flex flex-col flex-shrink-0 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <span className="material-symbols-outlined text-4xl text-outline mb-3">inbox</span>
                            <p className="text-sm text-on-surface-variant">Không có hội thoại nào.</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv._id}
                                onClick={() => openConversation(conv)}
                                className={`w-full text-left px-4 py-3.5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${
                                    activeConv?._id === conv._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[14px]">person</span>
                                        </div>
                                        <p className="font-semibold text-sm text-on-surface line-clamp-1">
                                            {conv.customerName || conv.customerId?.fullName || 'Khách hàng'}
                                        </p>
                                    </div>
                                    {conv.unreadByAdmin > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                                            {conv.unreadByAdmin}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-on-surface-variant mb-1.5 ml-9 line-clamp-1">
                                    {conv.subject || 'Hỗ trợ'}
                                    {conv.orderCode && ` • ${conv.orderCode}`}
                                </p>
                                <div className="flex items-center justify-between ml-9">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[conv.status]}`}>
                                        {statusLabel[conv.status]}
                                    </span>
                                    <span className="text-[10px] text-outline">{formatTime(conv.lastMessageAt)}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Chat Panel */}
                <div className="flex-1 flex flex-col">
                    {activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-5 py-3.5 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-on-surface">
                                            {activeConv.customerName || 'Khách hàng'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-on-surface-variant line-clamp-1">
                                                {activeConv.subject}
                                                {activeConv.orderCode && ` • Đơn: ${activeConv.orderCode}`}
                                            </p>
                                            {activeConv.orderId && (
                                                <button 
                                                    onClick={() => handleViewOrder(activeConv.orderId)}
                                                    disabled={isOrderLoading}
                                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                                >
                                                    {isOrderLoading ? <span className="material-symbols-outlined animate-spin text-[12px]">sync</span> : null}
                                                    [XEM ĐƠN]
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[activeConv.status]}`}>
                                        {statusLabel[activeConv.status]}
                                    </span>
                                    {activeConv.status !== 'closed' && hasPerm('support_reply') && (
                                        <button
                                            onClick={() => handleClose(activeConv._id)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-error hover:border-error/30 transition-colors"
                                        >
                                            Đóng hội thoại
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div 
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#faf8f5]"
                            >
                                {messages.length === 0 && (
                                    <div className="text-center py-8 text-on-surface-variant text-sm">
                                        <span className="material-symbols-outlined text-3xl mb-2 block text-outline">chat_bubble_outline</span>
                                        Chưa có tin nhắn nào. Khách hàng sẽ liên hệ sớm.
                                    </div>
                                )}
                                {messages.map((msg, idx) => {
                                    const isAdmin = msg.sender === 'admin';
                                    return (
                                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            {!isAdmin && (
                                                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center mr-2 shrink-0 mt-1">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-[14px]">person</span>
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                    isAdmin
                                                        ? 'bg-primary text-white rounded-br-sm'
                                                        : 'bg-white text-on-surface rounded-bl-sm border border-outline-variant/10'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/70 text-right' : 'text-outline text-left'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-outline-variant/10 bg-white">
                                {activeConv.status === 'closed' ? (
                                    <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Hội thoại đã đóng. Không thể gửi thêm tin nhắn.
                                    </div>
                                ) : !hasPerm('support_reply') ? (
                                    <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
                                        <span className="material-symbols-outlined text-[18px]">block</span>
                                        Bạn không có quyền trả lời tin nhắn.
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-2">
                                        <textarea
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập phản hồi... (Enter để gửi)"
                                            rows={1}
                                            className="flex-1 resize-none bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all max-h-32 overflow-y-auto"
                                            style={{ lineHeight: '1.5' }}
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputText.trim() || isSending}
                                            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
                            </div>
                            <h3 className="font-notoSerif text-xl font-bold mb-2">Chọn hội thoại</h3>
                            <p className="text-sm text-on-surface-variant max-w-xs">
                                Chọn một hội thoại từ danh sách bên trái để bắt đầu phản hồi khách hàng.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Xem chi tiết đơn hàng */}
            <Modal
                title={
                    <p className="font-notoSerif font-bold text-lg">
                        Chi tiết đơn hàng {viewingOrder?.orderCode ? `#${viewingOrder.orderCode}` : ''}
                    </p>
                }
                open={isOrderModalVisible}
                onCancel={() => setIsOrderModalVisible(false)}
                footer={<button onClick={() => setIsOrderModalVisible(false)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Đóng</button>}
                width={600}
            >
                {viewingOrder && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Khách hàng">
                                <strong>{viewingOrder.buyerId?.fullName || viewingOrder.buyerName}</strong>
                                <div className="text-xs text-on-surface-variant">
                                    {viewingOrder.buyerId?.email} | {viewingOrder.buyerId?.phone || viewingOrder.buyerPhone}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUS_CONFIG[viewingOrder.status]?.color}>
                                    {STATUS_CONFIG[viewingOrder.status]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">
                                <Tag color={PAYMENT_CONFIG[viewingOrder.paymentMethod]?.color}>
                                    {PAYMENT_CONFIG[viewingOrder.paymentMethod]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng thanh toán">
                                <strong className="text-primary">{formatMoney(viewingOrder.totalAmount)}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <div>
                            <p className="font-bold text-xs uppercase tracking-wider mb-2 text-on-surface-variant">Sản phẩm</p>
                            <div className="space-y-2">
                                {viewingOrder.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-surface-container rounded-lg border border-outline-variant/5">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt="" className="w-10 h-12 object-cover rounded" />
                                        ) : (
                                            <div className="w-10 h-12 bg-surface-container-high rounded flex items-center justify-center text-outline">
                                                <span className="material-symbols-outlined text-xs">checkroom</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs text-on-surface line-clamp-1">{item.productId?.title}</p>
                                            <p className="text-[10px] text-on-surface-variant">SL: {item.quantity} · Giá: {formatMoney(item.priceAtSale)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CustomerSupport;
