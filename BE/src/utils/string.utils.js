/**
 * Tiện ích xử lý chuỗi và làm sạch biểu thức chính quy (Chống ReDoS)
 */
const escapeRegex = (string) => {
    if (!string || typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
    escapeRegex
};
