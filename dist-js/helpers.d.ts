import { NativeImage } from 'electron';
export declare function getUrlAccountId(url: string): string | undefined;
export declare const platform: 'macos' | 'linux' | 'windows';
/**
 * Create a tray icon.
 *
 * @param unread True to create the unead icon; false to create the normal icon.
 */
export declare function createTrayIcon(unread: boolean): NativeImage;
