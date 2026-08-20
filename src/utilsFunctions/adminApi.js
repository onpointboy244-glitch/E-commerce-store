import { auth } from "@/firebaseconfig";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function adminFetch(path, options = {}) {
  const token = await getToken();
  const mergedHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const res = await fetch(`${SERVER_URL}${path}`, {
      method: options.method,
      body: options.body,
      headers: mergedHeaders,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin request failed");
    return data;
  } catch (err) {
    // Network errors (server down, no connection) throw "Failed to fetch"
    if (err.message === "Failed to fetch") {
      throw new Error("Cannot connect to the server. Make sure the server is running.");
    }
    throw err;
  }
}

export async function addProduct(product) {
  return adminFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id, product) {
  return adminFetch(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id) {
  return adminFetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function deleteOrder(id) {
  return adminFetch(`/api/admin/orders/${id}`, {
    method: "DELETE",
  });
}
