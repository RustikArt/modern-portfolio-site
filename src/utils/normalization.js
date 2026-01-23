/**
 * Data Normalization Utilities
 * Converts between frontend (camelCase) and backend (snake_case) formats
 * 
 * Rule:
 * - Frontend state: camelCase (promoPrice, isFeatured, customerId)
 * - Supabase/Backend: snake_case (promo_price, is_featured, customer_id)
 * - Conversion happens at fetch boundaries only
 */

// ==================== PRODUCTS ====================

/**
 * Convert database product to frontend format
 */
export const normalizeProductFromDB = (dbProduct) => {
    if (!dbProduct) return null;
    
    return {
        ...dbProduct,
        promoPrice: dbProduct.promo_price ?? null,
        isFeatured: dbProduct.is_featured ?? false,
        tags: Array.isArray(dbProduct.tags) ? dbProduct.tags : [],
    };
};

/**
 * Convert frontend product to database format
 */
export const normalizeProductToDB = (product) => {
    if (!product) return null;
    
    const dbProduct = {
        ...product,
        promo_price: product.promoPrice ?? null,
        is_featured: product.isFeatured ?? false,
        tags: Array.isArray(product.tags) ? product.tags : [],
    };
    
    delete dbProduct.promoPrice;
    delete dbProduct.isFeatured;
    
    return dbProduct;
};

export const normalizeProductsFromDB = (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(normalizeProductFromDB);
};

// ==================== ORDERS ====================

export const normalizeOrderFromDB = (dbOrder) => {
    if (!dbOrder) return null;
    
    return {
        ...dbOrder,
        userId: dbOrder.user_id ?? null,
        customerName: dbOrder.customer_name ?? 'Unknown',
        paymentId: dbOrder.payment_id ?? null,
        items: Array.isArray(dbOrder.items) ? dbOrder.items : [],
        checklist: Array.isArray(dbOrder.checklist) ? dbOrder.checklist : [],
        shipping: typeof dbOrder.shipping === 'string' ? JSON.parse(dbOrder.shipping) : dbOrder.shipping,
    };
};

export const normalizeOrderToDB = (order) => {
    if (!order) return null;
    
    const dbOrder = {
        ...order,
        user_id: order.userId ?? null,
        customer_name: order.customerName ?? 'Unknown',
        payment_id: order.paymentId ?? null,
        items: Array.isArray(order.items) ? order.items : [],
        checklist: Array.isArray(order.checklist) ? order.checklist : [],
        shipping: typeof order.shipping === 'object' ? JSON.stringify(order.shipping) : order.shipping,
    };
    
    delete dbOrder.userId;
    delete dbOrder.customerName;
    delete dbOrder.paymentId;
    
    return dbOrder;
};

export const normalizeOrdersFromDB = (orders) => {
    if (!Array.isArray(orders)) return [];
    return orders.map(normalizeOrderFromDB);
};

// ==================== SAFE PARSING ====================

export const safeJsonParse = (value, defaultValue = null) => {
    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
        console.warn('Failed to parse JSON:', value, e);
        return defaultValue;
    }
};

export const safeJsonStringify = (value, defaultValue = '{}') => {
    try {
        return typeof value === 'string' ? value : JSON.stringify(value);
    } catch (e) {
        console.warn('Failed to stringify:', value, e);
        return defaultValue;
    }
};
