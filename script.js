const firebaseConfig = {
  apiKey: "AIzaSyBUpWKo01l0OTdTiY9nAb4JQlWZTjnKq-A",
  authDomain: "otchat-ea3e9.firebaseapp.com",
  projectId: "otchat-ea3e9",
  storageBucket: "otchat-ea3e9.firebasestorage.app",
  messagingSenderId: "891135991353",
  appId: "1:891135991353:web:bb774206ff00833621b7e8",
  measurementId: "G-RK15VRTXHT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const chat = document.getElementById('chat');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button'); // Get the logout button
const authForm = document.getElementById('auth-form'); // Get the auth form div

const nameUpdateForm = document.getElementById('name-update-form'); // Get name update form
const newDisplayNameInput = document.getElementById('new-display-name'); // Get new display name input
const updateNameButton = document.getElementById('update-name-button'); // Get update name button

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const displayNameInput = document.getElementById('display-name');

let currentUser = null;

registerButton.onclick = () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const displayName = displayNameInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return cred.user.updateProfile({ displayName });
    })
    .catch(alert);
};

loginButton.onclick = () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password).catch(alert);
};

logoutButton.onclick = () => {
  auth.signOut();
};

updateNameButton.onclick = () => {
  const newName = newDisplayNameInput.value;
  if (currentUser && newName) {
    currentUser.updateProfile({ displayName: newName })
      .then(() => alert("Display name updated!"))
      .catch(alert);
  }
};

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authForm.style.display = 'none'; // Hide auth form
    chat.style.display = 'block'; // Show chat
    messageForm.style.display = 'flex'; // Show message form
    logoutButton.style.display = 'block'; // Show logout button
    nameUpdateForm.style.display = 'flex'; // Show name update form

    db.collection('messages')
      .orderBy('timestamp')
      .onSnapshot(snapshot => {
        chat.innerHTML = '';
        snapshot.forEach(doc => {
          const msg = doc.data();
          const div = document.createElement('div');
          div.className = 'message';
          if (currentUser.email == "otchattest123@gmail.com") {
            div.textContent = `${msg.timestamp} - ${msg.name || 'Anonymous'}: ${msg.text}`;
          } else {
            div.textContent = `${msg.name || 'Anonymous'} (${msg.email}): ${msg.text}`;
          }
          chat.appendChild(div);
        });
        chat.scrollTop = chat.scrollHeight;
      });
  } else {
    // User is not logged in or has logged out
    currentUser = null;
    authForm.style.display = 'flex'; // Show auth form
    chat.style.display = 'none'; // Hide chat
    messageForm.style.display = 'none'; // Hide message form
    logoutButton.style.display = 'none'; // Hide logout button
    nameUpdateForm.style.display = 'none'; // Hide name update form
    chat.innerHTML = ''; // Clear chat content when logged out
  }
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  const textLength = text.length;
  if (text && currentUser) {
    if (textLength <= 500) {  
      db.collection('messages').add({
        text,
        name: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    messageInput.value = '';
  }
});
