export class Logger {
  static info(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'test') {
      console.debug(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
      return;
    }
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static error(message: string, error?: unknown): void {
    if (process.env.NODE_ENV === 'test') {
      console.debug(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
      return;
    }
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}
