import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import useScrollToTop from '../../hooks/useScrollToTop';
import {
    getMyConversationsApi,
    getConversationByIdApi,
    createConversationApi,
    markReadByCustomerApi,
    connectSupportSocket,
    disconnectSupportSocket
} from '../../services/client/support.service';

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

const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const ChatWithShop = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initConvId = searchParams.get('conversationId');

    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileShowChat, setIsMobileShowChat] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const socketRef = useRef(null);

    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId') || '';

    // Fetch danh sách conversations
    const fetchConversations = useCallback(async () => {
        try {
            const res = await getMyConversationsApi();
            if (res.success) setConversations(res.data);
        } catch {
            message.error('Không thể tải danh sách hội thoại');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Chọn và mở một conversation
    const openConversation = useCallback(async (conv) => {
        setActiveConv(conv);
        setIsMobileShowChat(true);

        try {
            const res = await getConversationByIdApi(conv._id);
            if (res.success) {
                setMessages(res.data.messages || []);
                // Đánh dấu đã đọc
                await markReadByCustomerApi(conv._id);
                // Cập nhật unread local
                setConversations(prev =>
                    prev.map(c => c._id === conv._id ? { ...c, unreadByCustomer: 0 } : c)
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

    // 1. Kết nối socket khi mount
    useEffect(() => {
        const socket = connectSupportSocket();
        socketRef.current = socket;

        socket.on('conversation_closed', ({ conversationId }) => {
            setConversations(prev =>
                prev.map(c => c._id === conversationId ? { ...c, status: 'closed' } : c)
            );
            // Cập nhật state nếu đang ở trong chính hội thoại vừa bị đóng
            setActiveConv(prev => prev?._id === conversationId ? { ...prev, status: 'closed' } : prev);
            if (activeConv?._id === conversationId) {
                message.info('Hội thoại này đã được đóng bởi admin.');
            }
        });

        return () => {
            socket.off('conversation_closed');
            disconnectSupportSocket();
        };
    }, []);

    // 2. Lắng nghe tin nhắn mới (phụ thuộc vào activeConv để cập nhật messages đúng cửa sổ)
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleNewMessage = ({ conversationId, message: msg }) => {
            if (activeConv?._id === conversationId) {
                setMessages(prev => [...prev, msg]);
            }
            // Cập nhật lastMessageAt và unread trong danh sách hội thoại bên trái
            setConversations(prev =>
                prev.map(c => {
                    if (c._id !== conversationId) return c;
                    return {
                        ...c,
                        lastMessageAt: msg.createdAt,
                        unreadByCustomer: (msg.sender === 'admin' && activeConv?._id !== conversationId) 
                            ? (c.unreadByCustomer || 0) + 1 
                            : c.unreadByCustomer
                    };
                }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [activeConv]);

    // Load conversations khi mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Mở conversation từ query param (từ OrderDetail redirect)
    useEffect(() => {
        if (initConvId && conversations.length > 0) {
            const conv = conversations.find(c => c._id === initConvId);
            if (conv) {
                openConversation(conv);
                // Sau khi mở xong thì xóa param trên URL để không bị dính chặt vào conv đó
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('conversationId');
                navigate({ search: newParams.toString() }, { replace: true });
            }
        }
    }, [initConvId, conversations.length, openConversation, navigate, searchParams]); // Chỉ phụ thuộc vào length và initConvId

    // Scroll to bottom khi messages thay đổi
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !activeConv || activeConv.status === 'closed') return;
        setIsSending(true);

        const content = inputText.trim();
        setInputText('');

        socketRef.current?.emit('send_message', {
            conversationId: activeConv._id,
            sender: 'customer',
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

    return (
        <main className="pt-24 pb-10 min-h-screen bg-[#fef9f7] font-manrope">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold text-sm mb-4 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        QUAY LẠI
                    </button>
                    <h1 className="font-notoSerif text-3xl font-bold tracking-tight">Chat với Shop</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Gửi tin nhắn trực tiếp để được hỗ trợ nhanh nhất.</p>
                </div>

                {/* Main Chat Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden flex" style={{ minHeight: '540px' }}>
                    {/* Sidebar: danh sách conversations */}
                    <div className={`w-full md:w-80 border-r border-outline-variant/20 flex flex-col flex-shrink-0 ${isMobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-outline-variant/10 bg-surface-container-lowest">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Hội thoại</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                    <span className="material-symbols-outlined text-4xl text-outline mb-3">chat_bubble</span>
                                    <p className="text-sm text-on-surface-variant">Chưa có hội thoại nào.</p>
                                    <p className="text-xs text-outline mt-1">Hãy gửi yêu cầu từ trang chi tiết đơn hàng.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <button
                                        key={conv._id}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full text-left px-4 py-3.5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${activeConv?._id === conv._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="font-semibold text-sm text-on-surface line-clamp-1 flex-1">
                                                {conv.subject || 'Hỗ trợ'}
                                            </p>
                                            {conv.unreadByCustomer > 0 && (
                                                <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                                                    {conv.unreadByCustomer}
                                                </span>
                                            )}
                                        </div>
                                        {conv.orderCode && (
                                            <p className="text-xs text-on-surface-variant mb-1">
                                                Đơn: <span className="font-medium">{conv.orderCode}</span>
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[conv.status]}`}>
                                                {statusLabel[conv.status]}
                                            </span>
                                            <span className="text-[10px] text-outline">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className={`flex-1 flex flex-col ${!isMobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                        {activeConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-5 py-4 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center gap-3">
                                    <button
                                        onClick={() => setIsMobileShowChat(false)}
                                        className="md:hidden flex items-center text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-on-surface line-clamp-1">{activeConv.subject}</p>
                                        {activeConv.orderCode && (
                                            <p className="text-xs text-on-surface-variant">Đơn hàng: {activeConv.orderCode}</p>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${statusColor[activeConv.status]}`}>
                                        {statusLabel[activeConv.status]}
                                    </span>
                                </div>

                                {/* Messages */}
                                <div 
                                    ref={messagesContainerRef}
                                    className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#faf8f5]"
                                >
                                    {messages.length === 0 && (
                                        <div className="text-center py-8 text-on-surface-variant text-sm">
                                            <span className="material-symbols-outlined text-3xl mb-2 block text-outline">waving_hand</span>
                                            Bắt đầu cuộc trò chuyện. Shop sẽ phản hồi trong thời gian sớm nhất!
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => {
                                        const isCustomer = msg.sender === 'customer';
                                        return (
                                            <div key={idx} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                                                {!isCustomer && (
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                                                        <span className="material-symbols-outlined text-primary text-[14px]">storefront</span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                        isCustomer
                                                            ? 'bg-primary text-white rounded-br-sm'
                                                            : 'bg-white text-on-surface rounded-bl-sm border border-outline-variant/10'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isCustomer ? 'text-white/70 text-right' : 'text-outline text-left'}`}>
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
                                            Hội thoại này đã được đóng.
                                        </div>
                                    ) : (
                                        <div className="flex items-end gap-2">
                                            <textarea
                                                value={inputText}
                                                onChange={e => setInputText(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Nhập tin nhắn... (Enter để gửi)"
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
                                    Chọn một hội thoại bên trái để xem tin nhắn, hoặc gửi yêu cầu từ trang chi tiết đơn hàng.
                                </p>
                                <button
                                    onClick={() => navigate('/history')}
                                    className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95"
                                >
                                    Xem lịch sử đơn hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ChatWithShop;
