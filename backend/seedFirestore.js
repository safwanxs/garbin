const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { db } = require('./firebaseAdmin');
const { bins, reports } = require('./seedData');

async function seedFirestore() {
  const existingBins = await db.collection('bins').limit(1).get();
  if (!existingBins.empty) {
    console.log('Firestore already contains bins; seed skipped.');
    return;
  }

  const batch = db.batch();
  bins.forEach((bin) => batch.set(db.collection('bins').doc(bin.id), bin));
  reports.forEach((report) => batch.set(db.collection('reports').doc(report.id), report));
  await batch.commit();
  console.log(`Seeded ${bins.length} bins and ${reports.length} reports into Firestore.`);
}

seedFirestore().catch((error) => {
  console.error('Firestore seed failed:', error);
  process.exitCode = 1;
});
