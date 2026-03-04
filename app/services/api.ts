import RequestBuilder from "utils/request";
import type { CustomRequestOptions } from "utils/request/types";

import { APIError } from "../utils/error";

import { store } from "@/store";
import { LoginRequest, SignupRequest, AuthResponse } from "@/types/auth";
import { Inventory, InventoryResponse } from "@/types/inventory";
import { Notification } from "@/types/notification";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_API_BASE_URL;

const TokenInterceptor = (req: Request) => {
  if (typeof window === "undefined") return;
  const state = store.getState();
  const token = state.user.accessToken;
  if (token && !req.url.includes("/auth/refresh")) {
    req.headers.append("Authorization", `Bearer ${token}`);
  }
};

const loggingInterceptor = (payload: Request | Response) => {
  if (process.env.NODE_ENV === "development") {
    console.log(payload);
  }
};

const request = <T>(url: string, options: CustomRequestOptions = {}) => {
  const requestBuilder = new RequestBuilder(apiBaseUrl as string)
    .setRequestInterceptors([TokenInterceptor, loggingInterceptor])
    .setResponseInterceptors([loggingInterceptor])
    .setRetryConfig({ backoffFactor: 0, maxRetries: 2 })
    .build<T>();

  return requestBuilder(url, options);
};

class APIService {
  private urlPrefix: string;

  constructor({ apiVersion, prefix }: { apiVersion: string; prefix: string }) {
    this.urlPrefix = `${prefix}/${apiVersion}`;
  }

  private getParsedUrl = (url: string) => {
    return this.urlPrefix + (url?.replace?.(/^(?!\/)/, "/") ?? "");
  };

  async get<R>(url: string, options: CustomRequestOptions = {}): Promise<R> {
    const { error, data, response } = await request<R>(this.getParsedUrl(url), options);

    if (error) {
      throw new APIError(response, data);
    }
    return data;
  }

  async post<B extends CustomRequestOptions["body"], R>(
    url: string,
    body?: B,
    options: CustomRequestOptions = {},
  ): Promise<R> {
    const headers = options?.headers || {
      "content-type": "application/json",
    };
    const { error, data, response } = await request<R>(this.getParsedUrl(url), {
      method: "POST",
      headers,
      body: options?.headers ? body : JSON.stringify(body),
      query: options?.query,
    });
    if (error) {
      throw new APIError(response, data);
    }
    return data;
  }

  async patch<B extends CustomRequestOptions["body"], R>(
    url: string,
    body?: B,
    options: CustomRequestOptions = {},
  ): Promise<R> {
    const headers = options?.headers || {
      "content-type": "application/json",
    };
    const { error, data, response } = await request<R>(this.getParsedUrl(url), {
      method: "PATCH",
      headers,
      body: options?.headers ? body : JSON.stringify(body),
    });
    if (error) {
      throw new APIError(response, data);
    }
    return data;
  }

  async put<B extends CustomRequestOptions["body"], R>(
    url: string,
    body?: B,
    options: CustomRequestOptions = {},
  ): Promise<R> {
    const headers = options?.headers || {
      "content-type": "application/json",
    };
    const { error, data, response } = await request<R>(this.getParsedUrl(url), {
      method: "PUT",
      headers,
      body: options?.headers ? body : JSON.stringify(body),
    });
    if (error) {
      throw new APIError(response, data);
    }
    return data;
  }

  async delete<B extends BodyInit>(url: string, body?: B): Promise<any> {
    const headers = {
      "content-type": "application/json",
    };
    const { error, data, response } = await request(this.getParsedUrl(url), {
      method: "DELETE",
      headers,
      body: JSON.stringify(body),
    });
    if (error) {
      throw new APIError(response, data);
    }
    return data;
  }

  health = () => {
    return this.get("/health");
  };

  getInventory = (): Promise<InventoryResponse> => {
    return this.get<InventoryResponse>("/inventory");
  };

  getInventoryById = (id: string): Promise<Inventory> => {
    return this.get<Inventory>(`/inventory/${id}`);
  };

  createInventory = (data: Partial<Inventory>): Promise<Inventory> => {
    return this.post<Partial<Inventory>, Inventory>("/inventory", data);
  };

  patchInventory = (id: string, data: Partial<Inventory>): Promise<Inventory> => {
    return this.patch<Partial<Inventory>, Inventory>(`/inventory/${id}`, data);
  };

  login = (data: LoginRequest): Promise<AuthResponse> => {
    return this.post<LoginRequest, AuthResponse>("/auth/login", data);
  };

  signup = (data: SignupRequest): Promise<AuthResponse> => {
    return this.post<SignupRequest, AuthResponse>("/auth/signup", data);
  };

  getWishlist = (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    success: boolean;
    count: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    wishlists: Inventory[];
  }> => {
    return this.get(`/wishlist?page=${page}&limit=${limit}`);
  };

  addToWishlist = (
    inventoryId: string,
  ): Promise<{ success: boolean; message: string; wishlists: Inventory[] }> => {
    return this.post("/wishlist", { inventoryId });
  };

  removeFromWishlist = (
    inventoryId: string,
  ): Promise<{ success: boolean; message: string; wishlists: Inventory[] }> => {
    return this.delete(`/wishlist?inventoryId=${inventoryId}`);
  };

  getNotifications = (): Promise<{
    success: boolean;
    count: number;
    unreadCount: number;
    results: Notification[];
  }> => {
    return this.get("/notifications");
  };

  markNotificationAsRead = (id: string): Promise<{ success: boolean; message: string }> => {
    return this.post(`/notifications/${id}/mark-as-read`);
  };

  markAllNotificationsAsRead = (): Promise<{ success: boolean; message: string }> => {
    return this.post("/notifications/mark-all-as-read");
  };
}

const apiService = new APIService({
  apiVersion: "v1",
  prefix: "/api",
});

export default apiService;
