import axios from "axios";

export class ZapierWebhook {
  private webhookUrl: string;
  private webhookToken: string;

  constructor(webhookUrl: string, webhookToken: string) {
    if (!webhookUrl.startsWith("https://hooks.zapier.com/")) {
      throw new Error("Invalid Zapier Webhook URL");
    }
    this.webhookUrl = webhookUrl;
    this.webhookToken = webhookToken;
  }

  async trigger<T extends Record<string, any>>(payload: T): Promise<boolean> {
    try {
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.webhookToken}`,
        },
      });
      if (response.status !== 200) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to trigger Zap:");
      throw error;
    }
  }
}
