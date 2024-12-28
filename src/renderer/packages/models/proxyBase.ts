import Base from './base'

const PROXY_URL = 'http://localhost:8080/proxy-api/completions'

export default class ProxyBase extends Base {
    protected getProxyHeaders(targetUri: string, headers: Record<string, string>): Record<string, string> {
        return {
            ...headers,
            'CHATBOX-TARGET-URI': targetUri,
            'CHATBOX-PLATFORM': 'web',
            'CHATBOX-VERSION': 'web',
        }
    }

    protected shouldUseProxy(url: string): boolean {
        try {
            const urlObj = new URL(url)
            return !urlObj.hostname.includes('localhost') && !urlObj.hostname.includes('127.0.0.1')
        } catch {
            return true
        }
    }

    protected async proxyPost(
        targetUri: string,
        headers: Record<string, string>,
        body: Record<string, any>,
        signal?: AbortSignal,
        retry = 3
    ) {
        if (!this.shouldUseProxy(targetUri)) {
            return this.post(targetUri, headers, body, signal, retry)
        }
        const proxyHeaders = this.getProxyHeaders(targetUri, headers)
        return this.post(PROXY_URL, proxyHeaders, body, signal, retry)
    }

    protected async proxyGet(
        targetUri: string,
        headers: Record<string, string>,
        signal?: AbortSignal,
        retry = 3
    ) {
        if (!this.shouldUseProxy(targetUri)) {
            return this.get(targetUri, headers, signal, retry)
        }
        const proxyHeaders = this.getProxyHeaders(targetUri, headers)
        return this.get(PROXY_URL, proxyHeaders, signal, retry)
    }
}
