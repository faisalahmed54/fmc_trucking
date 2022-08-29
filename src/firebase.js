// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from 'react';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDX3USYjWKwhfAXe1VbAF9Qx1G4EiNUV_g',
	authDomain: 'reactjstest-f6009.firebaseapp.com',
	projectId: 'reactjstest-f6009',
	storageBucket: 'reactjstest-f6009.appspot.com',
	messagingSenderId: '508150043159',
	appId: '1:508150043159:web:ffda6bc7069202153b0252',
	measurementId: 'G-757NF6YCVK',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const firestoredb = getFirestore(app);

onAuthStateChanged(auth, (currentUser) => {
	if (currentUser) {
		console.log('logged in ' + currentUser.displayName);
		// setAbc(currentUser.displayName);
	} else {
		console.log('logged out');
	}
});
export const useAuth = () => {
	const [currentUser, setCurrentUser] = useState();
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
		return unsub;
	}, []);
	return currentUser;
}; 
export const uploadImg = async (image, currentUser) => {
	// const currentUser = useAuth();
	const imageRef = ref(storage, currentUser.uid + 'image');
	const snapshot = await uploadBytes(imageRef, image);

	const photoURL = await getDownloadURL(imageRef);
	updateProfile(currentUser, { photoURL });
	toast('Profile uploaded succesfully');
	// window.location.reload();
};

export { auth, app, storage, firestoredb };
