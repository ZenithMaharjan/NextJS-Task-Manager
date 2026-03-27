import RequestBuilder from "utils/request";
import type { CustomRequestOptions } from "utils/request/types";

import { APIError } from "../utils/error";

import { store } from "@/store";
import { User } from "@/store/slices/userSlice";
import { LoginRequest, SignupRequest, AuthResponse, ChangePasswordBody } from "@/types/auth";
import { Inventory, InventoryResponse, PurchaseRequest } from "@/types/inventory";
import { CreateJobCardRequest, JobCard } from "@/types/jobCard";
import { Notification } from "@/types/notification";
import { PurchaseOrder, PurchaseOrderResponse, PurchaseStatus } from "@/types/purchase";

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

  async delete(url: string, options: CustomRequestOptions = {}): Promise<any> {
    const headers = {
      "content-type": "application/json",
    };
    const { error, data, response } = await request(this.getParsedUrl(url), {
      method: "DELETE",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      query: options.query,
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
    options: CustomRequestOptions = {},
  ): Promise<{
    success: boolean;
    count: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    wishlists: Inventory[];
  }> => {
    return this.get(`/wishlist?page=${page}&limit=${limit}`, options);
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

  patchUser = (data: Partial<User>): Promise<AuthResponse> => {
    return this.patch<Partial<User>, AuthResponse>("/auth/me", data);
  };

  changePassword = (data: ChangePasswordBody): Promise<AuthResponse> => {
    return this.post<ChangePasswordBody, AuthResponse>("/auth/me/change-password", data);
  };

  purchaseInventory = (data: PurchaseRequest): Promise<{ success: boolean; message: string }> => {
    return this.post<PurchaseRequest, { success: boolean; message: string }>("/purchase", data);
  };

  getPurchaseOrders = (
    view: "buyer" | "seller" = "buyer",
    options: CustomRequestOptions = {},
  ): Promise<PurchaseOrderResponse> => {
    return this.get<PurchaseOrderResponse>("/purchase", {
      ...options,
      query: { ...options.query, expand: "inventory", view },
    });
  };

  patchPurchaseOrder = (
    purchaseId: string,
    status: PurchaseStatus,
  ): Promise<{ success: boolean; message: string }> => {
    return this.put<
      { purchaseId: string; status: PurchaseStatus },
      { success: boolean; message: string }
    >("/purchase", { purchaseId, status });
  };

  deletePurchaseOrder = (id: string): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const query = { id };
    return this.delete("/purchase", { query });
  };

  createJobCard = (data: CreateJobCardRequest): Promise<{ success: boolean; data: JobCard }> => {
    return this.post("/job-card", data);
  };

  getJobCards = (params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; data: JobCard[]; meta: any }> => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.status) query.status = params.status;
    return this.get("/job-card", { query });
  };

  updateJobCard = (
    id: string,
    data: Partial<CreateJobCardRequest>,
  ): Promise<{ success: boolean; data: JobCard }> => {
    return this.put(`/job-card/${id}`, data);
  };
}

const apiService = new APIService({
  apiVersion: "v1",
  prefix: "/api",
});

export default apiService;
