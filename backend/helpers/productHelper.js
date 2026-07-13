const formatProduct = (row) => {
    if (!row) return null;

    let parsedImages = [];
    try {
        if (typeof row.images === 'string') {
            parsedImages = JSON.parse(row.images);
        } else if (Array.isArray(row.images)) {
            parsedImages = row.images;
        }
    } catch {
        parsedImages = [];
    }

    const oPrice = parseFloat(row.original_price) || 0;
    const dPrice = parseFloat(row.discounted_price) || 0;

    return {
        id: row.id,
        name: row.name || 'Unnamed Product',
        category: (row.category || '').toLowerCase(),

        // snake_case fields used by the backend
        sub_category: row.sub_category || 'general',
        original_price: oPrice,
        discounted_price: dPrice,
        in_stock: row.in_stock ?? true,

        // camelCase fields used by the frontend
        subCategory: row.sub_category || 'general',
        originalPrice: oPrice,
        discountedPrice: dPrice > 0 ? dPrice : oPrice,
        inStock: row.in_stock ?? true,

        price: dPrice > 0 ? dPrice : oPrice,
        images: parsedImages,
        image_url: parsedImages[0] || '/placeholder.jpg',
        discount: oPrice > 0 ? Math.round(((oPrice - dPrice) / oPrice) * 100) : 0,
        fabric: row.fabric || 'Premium Fabric',
        rating: parseFloat(row.rating) || 4.5,
        short_description: row.short_description || '',
        full_description: row.full_description || '',
        reviewer_name: row.reviewer_name || '',
        reviewer_rating: row.reviewer_rating || 4.2,
        reviewer_review: row.reviewer_review || '',
        created_at: row.created_at,
    };
};

const slugify = (text) =>
    text ? text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '') : 'general';

module.exports = { formatProduct, slugify };
