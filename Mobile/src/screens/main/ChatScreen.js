import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
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
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null);
    const scrollViewRef = useRef(null);

    const userId = useSelector((state) => state.auth.userId);

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
                    Alert.alert('Thông báo', 'Hội thoại này đã được đóng bởi admin.');
                }
            });

            return () => {
                socket.off('conversation_closed');
                disconnectSupportSocket();
            };
        }
    }, [isFocused]);

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
        return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
                <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
                <View>
                    <Text style={styles.headerTitle}>Hỗ trợ & Chat</Text>
                    <Text style={styles.headerSubtitle}>Trao đổi trực tiếp cùng đội ngũ Atelier</Text>
                </View>
            </View>

            {activeConv ? (
                <View style={styles.chatArea}>
                    <View style={styles.chatHeader}>
                        <IconButton icon="arrow-left" size={20} onPress={() => setActiveConv(null)} />
                        <View style={styles.chatHeaderInfo}>
                            <Text style={styles.activeSubject} numberOfLines={1}>{activeConv.subject || 'Trò chuyện hỗ trợ'}</Text>
                            {activeConv.orderCode && (
                                <Text style={styles.activeSubtitle}>Đơn hàng: {activeConv.orderCode}</Text>
                            )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor[activeConv.status] }]}>
                            <Text style={[styles.statusText, { color: textStatusColor[activeConv.status] }]}>{statusLabel[activeConv.status]}</Text>
                        </View>
                    </View>

                    <ScrollView 
                        ref={scrollViewRef} 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={styles.messagesContainer}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyMessages}>
                                <Text style={styles.emptyText}>Chưa có tin nhắn nào. Gửi tin nhắn đầu tiên để bắt đầu.</Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.sender === 'customer';
                                return (
                                    <View key={index} style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
                                        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                                            <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>{msg.content}</Text>
                                            <Text style={[styles.msgTime, isMe ? styles.myTime : styles.otherTime]}>{formatTime(msg.createdAt)}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {activeConv.status !== 'closed' ? (
                        <View style={styles.inputArea}>
                            <TextInput 
                                placeholder="Nhập tin nhắn..."
                                value={inputText}
                                onChangeText={setInputText}
                                style={styles.textInput}
                                placeholderTextColor="#94a3b8"
                            />
                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!inputText.trim() || isSending}>
                                <IconButton icon="send" size={18} iconColor="#fff" style={styles.sendIcon} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.closedArea}>
                            <Text style={styles.closedText}>Hội thoại này đã được đóng bởi Admin</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.listArea}>
                    {conversations.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>Chưa có hội thoại nào được tạo.</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {conversations.map((conv) => (
                                <TouchableOpacity 
                                    key={conv._id} 
                                    style={styles.convCard}
                                    onPress={() => openConversation(conv)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.convHeader}>
                                        <Text style={styles.convSubject} numberOfLines={1}>{conv.subject || 'Trò chuyện hỗ trợ'}</Text>
                                        {conv.unreadByCustomer > 0 && (
                                            <View style={styles.unreadBadge}>
                                                <Text style={styles.unreadText}>{conv.unreadByCustomer}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.convFooter}>
                                        <View style={[styles.statusBadge, { backgroundColor: statusColor[conv.status] }]}>
                                            <Text style={[styles.statusText, { color: textStatusColor[conv.status] }]}>{statusLabel[conv.status]}</Text>
                                        </View>
                                        <Text style={styles.convTime}>{formatTime(conv.lastMessageAt)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
        padding: 24,
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
    },
    convCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    convHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    convSubject: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
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
    convFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    convTime: {
        fontSize: 11,
        color: '#94a3b8',
    },
    chatArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fafafa',
    },
    chatHeaderInfo: {
        flex: 1,
        marginLeft: 4,
    },
    activeSubject: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    activeSubtitle: {
        fontSize: 11,
        color: '#64748b',
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    emptyMessages: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    myRow: {
        justifyContent: 'flex-end',
    },
    otherRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    myBubble: {
        backgroundColor: '#4c6545',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#f1f5f9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    myText: {
        color: '#fff',
    },
    otherText: {
        color: '#1e293b',
    },
    msgTime: {
        fontSize: 10,
        marginTop: 4,
    },
    myTime: {
        color: '#e2e8f0',
        textAlign: 'right',
    },
    otherTime: {
        color: '#94a3b8',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1e293b',
        maxHeight: 100,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4c6545',
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        margin: 0,
    },
    closedArea: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    closedText: {
        fontSize: 13,
        color: '#64748b',
        fontStyle: 'italic',
    }
});

export default ChatScreen;
