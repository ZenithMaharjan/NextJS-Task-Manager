import RequestBuilder from 'utils/request';
import type { CustomRequestOptions } from 'utils/request/types';

import { APIError } from './error';

const TokenInterceptor = (req: Request) => {
    const authState = localStorage?.getItem('auth');
    if (authState && !req.url.includes('/auth/refresh')) {
        req.headers.append('Authorization', `Bearer ${JSON.parse(authState).accessToken}`);
    }
};

const LoggingInterceptor = (payload: Request | Response) => {
    console.log(payload);
};

const request = <T>(url: string, options: CustomRequestOptions = {}) => {
    const requestBuilder = new RequestBuilder(process.env.NEXT_PUBLIC_API_BASE_URL as string)
        .setRequestInterceptors([TokenInterceptor, LoggingInterceptor])
        .setResponseInterceptors([LoggingInterceptor])
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
        return this.urlPrefix + (url?.replace?.(/^(?!\/)/, '/') ?? '');
    };

    async get<R>(url: string, options: CustomRequestOptions = {}): Promise<R> {
        const { error, data, response } = await request<R>(this.getParsedUrl(url), options);

        if (error) {
            throw new APIError(response, data);
        }
        return data;
    }

    async post<B extends CustomRequestOptions['body'], R>(
        url: string,
        body?: B,
        options: CustomRequestOptions = {},
    ): Promise<R> {
        const headers = options?.headers || {
            'content-type': 'application/json',
        };
        const { error, data, response } = await request<R>(this.getParsedUrl(url), {
            method: 'POST',
            headers,
            body: options?.headers ? body : JSON.stringify(body),
            query: options?.query,
        });
        if (error) {
            throw new APIError(response, data);
        }
        return data;
    }

    async patch<B extends CustomRequestOptions['body'], R>(
        url: string,
        body?: B,
        options: CustomRequestOptions = {},
    ): Promise<R> {
        const headers = options?.headers || {
            'content-type': 'application/json',
        };
        const { error, data, response } = await request<R>(this.getParsedUrl(url), {
            method: 'PATCH',
            headers,
            body: options?.headers ? body : JSON.stringify(body),
        });
        if (error) {
            throw new APIError(response, data);
        }
        return data;
    }

    async put<B extends CustomRequestOptions['body'], R>(
        url: string,
        body?: B,
        options: CustomRequestOptions = {},
    ): Promise<R> {
        const headers = options?.headers || {
            'content-type': 'application/json',
        };
        const { error, data, response } = await request<R>(this.getParsedUrl(url), {
            method: 'PUT',
            headers,
            body: options?.headers ? body : JSON.stringify(body),
        });
        if (error) {
            throw new APIError(response, data);
        }
        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async delete<B extends BodyInit>(url: string, body?: B): Promise<any> {
        const headers = {
            'content-type': 'application/json',
        };
        const { error, data, response } = await request(this.getParsedUrl(url), {
            method: 'DELETE',
            headers,
            body: JSON.stringify(body),
        });
        if (error) {
            throw new APIError(response, data);
        }
        return data;
    }

    health = () => {
        return this.get('/health');
    }

    getInventory = () => {
        return this.get('/inventory');
    }
}

const apiService = new APIService({
    apiVersion: 'v1',
    prefix: '/api'
});

export default apiService;
