export interface FirebasexConfigPluginBridge {
  fetch(
    cacheExpirationSeconds: number,
    success: () => void,
    error: (err: unknown) => void,
  ): void;
  activateFetched(
    success: (activated: boolean) => void,
    error: (err: unknown) => void,
  ): void;
  getValue(
    key: string,
    success: (value: unknown) => void,
    error: (err: unknown) => void,
  ): void;
}

export interface CordovaWindow {
  FirebasexConfig?: FirebasexConfigPluginBridge;
}
