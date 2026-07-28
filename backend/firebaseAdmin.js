const admin = require('firebase-admin');

function createCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: createCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function requireFirebaseAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication is required for this action.' });
  }

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.warn('Firebase token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid or expired Firebase authentication token.' });
  }
}

module.exports = { admin, db, requireFirebaseAuth };
