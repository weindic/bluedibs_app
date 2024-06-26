import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
//bluedibs-official-production.firebaseapp.com
//projectsharib.firebaseapp.com
const firebaseConfig = {
  apiKey: "AIzaSyBWT9RrFMXzm4i10F0HrWf9hfTyYRsFn1M",
  authDomain: "bluedibs-official-production.firebaseapp.com",
  projectId: "bluedibs-official-production",
  storageBucket: "bluedibs-official-production.appspot.com",
  messagingSenderId: "515452563549",
  appId: "1:515452563549:android:ff4286758c562cb0c45db4",
  databaseURL:
    "https://bluedibs-official-production-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(
  app,
  "gs://bluedibs-official-production.appspot.com"
);

export { app, auth, database, storage };
