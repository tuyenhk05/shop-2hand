const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload buffer lên Cloudinary
 * @param {Buffer} buffer - Buffer ảnh
 * @param {string} folder - Tên thư mục trên Cloudinary
 * @returns {Promise<object>} - Kết quả upload (secure_url, public_id, ...)
 */
const uploadToCloudinary = (buffer, folder = 'shop-2hand/products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 1000, crop: 'limit' },
                    { quality: 'auto:good' },
                    { format: 'webp' }
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const readable = Readable.from(buffer);
        readable.pipe(uploadStream);
    });
};

/**
 * Xóa ảnh khỏi Cloudinary
 * @param {string} publicId - Public ID của ảnh
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
