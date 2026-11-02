const test = require('node:test');
const assert = require('node:assert');
const { escapeRegex } = require('./string.utils');

test('KIỂM TRA HÀM ESCAPE REGEX (BẢO MẬT CHUỖI)', async (t) => {

    await t.test('1. Phải trả về chuỗi rỗng nếu đầu vào là null, undefined hoặc không phải string', () => {
        assert.strictEqual(escapeRegex(null), '');
        assert.strictEqual(escapeRegex(undefined), '');
        assert.strictEqual(escapeRegex(12345), '');
    });

    await t.test('2. Phải giữ nguyên nếu chuỗi chỉ gồm chữ cái và số thông thường', () => {
        const input = 'AoThunVintage2026';
        assert.strictEqual(escapeRegex(input), 'AoThunVintage2026');
    });

    await t.test('3. Phải tự động thêm dấu gạch chéo \\ trước các ký tự đặc biệt nguy hiểm', () => {
        const dangerousInput = 'ao-thun (size L) [dep]* + $10?';
        const expectedOutput = 'ao-thun \\(size L\\) \\[dep\\]\\* \\+ \\$10\\?';
        assert.strictEqual(escapeRegex(dangerousInput), expectedOutput);
    });

});