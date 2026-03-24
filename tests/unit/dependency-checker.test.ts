import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isVersionSupported,
  normalizeVersion,
  parseVersion
} from "../../packages/core/src/dependency-checker.ts";

test("normalizeVersion removes leading v prefix", () => {
  assert.equal(normalizeVersion("v24.13.1"), "24.13.1");
  assert.equal(normalizeVersion(" 11.8.0 "), "11.8.0");
});

test("parseVersion parses and pads semantic versions", () => {
  assert.deepEqual(parseVersion("24"), [24, 0, 0]);
  assert.deepEqual(parseVersion("24.13"), [24, 13, 0]);
  assert.deepEqual(parseVersion("24.13.1"), [24, 13, 1]);
  assert.equal(parseVersion("24.x.1"), null);
});

test("isVersionSupported compares versions correctly", () => {
  assert.equal(isVersionSupported("24.13.1", "20.0.0"), true);
  assert.equal(isVersionSupported("20.0.0", "20.0.0"), true);
  assert.equal(isVersionSupported("19.9.9", "20.0.0"), false);
  assert.equal(isVersionSupported("invalid", "20.0.0"), false);
});

