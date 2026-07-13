const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
};

// ─── Cart ───────────────────────────────────────────
export const cartApi = {
    get: () => fetch(`${BASE_URL}/cart`, { headers: authHeaders() }).then(handleResponse),
    add: (product_id, quantity = 1) =>
        fetch(`${BASE_URL}/cart`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ product_id, quantity }),
        }).then(handleResponse),
    update: (cartId, quantity) =>
        fetch(`${BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ quantity }),
        }).then(handleResponse),
    remove: (cartId) =>
        fetch(`${BASE_URL}/cart/${cartId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }).then(handleResponse),
    clear: () =>
        fetch(`${BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: authHeaders(),
        }).then(handleResponse),
};

// ─── User ────────────────────────────────────────────
export const userApi = {
    getProfile: () => fetch(`${BASE_URL}/user/profile`, { headers: authHeaders() }).then(handleResponse),
    updateProfile: (data) =>
        fetch(`${BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    getOrders: () => fetch(`${BASE_URL}/orders/my`, { headers: authHeaders() }).then(handleResponse),
};

// ─── Wishlist ────────────────────────────────────────
export const wishlistApi = {
    get: () => fetch(`${BASE_URL}/user/wishlist`, { headers: authHeaders() }).then(handleResponse),
    toggle: (product_id) =>
        fetch(`${BASE_URL}/user/wishlist`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ product_id }),
        }).then(handleResponse),
    remove: (id) =>
        fetch(`${BASE_URL}/user/wishlist/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }).then(handleResponse),
};

// ─── Addresses ───────────────────────────────────────
export const addressApi = {
    get: () => fetch(`${BASE_URL}/user/addresses`, { headers: authHeaders() }).then(handleResponse),
    add: (data) =>
        fetch(`${BASE_URL}/user/addresses`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    update: (id, data) =>
        fetch(`${BASE_URL}/user/addresses/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    delete: (id) =>
        fetch(`${BASE_URL}/user/addresses/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }).then(handleResponse),
};

export const orderApi = {
    place: (data) =>
        fetch(`${BASE_URL}/orders/place`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
};
