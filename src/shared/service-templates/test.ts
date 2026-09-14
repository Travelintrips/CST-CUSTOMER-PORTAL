import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInCodeServiceTemplate,
  resolveServiceTemplate,
  hasInCodeServiceTemplate,
  getAllInCodeServiceTemplates,
  listInCodeServiceTypes,
  FALLBACK_SERVICE_TYPE,
} from "./registry.js";
import { serviceTemplates } from "./templates.js";
import type { ServiceTemplateOverride } from "./types.js";

// ── getInCodeServiceTemplate ─────────────────────────────────────────────────

test("getInCodeServiceTemplate — returns correct template for known serviceType", () => {
  const tpl = getInCodeServiceTemplate("trucking");
  assert.equal(tpl.serviceType, "trucking");
  assert.equal(tpl.label, "Trucking");
  assert.equal(tpl.emoji, "🚛");
  assert.ok(tpl.fields.length > 0, "trucking should have fields");
});

test("getInCodeServiceTemplate — returns all 17 expected service types", () => {
  const expected = [
    "product", "trucking", "sea_freight", "air_freight", "ppjk",
    "handling", "document", "exim_service",
    "customer_shipment", "customer_quote", "customer_document",
    "customer_complaint", "customer_product",
    "admin_checklist", "admin_handover", "admin_inspection", "admin_rfq_forward",
  ];
  for (const svcType of expected) {
    const tpl = getInCodeServiceTemplate(svcType);
    assert.equal(
      tpl.serviceType, svcType,
      `serviceType "${svcType}" should be registered`,
    );
  }
});

test("getInCodeServiceTemplate — fallback to 'document' for unknown serviceType", () => {
  const tpl = getInCodeServiceTemplate("nonexistent_xyz");
  assert.equal(tpl.serviceType, FALLBACK_SERVICE_TYPE);
});

test("getInCodeServiceTemplate — every template has version '1.0.0' and isActive true", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    assert.equal(tpl.version, "1.0.0", `${tpl.serviceType}.version should be "1.0.0"`);
    assert.equal(tpl.isActive, true, `${tpl.serviceType}.isActive should be true`);
  }
});

test("getInCodeServiceTemplate — every template has at least one field", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    assert.ok(tpl.fields.length > 0, `${tpl.serviceType} should have at least one field`);
  }
});

test("getInCodeServiceTemplate — all fields have required `key`, `label`, `type`, and `section`", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    for (const field of tpl.fields) {
      assert.ok(typeof field.key === "string" && field.key.length > 0,
        `${tpl.serviceType}.field missing key`);
      assert.ok(typeof field.label === "string" && field.label.length > 0,
        `${tpl.serviceType}.field[${field.key}] missing label`);
      assert.ok(["text","number","select","textarea","date"].includes(field.type),
        `${tpl.serviceType}.field[${field.key}] invalid type: ${field.type}`);
      assert.ok(["quotation","operational","both"].includes(field.section),
        `${tpl.serviceType}.field[${field.key}] invalid section: ${field.section}`);
    }
  }
});

test("getInCodeServiceTemplate — select fields have options array", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    for (const field of tpl.fields) {
      if (field.type === "select") {
        assert.ok(Array.isArray(field.options) && field.options.length > 0,
          `${tpl.serviceType}.field[${field.key}] type=select must have options`);
      }
    }
  }
});

test("getInCodeServiceTemplate — trucking has quotation AND operational fields", () => {
  const tpl = getInCodeServiceTemplate("trucking");
  const quotationFields = tpl.fields.filter((f) => f.section === "quotation");
  const operationalFields = tpl.fields.filter((f) => f.section === "operational");
  assert.ok(quotationFields.length > 0, "trucking should have quotation fields");
  assert.ok(operationalFields.length > 0, "trucking should have operational fields");
});

test("getInCodeServiceTemplate — sea_freight has requiredDocuments with BL", () => {
  const tpl = getInCodeServiceTemplate("sea_freight");
  const bl = tpl.requiredDocuments.find((d) => d.key === "bill_of_lading");
  assert.ok(bl, "sea_freight should have bill_of_lading in requiredDocuments");
  assert.equal(bl?.required, true, "bill_of_lading should be required");
});

test("getInCodeServiceTemplate — trucking has checklist items", () => {
  const tpl = getInCodeServiceTemplate("trucking");
  assert.ok(tpl.checklist.length > 0, "trucking should have checklist items");
  const driverCheck = tpl.checklist.find((c) => c.key === "driver_confirmed");
  assert.ok(driverCheck, "trucking checklist should include driver_confirmed");
});

// ── resolveServiceTemplate ───────────────────────────────────────────────────

test("resolveServiceTemplate — no override returns base template", () => {
  const resolved = resolveServiceTemplate("trucking");
  const base = getInCodeServiceTemplate("trucking");
  assert.equal(resolved.serviceType, "trucking");
  assert.equal(resolved.label, base.label);
  assert.equal(resolved.fields.length, base.fields.length);
});

test("resolveServiceTemplate — null override returns base template", () => {
  const resolved = resolveServiceTemplate("sea_freight", null);
  const base = getInCodeServiceTemplate("sea_freight");
  assert.equal(resolved.label, base.label);
  assert.equal(resolved.emoji, base.emoji);
});

test("resolveServiceTemplate — override merges label only", () => {
  const override: ServiceTemplateOverride = {
    serviceType: "trucking",
    label: "Trucking Premium",
  };
  const resolved = resolveServiceTemplate("trucking", override);
  assert.equal(resolved.label, "Trucking Premium");
  const base = getInCodeServiceTemplate("trucking");
  assert.equal(resolved.emoji, base.emoji, "emoji should stay from base");
  assert.equal(resolved.fields.length, base.fields.length, "fields should stay from base");
});

test("resolveServiceTemplate — override merges requiredDocuments", () => {
  const override: ServiceTemplateOverride = {
    serviceType: "trucking",
    requiredDocuments: [
      { key: "custom_doc", label: "Dokumen Khusus", required: true },
    ],
  };
  const resolved = resolveServiceTemplate("trucking", override);
  assert.equal(resolved.requiredDocuments.length, 1);
  assert.equal(resolved.requiredDocuments[0]?.key, "custom_doc");
  const base = getInCodeServiceTemplate("trucking");
  assert.equal(resolved.fields.length, base.fields.length, "fields stay from base");
});

test("resolveServiceTemplate — override with isActive=false returns base template unchanged", () => {
  const override: ServiceTemplateOverride = {
    serviceType: "trucking",
    isActive: false,
    label: "DISABLED LABEL",
    emoji: "❌",
  };
  const resolved = resolveServiceTemplate("trucking", override);
  const base = getInCodeServiceTemplate("trucking");
  assert.equal(resolved.label, base.label, "disabled override should not change label");
  assert.equal(resolved.emoji, base.emoji, "disabled override should not change emoji");
});

test("resolveServiceTemplate — override null fields fall back to base", () => {
  const override: ServiceTemplateOverride = {
    serviceType: "ppjk",
    label: null,
    emoji: null,
    fields: null,
    requiredDocuments: null,
    checklist: null,
  };
  const resolved = resolveServiceTemplate("ppjk", override);
  const base = getInCodeServiceTemplate("ppjk");
  assert.equal(resolved.label, base.label, "null label should fallback to base");
  assert.equal(resolved.emoji, base.emoji, "null emoji should fallback to base");
  assert.equal(resolved.fields.length, base.fields.length, "null fields should fallback to base");
});

test("resolveServiceTemplate — override with new fields replaces base fields", () => {
  const newFields = [
    { key: "custom_field", label: "Custom", type: "text" as const, section: "quotation" as const, required: true },
  ];
  const override: ServiceTemplateOverride = {
    serviceType: "document",
    fields: newFields,
  };
  const resolved = resolveServiceTemplate("document", override);
  assert.equal(resolved.fields.length, 1);
  assert.equal(resolved.fields[0]?.key, "custom_field");
});

test("resolveServiceTemplate — unknown serviceType uses fallback then merges override", () => {
  const override: ServiceTemplateOverride = {
    serviceType: "unknown_service",
    label: "Layanan Baru",
  };
  const resolved = resolveServiceTemplate("unknown_service", override);
  assert.equal(resolved.label, "Layanan Baru");
  const fallback = getInCodeServiceTemplate("unknown_service");
  assert.equal(resolved.fields.length, fallback.fields.length, "fields come from fallback");
});

// ── registry helpers ─────────────────────────────────────────────────────────

test("hasInCodeServiceTemplate — known types return true", () => {
  assert.equal(hasInCodeServiceTemplate("trucking"), true);
  assert.equal(hasInCodeServiceTemplate("ppjk"), true);
  assert.equal(hasInCodeServiceTemplate("admin_inspection"), true);
});

test("hasInCodeServiceTemplate — unknown type returns false", () => {
  assert.equal(hasInCodeServiceTemplate("unknown_xyz"), false);
  assert.equal(hasInCodeServiceTemplate(""), false);
});

test("listInCodeServiceTypes — returns exactly 17 service types", () => {
  const types = listInCodeServiceTypes();
  assert.equal(types.length, 17, `expected 17 service types, got ${types.length}`);
});

test("getAllInCodeServiceTemplates — count equals Object.keys(serviceTemplates)", () => {
  const all = getAllInCodeServiceTemplates();
  const keys = Object.keys(serviceTemplates);
  assert.equal(all.length, keys.length);
});

test("getAllInCodeServiceTemplates — no duplicate serviceType values", () => {
  const all = getAllInCodeServiceTemplates();
  const seen = new Set<string>();
  for (const tpl of all) {
    assert.equal(seen.has(tpl.serviceType), false,
      `Duplicate serviceType: ${tpl.serviceType}`);
    seen.add(tpl.serviceType);
  }
});

// ── field shape invariants ───────────────────────────────────────────────────

test("invariant — serviceTemplates keys match serviceType property", () => {
  for (const [key, tpl] of Object.entries(serviceTemplates)) {
    assert.equal(tpl.serviceType, key,
      `Key "${key}" mismatch with serviceType "${tpl.serviceType}"`);
  }
});

test("invariant — requiredDocuments and checklist are always arrays", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    assert.ok(Array.isArray(tpl.requiredDocuments),
      `${tpl.serviceType}.requiredDocuments must be array`);
    assert.ok(Array.isArray(tpl.checklist),
      `${tpl.serviceType}.checklist must be array`);
    assert.ok(Array.isArray(tpl.conditionalRules),
      `${tpl.serviceType}.conditionalRules must be array`);
    assert.ok(Array.isArray(tpl.validationRules),
      `${tpl.serviceType}.validationRules must be array`);
  }
});

test("invariant — logistics service types (trucking/sea/air/ppjk/handling) have requiredDocuments", () => {
  const logisticsTypes = ["trucking", "sea_freight", "air_freight", "ppjk", "handling", "exim_service"];
  for (const svcType of logisticsTypes) {
    const tpl = getInCodeServiceTemplate(svcType);
    assert.ok(tpl.requiredDocuments.length > 0,
      `${svcType} should have at least one requiredDocument`);
  }
});

test("invariant — logistics service types have checklist", () => {
  const logisticsTypes = ["trucking", "sea_freight", "air_freight", "ppjk", "handling", "exim_service", "product"];
  for (const svcType of logisticsTypes) {
    const tpl = getInCodeServiceTemplate(svcType);
    assert.ok(tpl.checklist.length > 0,
      `${svcType} should have at least one checklist item`);
  }
});

test("invariant — validationRules fieldKey references existing field keys", () => {
  const all = getAllInCodeServiceTemplates();
  for (const tpl of all) {
    const fieldKeys = new Set(tpl.fields.map((f) => f.key));
    for (const rule of tpl.validationRules) {
      assert.ok(fieldKeys.has(rule.fieldKey),
        `${tpl.serviceType}: validationRule fieldKey "${rule.fieldKey}" not in fields`);
    }
  }
});
