import { ElectronIPC } from "src/shared/electron-types"
import { Config, Settings } from "src/shared/types"
import { getOS } from './navigator'
import { parseLocale } from '@/i18n/parser'
import Exporter from './exporter'
import { WebPlatform } from './platform.web'

export class DesktopPlatform {
    public ipc: ElectronIPC
    constructor(ipc: ElectronIPC) {
        this.ipc = ipc
    }

    public exporter = new Exporter()

    public async getVersion() {
        return this.ipc.invoke('getVersion')
    }
    public async getPlatform() {
        return this.ipc.invoke('getPlatform')
    }
    public async shouldUseDarkColors(): Promise<boolean> {
        return await this.ipc.invoke('shouldUseDarkColors')
    }
    public onSystemThemeChange(callback: () => void): () => void {
        return this.ipc.onSystemThemeChange(callback)
    }
    public onWindowShow(callback: () => void): () => void {
        return this.ipc.onWindowShow(callback)
    }
    public async openLink(url: string): Promise<void> {
        return this.ipc.invoke('openLink', url)
    }
    public async getInstanceName(): Promise<string> {
        const hostname = await this.ipc.invoke('getHostname')
        return `${hostname} / ${getOS()}`
    }
    public async getLocale() {
        const locale = await this.ipc.invoke('getLocale')
        return parseLocale(locale)
    }
    public async ensureShortcutConfig(config: { disableQuickToggleShortcut: boolean }): Promise<void> {
        return this.ipc.invoke('ensureShortcutConfig', JSON.stringify(config))
    }
    public async ensureProxyConfig(config: { proxy?: string }): Promise<void> {
        return this.ipc.invoke('ensureProxy', JSON.stringify(config))
    }
    public async relaunch(): Promise<void> {
        return this.ipc.invoke('relaunch')
    }

    public async getConfig(): Promise<Config> {
        const configStr = await this.ipc.invoke('getConfig')
        return JSON.parse(configStr)
    }

    public async setConfig(config: Config): Promise<void> {
        return this.ipc.invoke('setConfig', JSON.stringify(config))
    }

    public async getSettings(): Promise<Settings> {
        const settingsStr = await this.ipc.invoke('getSettings')
        return JSON.parse(settingsStr)
    }

    public async setSettings(settings: Settings): Promise<void> {
        return this.ipc.invoke('setSettings', JSON.stringify(settings))
    }

    public async setStoreValue(key: string, value: any) {
        const valueJson = JSON.stringify(value)
        return this.ipc.invoke('setStoreValue', key, valueJson)
    }
    public async getStoreValue(key: string) {
        return this.ipc.invoke('getStoreValue', key)
    }
    public delStoreValue(key: string) {
        return this.ipc.invoke('delStoreValue', key)
    }
    public async getAllStoreValues(): Promise<{ [key: string]: any }> {
        const json = await this.ipc.invoke('getAllStoreValues')
        return JSON.parse(json)
    }
    public async setAllStoreValues(data: { [key: string]: any }) {
        await this.ipc.invoke('setAllStoreValues', JSON.stringify(data))
    }

    public initTracking(): void {
        this.trackingEvent('user_engagement', {})
    }
    public trackingEvent(name: string, params: { [key: string]: string }) {
        const dataJson = JSON.stringify({ name, params })
        this.ipc.invoke('analysticTrackingEvent', dataJson)
    }

    public async shouldShowAboutDialogWhenStartUp(): Promise<boolean> {
        return this.ipc.invoke('shouldShowAboutDialogWhenStartUp')
    }

    public async appLog(level: string, message: string) {
        return this.ipc.invoke('appLog', JSON.stringify({ level, message }))
    }
}

// Determine which platform to use based on environment
const isWeb = process.env.CHATBOX_BUILD_TARGET === 'web'
export default isWeb ? new WebPlatform() : new DesktopPlatform(window.electronAPI as any)
