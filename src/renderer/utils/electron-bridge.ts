import electronMock from './electron-mock';

// Check if we're running in a web environment
const isWeb = process.env.CHATBOX_BUILD_TARGET === 'web';

// Export either the real Electron APIs or our mocks
export const electron = isWeb ? electronMock : window.electron;
export const { ipcRenderer } = isWeb ? electronMock : window.electron;
export const { shell } = isWeb ? electronMock : window.electron;
