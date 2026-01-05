class StorageService {
  private readonly prefix = 'colombia_invierte_';

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(`${this.prefix}${key}`, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
}

export const storageService = new StorageService();

