/**
 * Seed Script — Default Role & Document Permissions
 * ---------------------------------------------------
 * Seeds or resets the default permissions matrix for:
 *   - Superadmin
 *   - Observer
 *   - Teacher
 * across all three databases (Test, DLPS Prod, DLWS Prod).
 *
 * Usage:
 *   node scripts/seedPermissions.js
 *   node scripts/seedPermissions.js --target=test
 *   node scripts/seedPermissions.js --target=dlps
 *   node scripts/seedPermissions.js --target=dlws
 */

'use strict';

const path     = require('path');
const fs       = require('fs');
const dotenv   = require('dotenv');
const dns      = require('dns');
const mongoose = require('mongoose');

if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const backendDir = path.resolve(__dirname, '..');

const parseEnvFile = (filename) => {
  const fullPath = path.resolve(backendDir, filename);
  if (fs.existsSync(fullPath)) {
    try {
      return dotenv.parse(fs.readFileSync(fullPath));
    } catch (_) {}
  }
  return {};
};

const devEnv  = parseEnvFile('.env.development');
const dlpsEnv = parseEnvFile('.env.dlps');
const dlwsEnv = parseEnvFile('.env.dlws');
const rootEnv = parseEnvFile('.env');

const TARGETS = [
  {
    key: 'test',
    name: 'Development / Test (EvaluationSytem_test)',
    uri: devEnv.MONGO_URI || rootEnv.MONGO_URI ||
         'mongodb+srv://evaluation:dICAG3PDxBgFALDR@cluster0.uvs50.mongodb.net/EvaluationSytem_test?retryWrites=true&w=majority&appName=Cluster0',
  },
  {
    key: 'dlps',
    name: 'DLPS Production (EvaluationSytem)',
    uri: dlpsEnv.MONGO_URI ||
         'mongodb+srv://evaluation:dICAG3PDxBgFALDR@cluster0.uvs50.mongodb.net/EvaluationSytem?retryWrites=true&w=majority&appName=Cluster0',
  },
  {
    key: 'dlws',
    name: 'DLWS Production (evaluationDlws)',
    uri: dlwsEnv.MONGO_URI ||
         'mongodb+srv://evaluation:dICAG3PDxBgFALDR@cluster0.uvs50.mongodb.net/evaluationDlws?retryWrites=true&w=majority&appName=Cluster0',
  },
];

// ── Default Role Permissions Definition ───────────────────────────────────────
const ALL_TABS = [
  "/dashboard",
  "/reports",
  "/users",
  "/profile",
  "/class-section",
  "/fortnightly-monitor",
  "/classroom-walkthrough",
  "/notebook-checking-proforma",
  "/co-scholastic",
  "/weekly4form",
  "/wing-coordinator",
  "/accountability",
  "/analytics-insights",
  "/audit-logs",
  "/best-practices",
  "/permissions",
];

const ALL_DOCUMENTS = [
  "fortnightly",
  "walkthrough",
  "notebook",
  "coScholastic",
  "weekly4",
  "wingCoordinator",
  "accountability",
  "bestPractices",
  "classSection",
  "users",
  "auditLogs",
];

const DEFAULT_ROLE_PERMISSIONS = {
  Superadmin: {
    tabs: ALL_TABS.reduce((acc, tab) => ({ ...acc, [tab]: true }), {}),
    documents: ALL_DOCUMENTS.reduce((acc, doc) => ({
      ...acc,
      [doc]: {
        canView: true,
        canCreate: doc !== 'auditLogs',
        canEdit: doc !== 'auditLogs',
        canDelete: doc !== 'auditLogs', // Audit logs are immutable
        canExport: true,
      },
    }), {}),
  },

  Observer: {
    tabs: {
      "/dashboard": true,
      "/reports": true,
      "/profile": true,
      "/fortnightly-monitor": true,
      "/classroom-walkthrough": true,
      "/notebook-checking-proforma": true,
      "/co-scholastic": true,
      "/weekly4form": true,
      "/wing-coordinator": true,
      "/accountability": true,
      "/best-practices": true,
      "/users": false,
      "/class-section": false,
      "/analytics-insights": false,
      "/audit-logs": false,
      "/permissions": false,
    },
    documents: {
      fortnightly:       { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      walkthrough:       { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      notebook:          { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      coScholastic:      { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      weekly4:           { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      wingCoordinator:   { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      accountability:    { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      bestPractices:     { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      classSection:      { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      users:             { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      auditLogs:         { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    },
  },

  Teacher: {
    tabs: {
      "/dashboard": true,
      "/profile": true,
      "/fortnightly-monitor": true,
      "/classroom-walkthrough": true,
      "/notebook-checking-proforma": true,
      "/co-scholastic": true,
      "/weekly4form": true,
      "/best-practices": true,
      "/reports": false,
      "/wing-coordinator": false,
      "/accountability": false,
      "/users": false,
      "/class-section": false,
      "/analytics-insights": false,
      "/audit-logs": false,
      "/permissions": false,
    },
    documents: {
      fortnightly:       { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: false },
      walkthrough:       { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      notebook:          { canView: true, canCreate: false, canEdit: true, canDelete: false, canExport: false },
      coScholastic:      { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      weekly4:           { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: false },
      wingCoordinator:   { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      accountability:    { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      bestPractices:     { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      classSection:      { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      users:             { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      auditLogs:         { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    },
  },
};

// ── Target Parsing ───────────────────────────────────────────────────────────
const targetArg = (process.argv.find((a) => a.startsWith('--target=')) || '')
  .replace('--target=', '')
  .toLowerCase();

const selectedTargets = targetArg
  ? TARGETS.filter((t) => t.key === targetArg)
  : TARGETS;

const AccessControl = require('../models/AccessControl');

async function seedTarget(target) {
  console.log(`══════════════════════════════════════════════════════════════`);
  console.log(`🚀  Connecting to: ${target.name}`);
  console.log(`══════════════════════════════════════════════════════════════`);

  const conn = await mongoose.createConnection(target.uri, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
  }).asPromise();

  console.log(`✅  Connected successfully.`);

  const Model = conn.model('AccessControl', AccessControl.schema, 'accesscontrols');

  for (const roleName of ['Superadmin', 'Observer', 'Teacher']) {
    const config = DEFAULT_ROLE_PERMISSIONS[roleName];
    const result = await Model.findOneAndUpdate(
      { targetType: 'role', roleName },
      {
        $set: {
          targetType: 'role',
          roleName,
          tabs: config.tabs,
          documents: config.documents,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  🛡️   Configured role permissions: ${roleName}`);
  }

  console.log(`✅  Finished permissions setup for ${target.name}\n`);
  await conn.close();
}

async function run() {
  for (const target of selectedTargets) {
    await seedTarget(target);
  }
  console.log(`🎉  All selected targets seeded successfully!\n`);
}

run().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
