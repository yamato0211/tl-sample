import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB4OHuvSNCFQnIoP2vVSNzt4GN6CgImbj0",
    authDomain: "hacku-416915.firebaseapp.com",
    databaseURL: "https://hacku-416915-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hacku-416915",
    storageBucket: "hacku-416915.appspot.com",
    messagingSenderId: "682261396804",
    appId: "1:682261396804:web:98a4742542f28e06a4ab11",
    measurementId: "G-P3G4GBF3EJ"
};

const message = {
    "messageId": {
        "content": "message",
        "author": {
            "authorId": "author",
            "name": "name",
            "icon": "icon"
        },
        "timestamp": "timestamp",
        "replies": ["replyId1", "replyId2"]
    }
}

export const app = initializeApp(firebaseConfig);

