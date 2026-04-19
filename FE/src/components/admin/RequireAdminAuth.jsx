import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';

const RequireAdminAuth = () => {
    const { isLogin, role } = useSelector((state) => state.auth);

    const isAdmin = role && role.permissions && (role.permissions.includes('all') || role.permissions.length > 0);

    useEffect(() => {
        if (!isLogin) {
            message.warning('Vui lòng đăng nhập để truy cập trang quản trị');
        } else if (!isAdmin) {
            message.error('Truy cập bị từ chối. Bạn không có quyền quản trị.');
        }
    }, [isLogin, isAdmin]);

    if (!isLogin) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RequireAdminAuth;
