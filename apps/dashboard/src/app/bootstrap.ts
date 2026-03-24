import { buildDashboardShellMarkup, createDashboardShellModel } from "./shell.ts";
import {
  buildDashboardPlatformSectionsMarkup,
  createDashboardDemoPlatformSectionsModel
} from "../features/platform-sections.ts";
import {
  buildDashboardStatusLogPanelMarkup,
  createDashboardDemoStatusLogPanelModel
} from "../features/status-log-panel.ts";

export const DASHBOARD_RUNTIME_TARGETS = ["browser"] as const;
export const DASHBOARD_RENDERERS = ["vanilla-dom"] as const;
export const DASHBOARD_MODULE_FORMATS = ["esm"] as const;

export type DashboardRuntimeTarget = (typeof DASHBOARD_RUNTIME_TARGETS)[number];
export type DashboardRenderer = (typeof DASHBOARD_RENDERERS)[number];
export type DashboardModuleFormat = (typeof DASHBOARD_MODULE_FORMATS)[number];

export type DashboardRuntimeStack = {
  runtimeTarget: DashboardRuntimeTarget;
  renderer: DashboardRenderer;
  moduleFormat: DashboardModuleFormat;
  mountId: string;
  entryModule: string;
};

export type DashboardAppBootstrap = {
  appName: string;
  documentTitle: string;
  loadingTitle: string;
  loadingMessage: string;
  stack: DashboardRuntimeStack;
};

export type DashboardDomElement = {
  innerHTML: string;
  setAttribute(name: string, value: string): void;
};

export type DashboardDomDocument = {
  title: string;
  getElementById(id: string): DashboardDomElement | null;
};

export function createDashboardAppBootstrap(input?: {
  appName?: string;
  documentTitle?: string;
  loadingTitle?: string;
  loadingMessage?: string;
  mountId?: string;
  entryModule?: string;
}): DashboardAppBootstrap {
  return {
    appName: input?.appName ?? "Walkie-Talkie",
    documentTitle: input?.documentTitle ?? "Walkie-Talkie Dashboard",
    loadingTitle: input?.loadingTitle ?? "Dashboard Bootstrap Ready",
    loadingMessage:
      input?.loadingMessage ??
      "Vanilla TypeScript + browser DOM runtime is wired. Next step will render the overview shell.",
    stack: {
      runtimeTarget: "browser",
      renderer: "vanilla-dom",
      moduleFormat: "esm",
      mountId: input?.mountId ?? "app",
      entryModule: input?.entryModule ?? "./dist/apps/dashboard/src/main.js"
    }
  };
}

export function buildDashboardBootstrapMarkup(bootstrap: DashboardAppBootstrap): string {
  const platformSections = createDashboardDemoPlatformSectionsModel();
  const statusPanel = createDashboardDemoStatusLogPanelModel();
  const shellMarkup = buildDashboardShellMarkup(
    createDashboardShellModel({
      appName: bootstrap.appName
    }),
    {
      bodyMarkup: [
        buildDashboardPlatformSectionsMarkup(platformSections),
        buildDashboardStatusLogPanelMarkup(statusPanel)
      ].join("")
    }
  );

  return shellMarkup;
}

export function buildDashboardBootstrapSummary(bootstrap: DashboardAppBootstrap): string[] {
  return [
    `${bootstrap.appName}: ${bootstrap.documentTitle}`,
    `Stack: ${bootstrap.stack.runtimeTarget}/${bootstrap.stack.renderer}/${bootstrap.stack.moduleFormat}`,
    `Mount: #${bootstrap.stack.mountId}`,
    `Entry: ${bootstrap.stack.entryModule}`
  ];
}

export function bootstrapDashboardApp(
  documentRef: DashboardDomDocument,
  bootstrap: DashboardAppBootstrap = createDashboardAppBootstrap()
):
  | {
      ok: true;
      mountId: string;
      html: string;
    }
  | {
      ok: false;
      error: string;
      mountId: string;
    } {
  documentRef.title = bootstrap.documentTitle;

  const mountNode = documentRef.getElementById(bootstrap.stack.mountId);

  if (!mountNode) {
    return {
      ok: false,
      error: `Dashboard mount node "#${bootstrap.stack.mountId}" was not found.`,
      mountId: bootstrap.stack.mountId
    };
  }

  mountNode.setAttribute("data-dashboard-renderer", bootstrap.stack.renderer);
  mountNode.setAttribute("data-dashboard-runtime", bootstrap.stack.runtimeTarget);
  mountNode.innerHTML = buildDashboardBootstrapMarkup(bootstrap);

  return {
    ok: true,
    mountId: bootstrap.stack.mountId,
    html: mountNode.innerHTML
  };
}
