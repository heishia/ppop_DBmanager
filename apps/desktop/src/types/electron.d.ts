interface ElectronAPI {
  openFile: () => Promise<{
    path: string;
    name: string;
    buffer: string;
  } | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
