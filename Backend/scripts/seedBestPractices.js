/**
 * Seed Script — Best Practices Collection across all Environments
 * ---------------------------------------------------------------
 * Connects to the three DLF databases:
 *   1. Development / Test  (.env.development -> EvaluationSytem_test)
 *   2. DLPS Production     (.env.dlps        -> EvaluationSytem)
 *   3. DLWS Production     (.env.dlws        -> evaluationDlws)
 *
 * Upserts all 23 curated practices into the `bestpractices` collection in each.
 *
 * Usage:
 *   node scripts/seedBestPractices.js                   # Seeds all 3 databases
 *   node scripts/seedBestPractices.js --target=test      # Seeds only Test / Dev DB
 *   node scripts/seedBestPractices.js --target=dlps      # Seeds only DLPS Prod DB
 *   node scripts/seedBestPractices.js --target=dlws      # Seeds only DLWS Prod DB
 */

'use strict';

const path     = require('path');
const fs       = require('fs');
const dotenv   = require('dotenv');
const dns      = require('dns');
const mongoose = require('mongoose');

// Prioritize IPv4 on macOS (avoids Atlas SRV timeouts)
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

// ── 1. Define Target Databases ───────────────────────────────────────────────
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

// ── 2. Load Seed Data ────────────────────────────────────────────────────────
const seedDataPath = path.resolve(__dirname, './bestPracticesSeedData.json');
if (!fs.existsSync(seedDataPath)) {
  console.error('❌  Could not find seed data at:', seedDataPath);
  process.exit(1);
}

const PRACTICES = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
if (!Array.isArray(PRACTICES) || PRACTICES.length === 0) {
  console.error('❌  No practices found in the seed data file.');
  process.exit(1);
}

console.log(`\n📚  Loaded ${PRACTICES.length} curated practices from seed data file.\n`);

// ── 3. Parse CLI Flags ───────────────────────────────────────────────────────
const targetArg = (process.argv.find((a) => a.startsWith('--target=')) || '')
  .replace('--target=', '')
  .toLowerCase();

const selectedTargets = targetArg
  ? TARGETS.filter((t) => t.key === targetArg)
  : TARGETS;

if (selectedTargets.length === 0) {
  console.error(`❌  Unknown target: "${targetArg}". Valid options: test, dlps, dlws`);
  process.exit(1);
}

// ── 4. Seed Function for a Single Connection ─────────────────────────────────
const bestPracticeSchema = new mongoose.Schema({
  id:            { type: Number, required: true, unique: true },
  title:         { type: String, required: true, trim: true },
  teacher:       { type: String, required: true, trim: true },
  brief:         { type: String, default: '' },
  grade:         { type: [String], default: [] },
  theme:         { type: [String], default: [] },
  competency:    { type: [String], default: [] },
  pedagogy:      { type: [String], default: [] },
  atype:         { type: [String], default: [] },
  nep:           { type: [String], default: [] },
  lo:            { type: String, default: '' },
  tlp:           { type: String, default: '' },
  duration:      { type: String, default: '' },
  resources:     { type: String, default: '' },
  atool_text:    { type: String, default: '' },
  evid_text:     { type: String, default: '' },
  remedial_text: { type: String, default: '' },
  refs:          { type: String, default: '' },
  ksf:           { type: String, default: '' },
  images:        { type: [String], default: [] },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

async function seedTarget(target) {
  console.log(`══════════════════════════════════════════════════════════════`);
  console.log(`🚀  Connecting to: ${target.name}`);
  console.log(`══════════════════════════════════════════════════════════════`);

  const conn = await mongoose.createConnection(target.uri, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
  }).asPromise();

  console.log(`✅  Connected to database successfully.\n`);

  const Model = conn.model('BestPractice', bestPracticeSchema, 'bestpractices');

  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;

  for (const practice of PRACTICES) {
    if (!practice.id || !practice.title || !practice.teacher) {
      console.warn(`  ⚠️   Skipping invalid record (id=${practice.id}): missing required fields.`);
      skipped++;
      continue;
    }

    const doc = {
      id:            practice.id,
      title:         practice.title,
      teacher:       practice.teacher,
      brief:         practice.brief         || '',
      grade:         practice.grade         || [],
      theme:         practice.theme         || [],
      competency:    practice.competency    || [],
      pedagogy:      practice.pedagogy      || [],
      atype:         practice.atype         || [],
      nep:           practice.nep           || [],
      lo:            practice.lo            || '',
      tlp:           practice.tlp           || '',
      duration:      practice.duration      || '',
      resources:     practice.resources     || '',
      atool_text:    practice.atool_text    || '',
      evid_text:     practice.evid_text     || '',
      remedial_text: practice.remedial_text || '',
      refs:          practice.refs          || '',
      ksf:           practice.ksf           || '',
      images:        Array.isArray(practice.images) ? practice.images : [],
    };

    // Check if document exists before upserting to accurately record insert vs update
    const existing = await Model.findOne({ id: doc.id });

    await Model.findOneAndUpdate(
      { id: doc.id },
      { $set: doc },
      { upsert: true, new: true, runValidators: true }
    );

    if (!existing) {
      console.log(`  ➕  Inserted:  [${doc.id}] ${doc.title}`);
      inserted++;
    } else {
      console.log(`  🔄  Updated:   [${doc.id}] ${doc.title}`);
      updated++;
    }
  }

  console.log('\n──────────────────────────────────────────────────────');
  console.log(`  Target          : ${target.name}`);
  console.log(`  Total practices : ${PRACTICES.length}`);
  console.log(`  Inserted        : ${inserted}`);
  console.log(`  Updated         : ${updated}`);
  console.log(`  Skipped         : ${skipped}`);
  console.log('──────────────────────────────────────────────────────\n');

  await conn.close();
}

// ── 5. Run Seeding Across Selected Targets ──────────────────────────────────
async function runAll() {
  const startTime = Date.now();
  console.log(`Starting seeding process for ${selectedTargets.length} target database(s)...`);

  for (const target of selectedTargets) {
    try {
      await seedTarget(target);
    } catch (err) {
      console.error(`❌  Failed seeding for ${target.name}:`, err.message);
      throw err;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`🎉  ALL ${selectedTargets.length} DATABASES SEEDED SUCCESSFULLY in ${durationSec}s!\n`);
}

runAll().catch((err) => {
  console.error('\n❌  Fatal error during seeding process:', err.message);
  process.exit(1);
});
