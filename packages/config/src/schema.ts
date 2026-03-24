export type WalkieTalkieConfig = {
  version: "1";
  project: {
    name: string;
    primaryTrigger: "cli" | "telegram";
  };
  runtime: {
    environment: "local" | "server";
    logLevel?: "info" | "warning" | "error" | "debug";
    telegram?: {
      enabled?: boolean;
      delivery?: {
        mode: "webhook" | "polling";
        webhookPath?: string;
        pollingIntervalMs?: number;
      };
      publicBaseUrl?: string;
      webhookSecretToken?: string;
    };
    flowBindings?: Array<{
      triggerKind: "cli" | "schedule" | "telegram" | "webhook" | "dashboard";
      eventName?: string;
      pipelineId: string;
    }>;
  };
  providers: {
    defaultAi: {
      apiKey: string;
      baseUrl?: string;
      model?: string;
    };
    telegram?: {
      botToken?: string;
    };
  };
  bootstrap: {
    createExamplePipeline: boolean;
  };
};

export type ConfigValidationIssue = {
  path: string;
  message: string;
};

export type ConfigValidationResult =
  | {
      valid: true;
      issues: [];
    }
  | {
      valid: false;
      issues: ConfigValidationIssue[];
    };
