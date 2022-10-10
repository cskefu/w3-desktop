import { BrowserWindow } from 'electron';
export declare function getMainWindow(): BrowserWindow | undefined;
export declare function setAppMenuBarVisibility(showTip?: boolean): void;
export declare function sendChannelToMainWindow(channel: string, ...args: unknown[]): void;
export declare function sendChannelToAllWindows(channel: string, ...args: unknown[]): void;
export declare function showRestartDialog(enabled?: boolean, name?: string): Promise<void>;
export declare function cleanURLFromGoogle(url: string): string;
