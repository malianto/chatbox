import { getDefaultStore } from 'jotai'
import * as atoms from './atoms'
import * as defaults from '../../shared/defaults'
import { Settings } from '../../shared/types'
import * as sessionActions from './sessionActions'

export function modify(update: Partial<Settings>) {
    const store = getDefaultStore()
    
    // Update global settings
    store.set(atoms.settingsAtom, (settings) => ({
        ...settings,
        ...update,
    }))

    // Create a new session with updated settings if needed
    if (update.aiProvider || update.model) {
        const currentSession = sessionActions.getCurrentSession()
        if (currentSession && currentSession.messages.length <= 1) {
            // Only update empty sessions (with just system message)
            sessionActions.modify({
                ...currentSession,
                aiProvider: update.aiProvider,
                model: update.model,
                temperature: update.temperature,
                topP: update.topP,
                maxTokens: update.maxTokens,
            })
        }
    }
}

export function needEditSetting() {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    if (settings.aiProvider === 'chatbox-ai' && !settings.licenseKey) {
        return true
    }
    if (
        settings.aiProvider === 'openai' &&
        settings.openaiKey === '' &&
        settings.apiHost === defaults.settings().apiHost
    ) {
        return true
    }
    if (settings.aiProvider === 'ollama' && !settings.ollamaModel) {
        return true
    }
    return false
}

export function getLanguage() {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    return settings.language
}

export function getProxy() {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    return settings.proxy
}

export function getLicenseKey() {
    const store = getDefaultStore()
    const settings = store.get(atoms.settingsAtom)
    return settings.licenseKey
}

export function getAutoGenerateTitle() {
    const store = getDefaultStore()
    return store.get(atoms.autoGenerateTitleAtom)
}
