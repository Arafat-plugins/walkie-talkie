import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDashboardPlatformSectionsMarkup,
  createDashboardDemoPlatformSectionsModel
} from "../../apps/dashboard/src/index.ts";

test("createDashboardDemoPlatformSectionsModel builds demo entities and pipelines", () => {
  const model = createDashboardDemoPlatformSectionsModel();

  assert.equal(model.readOnlyViews.agents.length, 2);
  assert.equal(model.readOnlyViews.skills.length, 2);
  assert.equal(model.readOnlyViews.mcpServers.length, 2);
  assert.equal(model.pipelineList.pipelines.length, 2);
});

test("buildDashboardPlatformSectionsMarkup renders read-only sections", () => {
  const markup = buildDashboardPlatformSectionsMarkup(createDashboardDemoPlatformSectionsModel());

  assert.match(markup, /<h2 class="wt-section__title">Agents<\/h2>/);
  assert.match(markup, /Telegram Router/);
  assert.match(markup, /Cursor Check/);
  assert.match(markup, /Filesystem MCP/);
  assert.match(markup, /Telegram Cursor Check/);
});
