const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const API_BASE = RAW_API_BASE.replace(/\/api\/?$/, "");

export function getStoredAuth() {
  if (typeof window === "undefined") {
    return { token: "", user: null };
  }

  const token = localStorage.getItem("token") || "";
  const savedUser = localStorage.getItem("user");

  try {
    const user = savedUser ? JSON.parse(savedUser) : null;
    return {
      token,
      user: user
        ? { ...user, role: (user.role || "user").toLowerCase() }
        : null,
    };
  } catch {
    localStorage.removeItem("user");
    return { token, user: null };
  }
}

export async function adminFetch(path, options = {}) {
  const { token } = getStoredAuth();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.error;
    throw new Error(message || "Request failed");
  }

  return data;
}

export function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function productPrice(product) {
  return Number(product?.discounted_price ?? product?.discountedPrice ?? product?.price ?? 0);
}

export function productOriginalPrice(product) {
  return Number(product?.original_price ?? product?.originalPrice ?? 0);
}

export function productStock(product) {
  return product?.in_stock ?? product?.inStock ?? true;
}

export function productImage(product) {
  return product?.image_url || product?.images?.[0] || "";
}
