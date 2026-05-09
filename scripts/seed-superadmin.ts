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

const EMAIL = 'superadmin@saleserp.com';
const PASSWORD = 'Super@Admin123';

async function run() {
  const app = initializeApp(firebaseConfig, 'seed-super');
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    const uid = cred.user.uid;

    await setDoc(doc(db, 'systemAdmins', uid), {
      id: uid,
      email: EMAIL,
      name: 'Super Administrator',
      role: 'super_admin',
      permissions: ['*'],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Admin created!');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   UID:      ${uid}`);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists:');
      console.log(`   Email:    ${EMAIL}`);
      console.log(`   Password: ${PASSWORD}`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
  process.exit(0);
}

run();
