import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Avatar, Card, Space, message } from 'antd';
import { SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '../../services/client/chat.service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logo from '../../assets/images/logo.png';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Dạ, Atelier chào bạn! ✨ Mình là trợ lý Gen Z của Atelier Archive đây. Bạn cần mình tư vấn size hay phối đồ gì không ạ? 👕👗' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7));
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Show hint bubble after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        if (showHint) setShowHint(false); // Hide hint forever once they interact
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Send full history but ensure we don't send anything that might break the flow
            // The BE will handle filtering to ensure alternating roles
            const response = await chatWithAI(inputValue, messages, sessionId);
            
            if (response.success) {
                setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: 'Hệ thống AI đang bận một chút, bạn thử lại sau nha! 😅' }]);
                message.error(response.message || 'Lỗi kết nối AI');
            }
        } catch (error) {
            message.error('Lỗi kết nối đến Atelier Chatbot 😅');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-manrope flex items-end justify-end">
            
            {/* Hint Bubble */}
            <AnimatePresence>
                {!isOpen && showHint && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="mr-4 mb-2 bg-white text-on-surface shadow-xl rounded-2xl p-3 border border-outline-variant/20 relative cursor-pointer"
                        style={{ maxWidth: '200px' }}
                        onClick={handleToggleChat}
                    >
                        <p className="m-0 text-sm font-medium leading-snug">
                            Cần tư vấn phối đồ hay tìm size? Nhắn ngay cho <span className="font-bold text-primary">Atelier Chatbot</span> nhé! ✨
                        </p>
                        {/* Triangle pointer */}
                        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent drop-shadow-md"></div>
                        
                        {/* Close Hint Button */}
                        <div 
                            className="absolute -top-2 -right-2 w-5 h-5 bg-surface-container-high hover:bg-error hover:text-white rounded-full flex items-center justify-center text-[10px] shadow-sm transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHint(false);
                            }}
                        >
                            <CloseOutlined />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer relative z-10"
                onClick={handleToggleChat}
            >
                {isOpen ? (
                    <div className="w-14 h-14 bg-error text-white rounded-full flex items-center justify-center shadow-2xl text-xl transition-colors">
                        <CloseOutlined />
                    </div>
                ) : (
                    <div className="w-14 h-14 rounded-full shadow-2xl border-2 border-primary bg-white flex items-center justify-center overflow-hidden p-1 transition-all hover:border-primary-fixed-variant">
                        <img src={logo} alt="Chatbot" className="w-full h-full object-contain rounded-full" />
                    </div>
                )}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[400px]"
                    >
                        <Card
                            className="shadow-2xl rounded-2xl overflow-hidden border-outline-variant/20"
                            styles={{ body: { padding: 0 } }}
                            title={
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center overflow-hidden p-0.5">
                                        <img src={logo} alt="Atelier" className="w-full h-full object-contain rounded-full" />
                                    </div>
                                    <div>
                                        <p className="m-0 text-sm font-bold leading-none text-on-surface">Atelier Chatbot</p>
                                        <p className="m-0 text-[10px] text-primary font-medium mt-1 italic">Trợ lý tư vấn thông minh</p>
                                    </div>
                                </div>
                            }
                        >
                            {/* Messages Area */}
                            <div className="h-[400px] overflow-y-auto p-4 bg-surface-container-lowest custom-scrollbar">
                                <div className="flex flex-col">
                                    {messages.map((item, index) => (
                                        <div key={index} className={`flex mb-4 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-2 max-w-[85%] ${item.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {item.role === 'user' ? (
                                                    <Avatar size="small" icon={<UserOutlined />} className="bg-primary text-white" />
                                                ) : (
                                                    <div className="w-7 h-7 flex-shrink-0 rounded-full border border-primary bg-white flex items-center justify-center overflow-hidden p-0.5 mt-1">
                                                        <img src={logo} alt="Atelier" className="w-full h-full object-contain rounded-full" />
                                                    </div>
                                                )}
                                                <div className={`p-3 rounded-2xl text-sm overflow-hidden ${
                                                    item.role === 'user' 
                                                        ? 'bg-primary text-on-primary rounded-tr-none' 
                                                        : 'bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/10'
                                                }`}>
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({node, ...props}) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-primary font-bold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                            img: ({node, ...props}) => <img className="w-full rounded-xl my-2 object-cover aspect-square border border-outline-variant/20" {...props} alt={props.alt || 'Sản phẩm'} />
                                                        }}
                                                    >
                                                        {item.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {isLoading && (
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-7 h-7 flex-shrink-0 rounded-full border border-primary bg-white flex items-center justify-center overflow-hidden p-0.5">
                                            <img src={logo} alt="Atelier" className="w-full h-full object-contain rounded-full" />
                                        </div>
                                        <div className="p-3 bg-surface-container-low rounded-2xl rounded-tl-none animate-pulse text-xs text-on-surface-variant italic">
                                            Atelier đang suy nghĩ... ✨
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-outline-variant/10">
                                <Space.Compact className="w-full">
                                    <Input
                                        placeholder="Hỏi Atelier bất cứ điều gì..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onPressEnter={handleSend}
                                        className="rounded-l-xl py-2"
                                        disabled={isLoading}
                                    />
                                    <Button 
                                        type="primary" 
                                        icon={<SendOutlined />} 
                                        onClick={handleSend}
                                        className="h-auto px-6 rounded-r-xl"
                                        loading={isLoading}
                                    />
                                </Space.Compact>
                                <p className="text-[10px] text-center text-on-surface-variant mt-2 mb-0">
                                    Tư vấn dựa trên AI · Kiểm tra kỹ mô tả trước khi mua ✨
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
