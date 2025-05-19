
import { toast } from "sonner";
import axios from "axios";

// Base URL for API
const API_URL = "http://localhost:5000/api";

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export type Product = {
  id: number;
  code: string;
  name: string;
  type: string;
  price: number;
  inDate: string;
  image: string;
  quantity?: number;
};

export type Customer = {
  id: number;
  firstName: string;
  phone: string;
  email: string;
  password: string;
  isAdmin?: boolean;
};

export type CartItem = {
  id: number;
  productId: number;
  productCode: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  image: string;
};

export type Purchase = {
  id: number;
  customerId: number;
  customerName: string;
  date: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
};

export type SalesReportItem = {
  id: number;
  date: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
};

// API Service
export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Save token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Invalid credentials");
      }
      throw new Error("Network error. Please try again later.");
    }
  },

  register: async (customerData: Omit<Customer, "id">) => {
    try {
      const response = await api.post("/auth/register", customerData);
      
      // Save token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Registration failed");
      }
      throw new Error("Network error. Please try again later.");
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return true;
  },

  getCurrentUser: () => {
    const userJSON = localStorage.getItem("user");
    return userJSON ? JSON.parse(userJSON) : null;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  getProduct: async (id: number): Promise<Product> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Product not found");
    }
  },

  createProduct: async (productData: Omit<Product, "id">): Promise<Product> => {
    try {
      const response = await api.post("/products", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  },

  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }
  },

  // Cart
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  },

  addToCart: async (product: Product, quantity: number): Promise<CartItem[]> => {
    try {
      const response = await api.post("/cart", {
        productId: product.id,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  },

  updateCartItem: async (id: number, quantity: number): Promise<CartItem[]> => {
    try {
      const response = await api.put(`/cart/${id}`, { quantity });
      return response.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  },

  removeCartItem: async (id: number): Promise<CartItem[]> => {
    try {
      const response = await api.delete(`/cart/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw new Error("Failed to remove cart item");
    }
  },

  clearCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.delete("/cart");
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  },

  // Purchases
  checkout: async (): Promise<Purchase> => {
    try {
      const response = await api.post("/purchases");
      return response.data;
    } catch (error) {
      console.error("Error checkout:", error);
      throw new Error("Checkout failed");
    }
  },

  getPurchases: async (): Promise<Purchase[]> => {
    try {
      const response = await api.get("/purchases");
      return response.data;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      throw new Error("Failed to fetch purchases");
    }
  },

  getPurchase: async (id: number): Promise<Purchase> => {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase:", error);
      throw new Error("Purchase not found");
    }
  },

  // Admin APIs
  getSalesReport: async (startDate?: Date, endDate?: Date): Promise<SalesReportItem[]> => {
    try {
      let url = "/admin/reports/sales";
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales report:", error);
      throw new Error("Failed to fetch sales report");
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get("/admin/customers");
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("Failed to fetch customers");
    }
  },
};
