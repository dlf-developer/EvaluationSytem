/**
 * Seed Script — Best Practices Collection
 * ----------------------------------------
 * Reads all practices from the frontend static data file (converted to CJS),
 * connects to MongoDB using the .env MONGO_URI, and upserts every record into
 * the `bestpractices` collection so nothing is lost on re-runs.
 *
 * Usage:
 *   node scripts/seedBestPractices.js
 */

'use strict';

const path  = require('path');
const fs    = require('fs');
const dotenv = require('dotenv');
const dns   = require('dns');
const mongoose = require('mongoose');

// ── 1. Load environment ──────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('❌  MONGO_URI is not set in .env');
  process.exit(1);
}

// ── 2. Prioritize IPv4 (avoids Atlas timeout on macOS) ──────────────────────
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

// ── 3. Mongoose model (inline, keeps script self-contained) ──────────────────
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

const BestPractice = mongoose.models.BestPractice
  || mongoose.model('BestPractice', bestPracticeSchema);

// ── 4. Load seed data ────────────────────────────────────────────────────────
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

console.log(`\n📚  Loaded ${PRACTICES.length} practices from seed data file.\n`);

// ── 5. Connect & seed ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
  });
  console.log(`✅  Connected to MongoDB (${process.env.MONGO_URI_NAME || 'database'})\n`);

  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;

  for (const practice of PRACTICES) {
    if (!practice.id || !practice.title || !practice.teacher) {
      console.warn(`⚠️   Skipping invalid record (id=${practice.id}): missing required fields.`);
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

    const result = await BestPractice.findOneAndUpdate(
      { id: doc.id },
      { $set: doc },
      { upsert: true, new: true, runValidators: true }
    );

    // findOneAndUpdate with upsert: if doc was just created, _id won't have existed before
    // We detect insert vs update via whether createdAt === updatedAt (approx)
    const isNew = result.createdAt && result.updatedAt &&
      Math.abs(result.createdAt - result.updatedAt) < 2000;

    if (isNew) {
      console.log(`  ➕  Inserted:  [${doc.id}] ${doc.title}`);
      inserted++;
    } else {
      console.log(`  🔄  Updated:   [${doc.id}] ${doc.title}`);
      updated++;
    }
  }

  console.log('\n──────────────────────────────────────────────────────');
  console.log(`  Total practices : ${PRACTICES.length}`);
  console.log(`  Inserted        : ${inserted}`);
  console.log(`  Updated         : ${updated}`);
  console.log(`  Skipped         : ${skipped}`);
  console.log('──────────────────────────────────────────────────────\n');
  console.log('🎉  Seed complete! All practices are now in the database.\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});

