import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bootstrapDashboardApp,
  buildDashboardBootstrapSummary,
  createDashboardAppBootstrap,
  type DashboardDomElement
} from "../../apps/dashboard/src/index.ts";

test("createDashboardAppBootstrap defines browser + vanilla DOM stack", () => {
  const bootstrap = createDashboardAppBootstrap();

  assert.deepEqual(bootstrap.stack, {
    runtimeTarget: "browser",
    renderer: "vanilla-dom",
    moduleFormat: "esm",
    mountId: "app",
    entryModule: "./dist/apps/dashboard/src/main.js"
  });

  assert.deepEqual(buildDashboardBootstrapSummary(bootstrap), [
    "Walkie-Talkie: Walkie-Talkie Dashboard",
    "Stack: browser/vanilla-dom/esm",
    "Mount: #app",
    "Entry: ./dist/apps/dashboard/src/main.js"
  ]);
});

test("bootstrapDashboardApp writes loading markup into mount node", () => {
  const mountAttributes = new Map<string, string>();
  const mountElement: DashboardDomElement = {
    innerHTML: "",
    setAttribute(name, value) {
      mountAttributes.set(name, value);
    }
  };

  const fakeDocument = {
    title: "",
    getElementById(id: string) {
      return id === "app" ? mountElement : null;
    }
  };

  const result = bootstrapDashboardApp(fakeDocument, createDashboardAppBootstrap());

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Bootstrap unexpectedly failed.");
  }

  assert.equal(fakeDocument.title, "Walkie-Talkie Dashboard");
  assert.equal(mountAttributes.get("data-dashboard-renderer"), "vanilla-dom");
  assert.equal(mountAttributes.get("data-dashboard-runtime"), "browser");
  assert.match(result.html, /Control Plane/);
  assert.match(result.html, /data-nav-id="overview"/);
  assert.match(result.html, /Telegram Router/);
  assert.match(result.html, /Telegram Cursor Check/);
  assert.match(result.html, /Status and Logs/);
});
