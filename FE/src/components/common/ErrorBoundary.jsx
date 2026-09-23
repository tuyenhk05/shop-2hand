import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] text-[#1a1c19] font-sans">
                    <div className="bg-white border border-[#e2e8f0] p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-2xl">
                            !
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-[#1a1c19]">Đã xảy ra sự cố hiển thị</h2>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Một thành phần giao diện gặp lỗi không mong muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-5 py-2.5 bg-[#4c6545] text-white font-semibold rounded-xl hover:opacity-90 transition-all active:scale-95 text-sm"
                            >
                                Tải lại trang
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-sm"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
