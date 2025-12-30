
import { sleep } from '../';
import type {
    CustomRequestOptions,
    FatalInterceptor,
    Interceptors,
    RequestInterceptor,
    RequestInvoker,
    ResponseInterceptor,
    RetryConfig,
} from './types';

function request<T>(baseUrl: string, originalFetch: typeof fetch, interceptors: Interceptors): RequestInvoker<T> {
    return (url, options = {}) => {
        return new Promise((resolve, reject) => {
            const _url = getUrl(url, options);
            const controller = new AbortController();
            const request = new Request(_url, { ...options, signal: controller.signal });
            interceptors.request.forEach((f) => f(request, controller));
            originalFetch(request)
                .then(async (response) => {
                    interceptors.response.forEach((f) => f(response, request, controller));
                    const contentType = response.headers.get('Content-Type') || '';
                    let data;
                    if (/application\/.*json.*$/.test(contentType)) {
                        data = await response.json();
                    } else if (/text/.test(contentType)) {
                        data = await response.text();
                    } else {
                        data = await response.blob();
                    }
                    return resolve({ error: !response.ok, data, response });
                })
                .catch((error) => {
                    interceptors.fatal.forEach((f) => f(error, request, controller));
                    return reject(error);
                });
        });
    };

    function getUrl(_url: string, { query }: CustomRequestOptions) {
        const url = new URL(_url, baseUrl);
        if (query) {
            url.search = new URLSearchParams(query).toString();
        }
        return url.toString();
    }
}

function withRetry<T>(request: RequestInvoker<T>, config: RetryConfig): RequestInvoker<T> {
    return (...args: Parameters<RequestInvoker<T>>) => {
        return new Promise((resolve, reject) => {
            const wrappedRequest = (attempt: number) => {
                request(...args)
                    .then((res) => {
                        if (shouldRetry(attempt, null, res.response)) {
                            retry(attempt);
                        } else {
                            resolve(res);
                        }
                    })
                    .catch((error) => {
                        if (shouldRetry(attempt, error)) {
                            retry(attempt);
                        } else {
                            reject(error);
                        }
                    });
            };

            const shouldRetry = (attempt: number, error: Error | null, response: Response | null = null) => {
                if (attempt >= config.maxRetries || !config.methodWhitelist.includes(args[1]?.method || 'GET')) {
                    return false;
                }

                if ((response?.status && config.statusForcelist.includes(response.status)) || error) {
                    return true;
                }

                return false;
            };

            const retry = async (attempt: number) => {
                attempt += 1;
                //TODO: prefer Retry-After header if available to calculate retryDelay
                const retryDelay = config.backoffFactor * Math.pow(2, attempt - 1);
                console.log(`[Retrying request attempt: ${attempt}, waiting for ${retryDelay}sec]`);
                await sleep(retryDelay * 1000);
                wrappedRequest(attempt);
            };
            wrappedRequest(0);
        });
    };
}

class RequestBuilder {
    private fetch: typeof fetch;
    private baseUrl: string;
    private interceptors: Interceptors;
    private retryConfig: RetryConfig;

    constructor(baseUrl: string) {
        this.fetch = fetch;
        this.baseUrl = baseUrl?.replace(/\/^/, '');
        this.interceptors = {
            request: [],
            response: [],
            fatal: [],
        };
        this.retryConfig = {
            maxRetries: 5,
            statusForcelist: [429, 500, 502, 503, 504],
            backoffFactor: 0.5,
            methodWhitelist: ['HEAD', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE'],
        };
    }

    setRequestInterceptors(interceptors: RequestInterceptor[]) {
        this.interceptors.request = interceptors;
        return this;
    }

    setResponseInterceptors(interceptors: ResponseInterceptor[]) {
        this.interceptors.response = interceptors;
        return this;
    }

    setFatalInterceptors(interceptors: FatalInterceptor[]) {
        this.interceptors.fatal = interceptors;
        return this;
    }

    setRetryConfig(config: Partial<RetryConfig>) {
        this.retryConfig = {
            ...this.retryConfig,
            ...config,
        };
        return this;
    }

    setFetch(_fetch: typeof fetch) {
        this.fetch = _fetch;
        return this;
    }

    build<T>(): RequestInvoker<T> {
        const _request = request<T>(this.baseUrl, this.fetch, this.interceptors);
        const retriableRequest: RequestInvoker<T> = withRetry<T>(_request, this.retryConfig);
        return retriableRequest;
    }
}

export default RequestBuilder;
