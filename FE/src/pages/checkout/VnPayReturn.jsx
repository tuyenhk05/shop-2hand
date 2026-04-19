import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../../untils/request';
import Loading from '../../components/loading/loading';

const VnPayReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán từ VNPAY...');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Convert searchParams to an object
                const params = Object.fromEntries([...searchParams]);
                
                // Call verification API
                const res = await post('/payment/verify', params);

                if (res && res.success) {
                    setStatus('success');
                    setMessage(res.message || 'Thanh toán đơn hàng thành công!');
                } else {
                    setStatus('fail');
                    setMessage(res?.message || 'Giao dịch thanh toán thất bại hoặc bị hủy.');
                }
            } catch (error) {
                console.error('Verify payment error:', error);
                setStatus('fail');
                setMessage('Có lỗi xảy ra khi xác thực thanh toán với máy chủ.');
            }
        };

        if ([...searchParams].length > 0) {
            verifyPayment();
        } else {
            setStatus('fail');
            setMessage('Không tìm thấy thông số thanh toán trả về hợp lệ.');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface py-20 px-4 font-manrope">
            {status === 'processing' ? (
                <Loading fullScreen={false} text={message} />
            ) : (
                <div className="bg-surface-container-lowest border border-outline-variant p-10 rounded-2xl shadow-sm text-center max-w-lg w-full">
                    {status === 'success' ? (
                        <>
                            <span className="material-symbols-outlined text-[80px] text-primary mb-4 block animate-bounce">check_circle</span>
                            <h2 className="text-3xl font-bold font-notoSerif mb-3 text-on-surface">Cảm ơn bạn!</h2>
                            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">{message}<br/>Đơn hàng của bạn đang được chuẩn bị để giao đi.</p>
                            <button 
                                onClick={() => navigate('/history')}
                                className="w-full bg-primary text-on-primary px-6 py-4 rounded-xl font-bold hover:bg-primary-container hover:shadow-md transition-all active:scale-95">
                                Xem chi tiết đơn hàng
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[80px] text-error mb-4 block">cancel</span>
                            <h2 className="text-3xl font-bold font-notoSerif mb-3 text-error">Rất tiếc!</h2>
                            <p className="text-error mb-8 text-sm leading-relaxed">{message}</p>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-primary text-on-primary px-6 py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95">
                                    Thử thanh toán lại
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full bg-surface-variant text-on-surface-variant px-6 py-4 rounded-xl font-bold hover:brightness-95 transition-all active:scale-95">
                                    Quay về trang chủ
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default VnPayReturn;
