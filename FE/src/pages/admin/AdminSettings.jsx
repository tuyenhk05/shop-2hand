import React from 'react';
import ChangePassword from '../../components/admin/ChangePassword';

const AdminSettings = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="font-notoSerif text-3xl font-bold text-on-surface">Cài đặt tài khoản</h2>
                <p className="text-on-surface-variant mt-2">Quản lý bảo mật và các thiết lập cá nhân của quản trị viên.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Password Section */}
                <div>
                    <ChangePassword />
                </div>

                {/* Other Settings Placeholder */}
                <div className="space-y-6">
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
