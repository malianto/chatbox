// Mock Electron's IPC for web environment
export const ipcRenderer = {
    on: (channel: string, listener: (...args: any[]) => void) => {
        window.addEventListener(`ipc-${channel}`, (event: any) => {
            listener(event, event.detail);
        });
        return {
            remove: () => window.removeEventListener(`ipc-${channel}`, listener)
        };
    },
    send: (channel: string, ...args: any[]) => {
        const event = new CustomEvent(`ipc-${channel}`, { detail: args });
        window.dispatchEvent(event);
    },
    invoke: async (channel: string, ...args: any[]) => {
        // Mock responses based on channel
        switch (channel) {
            case 'get-app-path':
                return '/mock/app/path';
            case 'get-version':
                return '1.0.0';
            case 'get-platform':
                return 'web';
            case 'get-locale':
                return navigator.language;
            default:
                console.warn(`Unmocked IPC channel: ${channel}`);
                return null;
        }
    }
};

export const shell = {
    openExternal: (url: string) => {
        window.open(url, '_blank');
    }
};

// Export a mock Electron object
export default {
    ipcRenderer,
    shell
};
