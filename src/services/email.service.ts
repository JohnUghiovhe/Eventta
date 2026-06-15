export class EmailService {
  static hasResend(): boolean {
    return false;
  }

  static validateConfig(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  static async testConnection(): Promise<boolean> {
    return true;
  }
}
