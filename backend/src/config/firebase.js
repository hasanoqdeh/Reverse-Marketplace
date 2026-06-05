'use strict';

let _admin = null;
let initialized = false;

function getFirebaseAdmin() {
  if (initialized) return _admin;
  initialized = true;

  let admin;
  try {
    admin = require('firebase-admin');
  } catch {
    console.warn('[FCM] firebase-admin not installed — push notifications disabled');
    return null;
  }

  const projectId = process.env.FCM_PROJECT_ID;
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      _admin = admin;
    } catch (err) {
      console.warn('[FCM] Firebase init failed:', err.message);
    }
  } else {
    console.warn('[FCM] Firebase credentials not configured — push notifications disabled');
  }

  return _admin;
}

module.exports = getFirebaseAdmin;
