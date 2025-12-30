export type RequestInterceptor = (request: Request, controller: AbortController) => void;
export type ResponseInterceptor = (response: Response, request: Request, controller: AbortController) => void;
export type FatalInterceptor = (error: Error, request: Request, controller: AbortController) => void;
export interface Interceptors {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
    fatal: FatalInterceptor[];
}

export interface RetryConfig {
    maxRetries: number;
    statusForcelist: number[];
    backoffFactor: number;
    methodWhitelist: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomRequestOptions<B = any> extends Omit<RequestInit, 'body'> {
    query?: Record<string, string>;
    body?: B;
}

export type RequestInvoker<T> = (
    url: string,
    options?: CustomRequestOptions,
) => Promise<{ error: boolean; data: T; response: Response }>;

export type RequestFactory<T> = (
    url: string,
    originalFetch: typeof fetch,
    interceptors: Interceptors,
) => RequestInvoker<T>;

export type RetriableRequestInvoker<T> = (request: RequestInvoker<T>, config: RetryConfig) => RequestInvoker<T>;
