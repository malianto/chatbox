import { Config, Settings } from "src/shared/types"
import { getOS } from './navigator'
import { parseLocale } from '@/i18n/parser'
import Exporter from './exporter'

export class WebPlatform {
    public exporter = new Exporter()
    private store: { [key: string]: any } = {}

    public async getVersion() {
        // Return a special version for web that won't trigger update checks
        return 'web-latest'
    }

    public async getPlatform() {
        return 'web'
    }

    public async shouldUseDarkColors(): Promise<boolean> {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    public onSystemThemeChange(callback: () => void): () => void {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const listener = () => callback()
        mediaQuery.addListener(listener)
        return () => mediaQuery.removeListener(listener)
    }

    public onWindowShow(callback: () => void): () => void {
        const listener = () => callback()
        window.addEventListener('focus', listener)
        return () => window.removeEventListener('focus', listener)
    }

    public async openLink(url: string): Promise<void> {
        window.open(url, '_blank')
    }

    public async getInstanceName(): Promise<string> {
        return `Web / ${getOS()}`
    }

    public async getLocale() {
        return parseLocale(navigator.language)
    }

    public async ensureShortcutConfig(): Promise<void> {
        // No-op in web environment
        return
    }

    public async ensureProxyConfig(): Promise<void> {
        // No-op in web environment
        return
    }

    public async relaunch(): Promise<void> {
        window.location.reload()
    }

    public async getConfig(): Promise<Config> {
        const stored = localStorage.getItem('config')
        if (stored) {
            return JSON.parse(stored)
        }
        return {
            theme: 'system',
            locale: 'en',
            fontSize: 14,
            disableQuickToggleShortcut: false,
        }
    }

    public async setConfig(config: Config): Promise<void> {
        localStorage.setItem('config', JSON.stringify(config))
    }

    public async getSettings(): Promise<Settings> {
        const stored = localStorage.getItem('settings')
        if (stored) {
            return JSON.parse(stored)
        }
        return {
            allowReportingAndTracking: false,
        }
    }

    public async setSettings(settings: Settings): Promise<void> {
        localStorage.setItem('settings', JSON.stringify(settings))
    }

    public async getStoreValue(key: string): Promise<any> {
        const stored = localStorage.getItem(`store_${key}`)
        if (stored) {
            return JSON.parse(stored)
        }
        return null
    }

    public async setStoreValue(key: string, value: any): Promise<void> {
        localStorage.setItem(`store_${key}`, JSON.stringify(value))
    }

    public async deleteStoreValue(key: string): Promise<void> {
        localStorage.removeItem(`store_${key}`)
    }

    public async clearStore(): Promise<void> {
        // Only clear store-related items
        const storeKeys = Object.keys(localStorage).filter(key => key.startsWith('store_'))
        storeKeys.forEach(key => localStorage.removeItem(key))
    }

    public async getStoreKeys(): Promise<string[]> {
        return Object.keys(localStorage)
            .filter(key => key.startsWith('store_'))
            .map(key => key.replace('store_', ''))
    }

    public initTracking(): void {
        this.trackingEvent('user_engagement', {})
    }

    public trackingEvent(name: string, params: { [key: string]: string }): void {
        // In web environment, we can use Google Analytics if available
        if (window.gtag) {
            window.gtag('event', name, params)
        }
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Tracking Event:', name, params)
        }
    }

    public async shouldShowAboutDialogWhenStartUp(): Promise<boolean> {
        // Only show on first visit
        const hasVisited = localStorage.getItem('has_visited')
        if (!hasVisited) {
            localStorage.setItem('has_visited', 'true')
            return true
        }
        return false
    }

    public async appLog(level: string, message: string): Promise<void> {
        // Log to console in web environment
        console.log(`[${level}] ${message}`)
    }
}
