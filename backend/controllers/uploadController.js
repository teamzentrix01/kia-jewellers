const cloudinary = require('../config/cloudinary');

const uploadMedia = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Please select an image or video.' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({ error: 'Cloudinary is not configured on the server.' });
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: process.env.CLOUDINARY_FOLDER || 'kia-fashions',
                resource_type: 'auto',
            }, (error, uploaded) => error ? reject(error) : resolve(uploaded));
            stream.end(req.file.buffer);
        });

        return res.status(201).json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            width: result.width,
            height: result.height,
        });
    } catch (error) {
        console.error('Cloudinary upload failed:', error.message);
        return res.status(502).json({ error: 'Cloudinary upload failed. Please try again.' });
    }
};

module.exports = { uploadMedia };
