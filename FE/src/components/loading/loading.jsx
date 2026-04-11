import React from 'react';

const Loading = ({ fullScreen = true, text = "Atelier đang tải..." }) => {
    // Nếu fullScreen = true: Phủ toàn bộ màn hình, làm mờ nhẹ phần nền bên dưới
    // Nếu fullScreen = false: Hiển thị gọn trong vùng chứa của nó
    const containerClasses = fullScreen
        ? "fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
        : "w-full h-full min-h-[300px] bg-slate-50/50 flex flex-col items-center justify-center rounded-3xl";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-5">

                {/* Vòng xoay (Spinner) tối giản */}
                <div className="relative w-12 h-12">
                    {/* Vòng mờ làm nền */}
                    <div className="absolute inset-0 border-4 border-[#728C69]/10 rounded-full"></div>
                    {/* Vòng xoay chính */}
                    <div className="absolute inset-0 border-4 border-[#728C69] border-t-transparent rounded-full animate-spin"></div>
                </div>

                {/* Dòng text hiển thị */}
                {text && (
                    <p className="text-xs font-bold uppercase tracking-widest text-[#728C69] animate-pulse">
                        {text}
                    </p>
                )}

            </div>
        </div>
    );
};

export default Loading;