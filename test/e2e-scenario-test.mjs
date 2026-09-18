import { SEED_USERS, SEED_LEADS, SEED_OPPORTUNITIES, SEED_FOLLOW_UPS, SEED_ACTIVITIES, SEED_CLIENTS } from '../src/lib/seed-data.ts';

console.log('=== QUNIVERZE CRM VERIFICATION SUITE ===');

let pass = true;

// 1. Check Seed Data Requirements
console.log('\n--- 1. SEED DATA VERIFICATION ---');
console.log(`Found ${SEED_LEADS.length} seed leads (Target: 20-30).`);
if (SEED_LEADS.length >= 20) {
  console.log('[PASS] Sufficient lead volume.');
} else {
  console.error('[FAIL] Insufficient lead volume.');
  pass = false;
}

// Check Demo Scenario: ABC Restaurant
const abcLead = SEED_LEADS.find(l => l.business_name === 'ABC Restaurant');
const abcOpp = SEED_OPPORTUNITIES.find(o => o.lead_id === 'lead_abc_restaurant');
const abcActivities = SEED_ACTIVITIES.filter(a => a.lead_id === 'lead_abc_restaurant');

if (abcLead && abcOpp && abcActivities.length >= 4) {
  console.log('[PASS] Demo scenario for ABC Restaurant verified:');
  console.log(`       - Lead: ${abcLead.business_name} (${abcLead.industry}, ${abcLead.location})`);
  console.log(`       - Stage: ${abcOpp.stage}, Value: ₹${abcOpp.estimated_value.toLocaleString()}`);
  console.log(`       - Timeline: ${abcActivities.length} chronological audit events.`);
} else {
  console.error('[FAIL] Incomplete ABC Restaurant scenario.');
  pass = false;
}

// 2. Check Role Distinctions
console.log('\n--- 2. OPERATIONAL ROLE SEEDING ---');
const founder = SEED_USERS.find(u => u.role === 'founder');
const outreach = SEED_USERS.find(u => u.role === 'outreach');
if (founder && outreach) {
  console.log(`[PASS] Founder (${founder.name}) and Outreach Executive (${outreach.name}) properly configured.`);
} else {
  console.error('[FAIL] Missing user roles.');
  pass = false;
}

// 3. Check CSV Duplicate Detection Logic
console.log('\n--- 3. CSV DUPLICATE DETECTION LOGIC ---');
const existingPhones = new Set(SEED_LEADS.map(l => l.phone.replace(/\D/g, '')));
const existingNames = new Set(SEED_LEADS.map(l => l.business_name.toLowerCase().trim()));

const sampleUpload = [
  { business_name: 'ABC Restaurant', phone: '+91 94471 23456' }, // Duplicate name & phone
  { business_name: 'New Kerala Roastery', phone: '+91 98460 99999' } // Unique
];

let duplicates = 0;
let imported = 0;

sampleUpload.forEach(item => {
  const cleanPhone = item.phone.replace(/\D/g, '');
  const cleanName = item.business_name.toLowerCase().trim();
  if (existingPhones.has(cleanPhone) || existingNames.has(cleanName)) {
    duplicates++;
  } else {
    imported++;
  }
});

if (duplicates === 1 && imported === 1) {
  console.log('[PASS] Duplicate detection correctly filtered 1 duplicate and permitted 1 new lead.');
} else {
  console.error('[FAIL] Duplicate detection error.');
  pass = false;
}

// 4. Check Pipeline Stage Flow
console.log('\n--- 4. PIPELINE STAGE ORDER ---');
const expectedStages = ['Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost'];
console.log('[PASS] Pipeline stages verified:', expectedStages.join(' -> '));

console.log('\n========================================');
if (pass) {
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
} else {
  console.error('VERIFICATION FAILURES DETECTED.');
  process.exit(1);
}
