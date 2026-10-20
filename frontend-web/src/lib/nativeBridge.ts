declare global {
  interface Window {
    AndroidBridge?: {
      vibrate: (milliseconds: number) => void;
      getDeviceId: () => string;
      setOrientation: (orientation: string) => void;
      playAudioCue: (soundName: string) => void;
      saveLocalState: (jsonState: string) => void;
      loadLocalState: () => string;
      isNetworkAvailable: () => boolean;
      getAppVersion: () => string;
      notifyOnlineStatusChanged?: (isOnline: boolean) => void;
    };
    onNativeNetworkStatusChange?: (isOnline: boolean) => void;
  }
}

export const nativeBridge = {
  vibrate: (ms: number = 40) => {
    if (typeof window !== 'undefined' && window.AndroidBridge?.vibrate) {
      window.AndroidBridge.vibrate(ms);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  },

  getDeviceId: (): string => {
    if (typeof window !== 'undefined' && window.AndroidBridge?.getDeviceId) {
      return window.AndroidBridge.getDeviceId();
    }
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('fc_device_id');
      if (!id) {
        id = 'web_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('fc_device_id', id);
      }
      return id;
    }
    return 'web_fallback';
  },

  setOrientation: (orientation: 'landscape' | 'portrait' | 'sensor_landscape') => {
    if (typeof window !== 'undefined' && window.AndroidBridge?.setOrientation) {
      window.AndroidBridge.setOrientation(orientation);
    }
  },

  playAudioCue: (soundName: 'click' | 'shoot' | 'explosion' | 'buy' | 'warning') => {
    if (typeof window !== 'undefined' && window.AndroidBridge?.playAudioCue) {
      window.AndroidBridge.playAudioCue(soundName);
    }
  },

  saveLocalState: (stateObj: unknown) => {
    const jsonStr = JSON.stringify(stateObj);
    if (typeof window !== 'undefined' && window.AndroidBridge?.saveLocalState) {
      window.AndroidBridge.saveLocalState(jsonStr);
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('fc_game_state', jsonStr);
    }
  },

  loadLocalState: <T>(): T | null => {
    let jsonStr: string | null = null;
    if (typeof window !== 'undefined' && window.AndroidBridge?.loadLocalState) {
      jsonStr = window.AndroidBridge.loadLocalState();
    }
    if (!jsonStr && typeof window !== 'undefined') {
      jsonStr = localStorage.getItem('fc_game_state');
    }
    if (jsonStr) {
      try {
        return JSON.parse(jsonStr) as T;
      } catch (e) {
        console.error('Failed to parse local state:', e);
      }
    }
    return null;
  },

  isOnline: (): boolean => {
    if (typeof window !== 'undefined' && window.AndroidBridge?.isNetworkAvailable) {
      return window.AndroidBridge.isNetworkAvailable();
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },
};
