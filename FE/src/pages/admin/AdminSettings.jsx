import React, { useState, useEffect } from 'react';
import ChangePassword from '../../components/admin/ChangePassword';
import { InputNumber, Button, message } from 'antd';
import { getAdminSettings, updateAdminSettings } from '../../services/admin/settings.service.jsx';

const AdminSettings = () => {
    const [rate, setRate] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchRate = async () => {
        try {
            const res = await getAdminSettings();
            if (res.success && res.data) {
                setRate(res.data.value);
            }
        } catch (error) {
            message.error('Lỗi khi tải thông tin chiết khấu');
        }
    };

    useEffect(() => {
        fetchRate();
    }, []);

    const handleSaveRate = async () => {
        if (rate === undefined || rate === null || rate < 0) {
            return message.warning('Vui lòng nhập phần trăm hợp lệ');
        }
        try {
            setLoading(true);
            const res = await updateAdminSettings({ value: rate });
            if (res.success) {
                message.success('Cập nhật chiết khấu ký gửi thành công!');
            } else {
                message.error(res.message || 'Lỗi khi cập nhật chiết khấu');
            }
        } catch (error) {
            message.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="font-notoSerif text-3xl font-bold text-on-surface">Cài đặt hệ thống</h2>
                <p className="text-on-surface-variant mt-2">Quản lý bảo mật, chiết khấu và các thiết lập cá nhân của quản trị viên.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Password Section */}
                <div>
                    <ChangePassword />
                </div>

                {/* Other Settings Placeholder */}
                <div className="space-y-6">
                    {/* Consignment Rate Setting Section */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm border-l-4 border-l-primary">
                        <h3 className="font-notoSerif text-xl font-bold text-on-surface mb-2">Chiết khấu Ký gửi</h3>
                        <p className="text-sm text-on-surface-variant mb-4">Điều chỉnh phần trăm chiết khấu đơn hàng ký gửi của shop. Phần trăm này sẽ được cộng thêm vào giá bán khi đưa sản phẩm lên kệ.</p>
                        <div className="flex items-center gap-3">
                            <InputNumber
                                min={0}
                                max={100}
                                value={rate}
                                onChange={(val) => setRate(val)}
                                formatter={(value) => `${value}%`}
                                parser={(value) => value.replace('%', '')}
                                className="w-32"
                                size="large"
                            />
                            <Button 
                                type="primary" 
                                loading={loading} 
                                onClick={handleSaveRate}
                                className="bg-primary hover:bg-primary-hover"
                                size="large"
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>

                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                        <h3 className="font-notoSerif text-xl font-bold text-on-surface mb-4">Thông tin cơ bản</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-outline-variant/5">
                                <span className="text-sm text-on-surface-variant font-medium">Ngôn ngữ hiển thị</span>
                                <span className="text-sm font-bold text-primary">Tiếng Việt</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-outline-variant/5">
                                <span className="text-sm text-on-surface-variant font-medium">Chế độ tối</span>
                                <span className="text-sm text-on-surface-variant italic">Chưa hỗ trợ</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-on-surface-variant font-medium">Phiên bản hệ thống</span>
                                <span className="text-sm text-on-surface-variant">v1.0.4-stable</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm border-l-4 border-l-tertiary">
                        <h3 className="font-notoSerif text-xl font-bold text-on-surface mb-2">Thông báo</h3>
                        <p className="text-sm text-on-surface-variant mb-4">Nhận thông báo về đơn hàng mới và yêu ký gửi qua email.</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-not-allowed opacity-50">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm font-semibold text-on-surface">Email Notifications</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
