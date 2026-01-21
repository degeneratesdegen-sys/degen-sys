// Paste your keys here to ensure the connection works
const firebaseConfig = {
  apiKey: "AIzaSyAWtso6QR1oyXs6b5aVXjf9Oi-XsCipeTg",
  authDomain: "vaultpro-90a00.firebaseapp.com",
  projectId: "vaultpro-90a00",
  storageBucket: "vaultpro-90a00.firebasestorage.app",
  messagingSenderId: "802795035216",
  appId: "1:802795035216:web:0bf0d3efa72e5bc8004f55"
};

// Initialize Firebase (Compat Version)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const { createApp } = Vue;

createApp({
  data() {
    return {
      currentUser: null, loginEmail: '', loginPass: '', showModal: false, isEditing: false, 
      transactions: [], categories: ["Paycheque", "Groceries", "Rent", "Dining", "Gas", "Fun", "E-Transfer"],
      entry: { id: null, amount: null, category: 'Groceries' }
    }
  },
  computed: {
    cashBalance() {
      return this.transactions.reduce((acc, t) => this.isPositive(t.category) ? acc + t.amount : acc - t.amount, 0);
    }
  },
  methods: {
    isPositive(cat) { return ['Paycheque', 'E-Transfer'].includes(cat); },
    async login() { 
        try { await auth.signInWithEmailAndPassword(this.loginEmail, this.loginPass); } 
        catch (e) { alert(e.message); } 
    },
    async logout() { await auth.signOut(); location.reload(); },
    async saveEntry() {
      const data = { ...this.entry, amount: Number(this.entry.amount), ownerId: auth.currentUser.uid, date: new Date().toISOString() };
      if(this.isEditing) await db.collection("transactions").doc(data.id).update(data);
      else await db.collection("transactions").add(data);
      this.showModal = false;
    },
    openEdit(t) { this.isEditing = true; this.entry = { ...t }; this.showModal = true; }
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        db.collection("transactions").where("ownerId", "==", user.uid).orderBy("date", "desc")
          .onSnapshot(s => {
            this.transactions = s.docs.map(d => ({ id: d.id, ...d.data() }));
          });
      }
    });
  }
}).mount('#app');
