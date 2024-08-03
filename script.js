// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBV5sAOUZfNrpyChOdoVEp0hO5xiElY4yo",
    authDomain: "gassor-b7534.firebaseapp.com",
    projectId: "gassor-b7534",
    storageBucket: "gassor-b7534.appspot.com",
    messagingSenderId: "1018254824459",
    appId: "1:1018254824459:web:6a6f40184b287d5d07230e",
    measurementId: "G-KLQQYVX5FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Handle staff sign-on for admin page access
document.getElementById('staff-sign-on').addEventListener('click', function() {
    const userPassword = prompt("Enter the password:");
    if (userPassword === "T3?dWuU9") {
        window.location.href = "add.html";
    } else {
        alert("Incorrect password!");
    }
});

// Function to handle track deletions
document.addEventListener('click', async function(event) {
    if (event.target && event.target.classList.contains('delete-button')) {
        const trackDiv = event.target.closest('.track');
        const trackId = trackDiv.getAttribute('data-id');
        const confirmDelete = confirm("Are you sure you want to delete this track?");
        
        if (confirmDelete) {
            try {
                // Fetch track data from Firestore
                const trackDoc = doc(firestore, 'tracks', trackId);
                const trackData = (await getDoc(trackDoc)).data();

                // Delete track file and photo from Firebase Storage
                const fileRef = ref(storage, trackData.fileURL);
                const photoRef = ref(storage, trackData.photoURL);
                await Promise.all([
                    deleteObject(fileRef),
                    deleteObject(photoRef)
                ]);

                // Delete track document from Firestore
                await deleteDoc(trackDoc);

                // Remove the track from the UI
                trackDiv.remove();
                alert('Track deleted successfully.');
            } catch (error) {
                console.error('Error deleting track:', error);
                alert('Failed to delete track.');
            }
        }
    }
});

// Code to load tracks on the index page
document.addEventListener('DOMContentLoaded', async () => {
    const collectionsSection = document.getElementById('collections');

    try {
        // Fetch tracks from Firestore
        const tracksCollection = collection(firestore, 'tracks');
        const trackSnapshot = await getDocs(tracksCollection);

        trackSnapshot.forEach(async (doc) => {
            const track = doc.data();
            const trackDiv = document.createElement('div');
            trackDiv.classList.add('track');
            trackDiv.setAttribute('data-id', doc.id);

            // Fetch URLs for track file and photo
            const trackFileRef = ref(storage, track.fileURL);
            const trackPhotoRef = ref(storage, track.photoURL);

            const [trackFileURL, trackPhotoURL] = await Promise.all([
                getDownloadURL(trackFileRef),
                getDownloadURL(trackPhotoRef)
            ]);

            trackDiv.innerHTML = `
                <img src="${trackPhotoURL}" alt="${track.title}">
                <div>
                    <p>${track.title}</p>
                    <audio controls src="${trackFileURL}"></audio>
                    <button class="delete-button">Delete</button>
                </div>
            `;
            collectionsSection.appendChild(trackDiv);
        });
    } catch (error) {
        console.error('Error loading tracks:', error);
    }
});
