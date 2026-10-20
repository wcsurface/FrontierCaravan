interface AndroidWindow extends Window {
  AndroidHaptics?: {
    vibrateLight: () => void;
    vibrateMedium: () => void;
    vibrateHeavy: () => void;
    vibrateReject: () => void;
  };
}

export class HapticBridge {
  public static light() {
    const win = typeof window !== 'undefined' ? (window as AndroidWindow) : null;
    if (win?.AndroidHaptics?.vibrateLight) {
      win.AndroidHaptics.vibrateLight();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  public static medium() {
    const win = typeof window !== 'undefined' ? (window as AndroidWindow) : null;
    if (win?.AndroidHaptics?.vibrateMedium) {
      win.AndroidHaptics.vibrateMedium();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }

  public static heavy() {
    const win = typeof window !== 'undefined' ? (window as AndroidWindow) : null;
    if (win?.AndroidHaptics?.vibrateHeavy) {
      win.AndroidHaptics.vibrateHeavy();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 60]);
    }
  }

  public static reject() {
    const win = typeof window !== 'undefined' ? (window as AndroidWindow) : null;
    if (win?.AndroidHaptics?.vibrateReject) {
      win.AndroidHaptics.vibrateReject();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 50, 20]);
    }
  }
}
