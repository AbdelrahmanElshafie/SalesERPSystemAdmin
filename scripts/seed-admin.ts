// Seed First System Admin Script
// Run with: npx tsx scripts/seed-admin.ts

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDyeP_jF7kpte4fexx5ssY6hFprvR7FZHo',
  authDomain: 'saleserp-e2718.firebaseapp.com',
  projectId: 'saleserp-e2718',
  storageBucket: 'saleserp-e2718.firebasestorage.app',
  messagingSenderId: '938955723790',
  appId: '1:938955723790:web:2c8a6d102980d889ce585f',
};

// Admin credentials
const ADMIN_EMAIL = 'admin@saleserp.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'System Administrator';

async function seedAdmin() {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    console.log(`Creating admin user: ${ADMIN_EMAIL}`);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    const userId = userCredential.user.uid;
    console.log(`Auth user created with ID: ${userId}`);

    // Create system admin document
    const adminData = {
      id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'super_admin',
      permissions: ['*'], // All permissions
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'systemAdmins', userId), adminData);
    console.log('System admin document created in Firestore');

    console.log('\n========================================');
    console.log('Admin user created successfully!');
    console.log('========================================');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`User ID: ${userId}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nAdmin user already exists!');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      process.exit(0);
    }
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
