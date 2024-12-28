import { v4 as uuidv4 } from 'uuid'
import { Session, CopilotDetail, Settings } from '../shared/types'
import * as defaults from '../shared/defaults'

export enum StorageKey {
    Settings = 'settings',
    ChatSessions = 'chat_sessions',
    MyCopilots = 'my_copilots',
    ConfigVersion = 'config_version',
}

// Create a default session
function createDefaultSession(): Session {
    return {
        id: uuidv4(),
        name: 'New Chat',
        type: 'chat',
        messages: [],
        model: 'gpt-3.5-turbo',
        createdAt: Date.now(),
    }
}

const storage = {
    getItem: (key: string) => {
        try {
            const item = localStorage.getItem(key)
            
            // Handle different types of storage items
            switch (key) {
                case StorageKey.Settings: {
                    // For settings, ensure we merge with defaults
                    const settings = item ? JSON.parse(item) : null
                    return Object.assign({}, defaults.settings(), settings)
                }
                case StorageKey.ChatSessions: {
                    // For chat sessions, ensure we always return an array with at least one session
                    const sessions = item ? JSON.parse(item) : null
                    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
                        const defaultSession = createDefaultSession()
                        localStorage.setItem(key, JSON.stringify([defaultSession]))
                        return [defaultSession]
                    }
                    return sessions
                }
                case StorageKey.MyCopilots: {
                    // For copilots, ensure we always return an array
                    const copilots = item ? JSON.parse(item) : null
                    if (!copilots || !Array.isArray(copilots)) {
                        localStorage.setItem(key, JSON.stringify([]))
                        return []
                    }
                    return copilots
                }
                default:
                    return item ? JSON.parse(item) : null
            }
        } catch (e) {
            console.error('Error reading from storage:', e)
            // Return appropriate defaults based on key
            switch (key) {
                case StorageKey.Settings:
                    return defaults.settings()
                case StorageKey.ChatSessions:
                    return [createDefaultSession()]
                case StorageKey.MyCopilots:
                    return []
                default:
                    return null
            }
        }
    },
    setItem: (key: string, value: any) => {
        try {
            switch (key) {
                case StorageKey.Settings:
                    // For settings, ensure we merge with defaults
                    const defaultSettings = defaults.settings()
                    const mergedSettings = Object.assign({}, defaultSettings, value)
                    localStorage.setItem(key, JSON.stringify(mergedSettings))
                    break
                case StorageKey.ChatSessions:
                    // For chat sessions, ensure we never save an empty array
                    if (Array.isArray(value) && value.length === 0) {
                        const defaultSession = createDefaultSession()
                        localStorage.setItem(key, JSON.stringify([defaultSession]))
                    } else {
                        localStorage.setItem(key, JSON.stringify(value))
                    }
                    break
                case StorageKey.MyCopilots:
                    // For copilots, ensure we always save an array
                    if (!Array.isArray(value)) {
                        localStorage.setItem(key, JSON.stringify([]))
                    } else {
                        localStorage.setItem(key, JSON.stringify(value))
                    }
                    break
                default:
                    localStorage.setItem(key, JSON.stringify(value))
            }
        } catch (e) {
            console.error('Error writing to storage:', e)
        }
    },
    removeItem: (key: string) => {
        try {
            switch (key) {
                case StorageKey.Settings:
                    // For settings, replace with defaults instead of removing
                    localStorage.setItem(key, JSON.stringify(defaults.settings()))
                    break
                case StorageKey.ChatSessions:
                    // For chat sessions, replace with default session instead of removing
                    const defaultSession = createDefaultSession()
                    localStorage.setItem(key, JSON.stringify([defaultSession]))
                    break
                case StorageKey.MyCopilots:
                    // For copilots, replace with empty array instead of removing
                    localStorage.setItem(key, JSON.stringify([]))
                    break
                default:
                    localStorage.removeItem(key)
            }
        } catch (e) {
            console.error('Error removing from storage:', e)
        }
    }
}

export default storage
