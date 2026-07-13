export interface TurnstileService {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}

interface TurnstileResponse {
  success: boolean;
}

export function createTurnstileService(secretKey: string): TurnstileService {
  return {
    async verify(token, remoteIp) {
      const formData = new FormData();
      formData.append("secret", secretKey);
      formData.append("response", token);

      if (remoteIp) {
        formData.append("remoteip", remoteIp);
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        return false;
      }

      const result = (await response.json()) as TurnstileResponse;
      return result.success;
    },
  };
}