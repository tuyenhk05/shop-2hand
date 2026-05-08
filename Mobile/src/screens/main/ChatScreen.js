import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
    getMyConversationsApi,
    getConversationByIdApi,
    markReadByCustomerApi,
    connectSupportSocket,
    disconnectSupportSocket
} from '../../services/client/support.service';
import { useToast } from '../../context/ToastContext';

const statusLabel = {
    open: 'Chờ phản hồi',
    in_progress: 'Đang xử lý',
    closed: 'Đã đóng'
};

const statusColor = {
    open: '#fef3c7',
    in_progress: '#dbeafe',
    closed: '#f1f5f9'
};

const textStatusColor = {
    open: '#d97706',
    in_progress: '#2563eb',
    closed: '#64748b'
};

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { showToast } = useToast();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null);
    const scrollViewRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await getMyConversationsApi();
            if (res.success) setConversations(res.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách hội thoại:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const openConversation = useCallback(async (conv) => {
        setActiveConv(conv);
        try {
            const res = await getConversationByIdApi(conv._id);
            if (res.success) {
                setMessages(res.data?.messages || []);
                await markReadByCustomerApi(conv._id);
                setConversations(prev =>
                    prev.map(c => c._id === conv._id ? { ...c, unreadByCustomer: 0 } : c)
                );
            }
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
        }

        if (socketRef.current) {
            socketRef.current.emit('join_conversation', conv._id);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            const socket = connectSupportSocket();
            socketRef.current = socket;

            socket.on('conversation_closed', ({ conversationId }) => {
                setConversations(prev =>
                    prev.map(c => c._id === conversationId ? { ...c, status: 'closed' } : c)
                );
                setActiveConv(prev => prev?._id === conversationId ? { ...prev, status: 'closed' } : prev);
                if (activeConv?._id === conversationId) {
                    showToast('Hội thoại này đã được đóng bởi admin.', 'info');
                }
            });

            const targetConvId = route.params?.conversationId;
            if (targetConvId) {
                const target = conversations.find(c => c._id === targetConvId);
                if (target) openConversation(target);
                else {
                    fetchConversations();
                }
            }

            return () => {
                socket.off('conversation_closed');
                disconnectSupportSocket();
            };
        }
    }, [isFocused, route.params?.conversationId]);

    useEffect(() => {
        if (route.params?.conversationId && conversations.length > 0 && !activeConv) {
            const target = conversations.find(c => c._id === route.params.conversationId);
            if (target) openConversation(target);
        }
    }, [conversations, route.params?.conversationId]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleNewMessage = ({ conversationId, message: msg }) => {
            if (activeConv?._id === conversationId) {
                setMessages(prev => [...prev, msg]);
            }
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

    useEffect(() => {
        if (isFocused) {
            fetchConversations();
        }
    }, [isFocused, fetchConversations]);

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

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4c6545" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    iconColor="#1e293b" 
                    onPress={() => activeConv ? setActiveConv(null) : navigation.goBack()} 
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{activeConv ? 'Hỗ trợ trực tuyến' : 'Tin nhắn hỗ trợ'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {activeConv ? (activeConv.orderCode ? `Đơn hàng: ${activeConv.orderCode}` : 'Atelier Concierge') : 'Trao đổi cùng đội ngũ Atelier'}
                    </Text>
                </View>
                {!activeConv && (
                    <IconButton icon="plus" size={24} iconColor="#4c6545" onPress={() => showToast('Vui lòng tạo yêu cầu hỗ trợ từ đơn hàng cụ thể.', 'info')} />
                )}
            </View>

            {activeConv ? (
                <View style={styles.chatArea}>
                    <View style={[styles.statusRibbon, { backgroundColor: statusColor[activeConv.status] }]}>
                        <Text style={[styles.statusRibbonText, { color: textStatusColor[activeConv.status] }]}>
                            Trạng thái: {statusLabel[activeConv.status]}
                        </Text>
                    </View>

                    <ScrollView 
                        ref={scrollViewRef} 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={styles.messagesContainer}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyMessages}>
                                <View style={styles.infoCircle}>
                                    <IconButton icon="chat-outline" size={40} iconColor="#4c6545" />
                                </View>
                                <Text style={styles.emptyText}>Bắt đầu cuộc hội thoại bằng cách gửi tin nhắn cho chúng tôi.</Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.sender === 'customer';
                                const showTime = index === 0 || 
                                    new Date(msg.createdAt) - new Date(messages[index-1].createdAt) > 300000;

                                return (
                                    <View key={index}>
                                        {showTime && (
                                            <Text style={styles.timeDivider}>{formatTime(msg.createdAt)}</Text>
                                        )}
                                        <View style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
                                            <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                                                <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>{msg.content}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {activeConv.status !== 'closed' ? (
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputArea}>
                                <TextInput 
                                    placeholder="Viết tin nhắn..."
                                    value={inputText}
                                    onChangeText={setInputText}
                                    style={styles.textInput}
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                />
                                <TouchableOpacity 
                                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                                    onPress={handleSend} 
                                    disabled={!inputText.trim() || isSending}
                                >
                                    {isSending ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <IconButton icon="send" size={20} iconColor="#fff" style={styles.sendIcon} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.closedArea}>
                            <IconButton icon="lock-outline" size={20} iconColor="#64748b" />
                            <Text style={styles.closedText}>Cuộc hội thoại này đã kết thúc</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.listArea}>
                    {conversations.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <IconButton icon="message-off-outline" size={60} iconColor="#e2e8f0" />
                            <Text style={styles.emptyText}>Hộp thư hỗ trợ trống</Text>
                            <Text style={styles.emptySubtext}>Bạn có thể tạo yêu cầu hỗ trợ từ trang chi tiết đơn hàng.</Text>
                            <Button 
                                mode="outlined" 
                                onPress={() => navigation.navigate('OrderHistory')}
                                style={styles.historyBtn}
                                textColor="#4c6545"
                            >
                                ĐI TỚI ĐƠN HÀNG
                            </Button>
                        </View>
                    ) : (
                        <FlatList
                            data={conversations}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.scrollContent}
                            renderItem={({ item: conv }) => (
                                <TouchableOpacity 
                                    style={styles.convCard}
                                    onPress={() => openConversation(conv)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {conv.subject ? conv.subject.charAt(0).toUpperCase() : 'A'}
                                        </Text>
                                        {conv.unreadByCustomer > 0 && <View style={styles.onlineDot} />}
                                    </View>
                                    <View style={styles.convInfo}>
                                        <View style={styles.convHeaderRow}>
                                            <Text style={styles.convSubject} numberOfLines={1}>{conv.subject || 'Hỗ trợ Atelier'}</Text>
                                            <Text style={styles.convTime}>{formatTime(conv.lastMessageAt)}</Text>
                                        </View>
                                        <View style={styles.convFooterRow}>
                                            <Text style={styles.convStatus} numberOfLines={1}>
                                                Trạng thái: {statusLabel[conv.status]}
                                            </Text>
                                            {conv.unreadByCustomer > 0 && (
                                                <View style={styles.unreadBadge}>
                                                    <Text style={styles.unreadText}>{conv.unreadByCustomer}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef9f7',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fef9f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    listArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    convCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4c6545',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4c6545',
        borderWidth: 2,
        borderColor: '#fff',
    },
    convInfo: {
        flex: 1,
        marginLeft: 16,
    },
    convHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    convSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    convTime: {
        fontSize: 11,
        color: '#94a3b8',
    },
    convFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    convStatus: {
        fontSize: 12,
        color: '#64748b',
    },
    unreadBadge: {
        backgroundColor: '#4c6545',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    historyBtn: {
        marginTop: 24,
        borderRadius: 12,
    },
    chatArea: {
        flex: 1,
    },
    statusRibbon: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    statusRibbonText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    messagesContainer: {
        padding: 20,
    },
    timeDivider: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'center',
        marginVertical: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    myRow: {
        justifyContent: 'flex-end',
    },
    otherRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: '#4c6545',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myText: {
        color: '#fff',
    },
    otherText: {
        color: '#1e293b',
    },
    inputWrapper: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        maxHeight: 120,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4c6545',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        marginLeft: 8,
    },
    sendBtnDisabled: {
        backgroundColor: '#cbd5e1',
    },
    sendIcon: {
        margin: 0,
    },
    closedArea: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    closedText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
    }
});

export default ChatScreen;
