import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration (Preserved exactly as provided)
const firebaseConfig = {
  apiKey: "AIzaSyAWtso6QR1oyXs6b5aVXjf9Oi-XsCipeTg",
  authDomain: "vaultpro-90a00.firebaseapp.com",
  projectId: "vaultpro-90a00",
  storageBucket: "vaultpro-90a00.firebasestorage.app",
  messagingSenderId: "802795035216",
  appId: "1:802795035216:web:0bf0d3efa72e5bc8004f55"
};

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

// Vue.js Application
const { createApp, ref, computed, onMounted, watch } = Vue;

createApp({
  setup() {
    // ===== REACTIVE STATE =====
    const currentUser = ref(null);
    const currentTab = ref('home');
    const showModal = ref(false);
    const isEditing = ref(false);
    const transactions = ref([]);
    const toastMsg = ref('');
    const toastType = ref('success');
    const toastIcon = ref('✅');
    
    // Authentication
    const loginEmail = ref('');
    const loginPass = ref('');
    const loginError = ref('');
    const loggingIn = ref(false);
    const showPassword = ref(false);
    const isLoading = ref(true);

    // Notifications
    const showNotifications = ref(false);
    const notifications = ref([
      { id: 1, icon: '💰', title: 'Welcome to VaultPro!', time: new Date() },
      { id: 2, icon: '🔒', title: 'Your data is secure', time: new Date(Date.now() - 3600000) }
    ]);
    const unreadCount = computed(() => notifications.value.length);

    // Settings (Preserved original structure)
    const settings = ref({
      currency: "$",
      role: "standard",
      notifications: true,
      expenseCats: ["Groceries", "Rent", "Dining", "Gas", "Fun"]
    });

    // Transaction Entry
    const entry = ref({
      id: null,
      amount: null,
      category: 'Groceries',
      asset: '',
      notes: '',
      date: ''
    });

    // Filters and Sorting
    const showFilters = ref(false);
    const filterCategory = ref('');
    const filterMonth = ref('');
    const sortOrder = ref('desc');

    // Confirmation Modal
    const showConfirm = ref(false);
    const confirmTitle = ref('');
    const confirmMessage = ref('');
    const confirmAction = ref('');
    const confirmCallback = ref(null);

    // Enhanced Features
    const showBackup = ref(false);

    // Category Emojis (Preserved exactly)
    const emojis = {
      'Paycheque': '💰',
      'Groceries': '🛒',
      'Rent': '🏠',
      'Dining': '🍔',
      'Gas': '⛽',
      'Fun': '🎡',
      'E-Transfer': '💸',
      'Investment': '💎',
      'Crypto Buy': '🪙',
      'Crypto Sell': '📈',
      'Kraken Deposit': '🐙'
    };

    // Category Colors for Enhanced UI
    const categoryColors = {
      'Paycheque': 'linear-gradient(135deg, #32d74b, #20c947)',
      'Groceries': 'linear-gradient(135deg, #ff9f0a, #ff8c00)',
      'Rent': 'linear-gradient(135deg, #007aff, #0056cc)',
      'Dining': 'linear-gradient(135deg, #ff453a, #e03e36)',
      'Gas': 'linear-gradient(135deg, #af52de, #9747c7)',
      'Fun': 'linear-gradient(135deg, #ff2d92, #e0228a)',
      'E-Transfer': 'linear-gradient(135deg, #00d4ff, #00b8e6)',
      'Investment': 'linear-gradient(135deg, #32d74b, #20c947)',
      'Crypto Buy': 'linear-gradient(135deg, #ffa500, #ff8c00)',
      'Crypto Sell': 'linear-gradient(135deg, #32d74b, #20c947)',
      'Kraken Deposit': 'linear-gradient(135deg, #6b46c1, #553c9a)'
    };

    // ===== COMPUTED PROPERTIES =====
    const isAdmin = computed(() => settings.value.role === 'admin');
    
    const cashBalance = computed(() => {
      return transactions.value.reduce((acc, t) => {
        const amount = Number(t.amount);
        return ['Paycheque', 'E-Transfer', 'Crypto Sell'].includes(t.category) 
          ? acc + amount 
          : acc - amount;
      }, 0);
    });

    const allCategories = computed(() => {
      const base = ['Paycheque', 'E-Transfer', ...settings.value.expenseCats];
      return isAdmin.value 
        ? [...base, 'Investment', 'Kraken Deposit', 'Crypto Buy', 'Crypto Sell'] 
        : base;
    });

    const recentTransactions = computed(() => {
      return transactions.value.slice(0, 10);
    });

    const filteredTransactions = computed(() => {
      let filtered = [...transactions.value];
      
      if (filterCategory.value) {
        filtered = filtered.filter(t => t.category === filterCategory.value);
      }
      
      if (filterMonth.value) {
        filtered = filtered.filter(t => {
          const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
          return transactionMonth === filterMonth.value;
        });
      }

      return sortOrder.value === 'desc' 
        ? filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
        : filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    const cryptoTransactions = computed(() => {
      return transactions.value.filter(t => 
        ['Kraken Deposit', 'Crypto Buy', 'Crypto Sell'].includes(t.category)
      );
    });

    const monthlyIncome = computed(() => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      return transactions.value
        .filter(t => t.date.startsWith(currentMonth) && ['Paycheque', 'E-Transfer', 'Crypto Sell'].includes(t.category))
        .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    const monthlyExpenses = computed(() => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      return transactions.value
        .filter(t => t.date.startsWith(currentMonth) && !['Paycheque', 'E-Transfer', 'Crypto Sell'].includes(t.category))
        .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    const balanceTrend = computed(() => {
      const lastMonth = monthlyIncome.value - monthlyExpenses.value;
      const trend = lastMonth > 0 ? 'up' : 'down';
      const percentage = Math.abs((lastMonth / Math.max(monthlyIncome.value, 1)) * 100).toFixed(1);
      
      return {
        direction: trend,
        percentage,
        icon: trend === 'up' ? '↗️' : '↘️'
      };
    });

    const balanceProgress = computed(() => {
      const goal = 10000; // Example monthly goal
      return Math.min((cashBalance.value / goal) * 100, 100);
    });

    const averageTransaction = computed(() => {
      if (transactions.value.length === 0) return '$0';
      const avg = transactions.value.reduce((acc, t) => acc + Number(t.amount), 0) / transactions.value.length;
      return formatNumber(avg);
    });

    const cryptoHoldings = computed(() => {
      return cryptoTransactions.value
        .filter(t => t.category === 'Kraken Deposit')
        .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    const krakenTotal = computed(() => {
      return transactions.value
        .filter(t => t.category === 'Kraken Deposit')
        .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    const availableMonths = computed(() => {
      const months = [...new Set(transactions.value.map(t => t.date.slice(0, 7)))];
      return months.map(month => ({
        value: month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      })).sort((a, b) => b.value.localeCompare(a.value));
    });

    const userAvatarGradient = computed(() => {
      if (!currentUser.value) return '';
      const colors = ['#007AFF', '#00d4ff', '#af52de', '#32d74b', '#ff453a', '#ff9f0a'];
      const index = currentUser.value.name.charCodeAt(0) % colors.length;
      return `linear-gradient(135deg, ${colors[index]}, ${colors[(index + 1) % colors.length]})`;
    });

    const todayDate = computed(() => {
      return new Date().toISOString().split('T')[0];
    });

    // ===== METHODS =====
    
    // Utility Methods
    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toLocaleString();
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr.replace(/-/g, '/')).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    const formatTime = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    const getEmoji = (category) => {
      return emojis[category] || '💸';
    };

    const getCategoryColor = (category) => {
      return categoryColors[category] || 'rgba(255, 255, 255, 0.1)';
    };

    const isPositive = (category) => {
      return ['Paycheque', 'E-Transfer', 'Crypto Sell'].includes(category);
    };

    // Enhanced Toast System
    const showToast = (message, type = 'success') => {
      toastMsg.value = message;
      toastType.value = type;
      toastIcon.value = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      
      setTimeout(() => {
        toastMsg.value = '';
      }, 3000);
    };

    // Navigation
    const setTab = (tab) => {
      currentTab.value = tab;
      showFilters.value = false;
    };

    // Authentication Methods (Preserved original logic)
    const login = async () => {
      if (!loginEmail.value || !loginPass.value) {
        loginError.value = 'Please enter both email and password';
        return;
      }

      loggingIn.value = true;
      loginError.value = '';

      try {
        await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
        showToast('Welcome back to VaultPro!', 'success');
      } catch (error) {
        loginError.value = getErrorMessage(error.code);
        setTimeout(() => loginError.value = '', 5000);
      } finally {
        loggingIn.value = false;
      }
    };

    const getErrorMessage = (errorCode) => {
      const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'Account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password'
      };
      return errorMessages[errorCode] || 'Login failed. Please try again.';
    };

    const confirmLogout = () => {
      showConfirmation(
        'Sign Out',
        'Are you sure you want to sign out of VaultPro?',
        'Sign Out',
        logout
      );
    };

    const logout = async () => {
      try {
        await signOut(auth);
        showToast('Signed out successfully', 'success');
        resetAppState();
      } catch (error) {
        showToast('Error signing out', 'error');
      }
    };

    const resetAppState = () => {
      currentTab.value = 'home';
      showModal.value = false;
      showFilters.value = false;
      showNotifications.value = false;
      transactions.value = [];
      loginEmail.value = '';
      loginPass.value = '';
      loginError.value = '';
    };

    // 🔒 FIXED ROLE VERIFICATION - ONLY SHANE GETS ADMIN
    const verifyUserRole = async (userEmail) => {
      // Force standard role for everyone except Shane
      if (userEmail !== 'shanebriscoe709@gmail.com') {
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid), { 
            role: 'standard' 
          }, { merge: true });
          
          // Update local settings if it was incorrectly set to admin
          if (settings.value.role === 'admin') {
            settings.value.role = 'standard';
            showToast('Role updated to standard', 'info');
          }
        } catch (error) {
          console.error('Error verifying user role:', error);
        }
      }
    };

    // Transaction Management (Preserved original Firebase logic)
    const openAdd = () => {
      isEditing.value = false;
      entry.value = {
        amount: null,
        category: 'Groceries',
        asset: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      };
      showModal.value = true;
    };

    const openEdit = (transaction) => {
      isEditing.value = true;
      entry.value = { ...transaction };
      showModal.value = true;
    };

    const closeAll = () => {
      showModal.value = false;
      showNotifications.value = false;
      showFilters.value = false;
    };

    const saveEntry = async () => {
      if (!entry.value.amount || entry.value.amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
      }

      if (!entry.value.date) {
        entry.value.date = new Date().toISOString().split('T')[0];
      }

      try {
        const data = {
          ...entry.value,
          amount: Number(entry.value.amount),
          ownerId: auth.currentUser.uid
        };

        const { id, ...dataWithoutId } = data;

        if (isEditing.value) {
          await updateDoc(doc(db, "transactions", entry.value.id), dataWithoutId);
          showToast('Transaction updated successfully', 'success');
        } else {
          await addDoc(collection(db, "transactions"), dataWithoutId);
          showToast('Transaction added successfully', 'success');
        }

        closeAll();
      } catch (error) {
        console.error('Error saving transaction:', error);
        showToast('Error saving transaction', 'error');
      }
    };

    const confirmDelete = () => {
      showConfirmation(
        'Delete Transaction',
        'This action cannot be undone. Are you sure you want to delete this transaction?',
        'Delete',
        deleteTransaction
      );
    };

    const deleteTransaction = async () => {
      try {
        await deleteDoc(doc(db, "transactions", entry.value.id));
        showToast('Transaction deleted successfully', 'success');
        closeAll();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        showToast('Error deleting transaction', 'error');
      }
    };

    // Enhanced Features
    const toggleSort = () => {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
    };

    const refreshBalance = () => {
      showToast('Balance refreshed', 'success');
    };

    const updateSettings = async () => {
      if (!currentUser.value) return;
      
      try {
        await setDoc(doc(db, "users", currentUser.value.uid), {
          currency: settings.value.currency,
          notifications: settings.value.notifications
        }, { merge: true });
        showToast('Settings updated', 'success');
      } catch (error) {
        showToast('Error updating settings', 'error');
      }
    };

    const exportData = () => {
      const dataStr = JSON.stringify(transactions.value, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `vaultpro-transactions-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showToast('Data exported successfully', 'success');
    };

    // Confirmation System
    const showConfirmation = (title, message, action, callback) => {
      confirmTitle.value = title;
      confirmMessage.value = message;
      confirmAction.value = action;
      confirmCallback.value = callback;
      showConfirm.value = true;
    };

    const proceedConfirm = () => {
      if (confirmCallback.value) {
        confirmCallback.value();
      }
      cancelConfirm();
    };

    const cancelConfirm = () => {
      showConfirm.value = false;
      confirmCallback.value = null;
    };

    // ===== LIFECYCLE & FIREBASE INTEGRATION =====
    onMounted(() => {
      // 🔒 FIXED: Preserve original Firebase authentication logic with role security
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUser.value = { 
            name: user.email.split('@')[0].toUpperCase(), 
            uid: user.uid,
            email: user.email 
          };

          // 🔒 VERIFY USER ROLE ON LOGIN
          await verifyUserRole(user.email);

          // Listen to transactions (preserved original query)
          const q = query(
            collection(db, "transactions"), 
            where("ownerId", "==", user.uid), 
            orderBy("date", "desc")
          );
          
          onSnapshot(q, (snapshot) => {
            transactions.value = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
          });

          // 🔒 FIXED: Listen to user settings with role security
          onSnapshot(doc(db, "users", user.uid), (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              
              // 🔒 SECURITY: Double-check role assignment
              if (user.email !== 'shanebriscoe709@gmail.com' && userData.role === 'admin') {
                userData.role = 'standard';
                setDoc(doc(db, "users", user.uid), { role: 'standard' }, { merge: true });
              }
              
              settings.value = { 
                ...settings.value, 
                ...userData 
              };
            } else {
              // 🔒 SECURITY: Set default role for all new users
              const defaultUserData = { role: 'standard' };
              
              // ONLY Shane Briscoe gets admin role
              if (user.email === 'shanebriscoe709@gmail.com') {
                defaultUserData.role = 'admin';
              }
              
              // Create user document with appropriate role
              setDoc(doc(db, "users", user.uid), defaultUserData, { merge: true });
              
              // Update local settings
              settings.value = { 
                ...settings.value, 
                ...defaultUserData 
              };
            }
          });

        } else {
          currentUser.value = null;
          resetAppState();
        }
        
        // Hide loading screen
        setTimeout(() => {
          isLoading.value = false;
        }, 1000);
      });
    });

    // Keyboard shortcuts
    onMounted(() => {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAll();
          cancelConfirm();
        }
        if (e.key === '+' && !showModal.value && currentUser.value) {
          openAdd();
        }
      });
    });

    // ===== RETURN REACTIVE REFERENCES =====
    return {
      // State
      currentUser,
      currentTab,
      showModal,
      isEditing,
      transactions,
      toastMsg,
      toastType,
      toastIcon,
      
      // Authentication
      loginEmail,
      loginPass,
      loginError,
      loggingIn,
      showPassword,
      isLoading,
      
      // Enhanced features
      showNotifications,
      notifications,
      unreadCount,
      showFilters,
      filterCategory,
      filterMonth,
      sortOrder,
      showConfirm,
      confirmTitle,
      confirmMessage,
      confirmAction,
      showBackup,
      
      // Settings & Entry
      settings,
      entry,
      
      // Computed
      isAdmin,
      cashBalance,
      allCategories,
      recentTransactions,
      filteredTransactions,
      cryptoTransactions,
      monthlyIncome,
      monthlyExpenses,
      balanceTrend,
      balanceProgress,
      averageTransaction,
      cryptoHoldings,
      krakenTotal,
      availableMonths,
      userAvatarGradient,
      todayDate,
      
      // Methods
      formatNumber,
      formatDate,
      formatTime,
      getEmoji,
      getCategoryColor,
      isPositive,
      showToast,
      setTab,
      login,
      confirmLogout,
      logout,
      openAdd,
      openEdit,
      closeAll,
      saveEntry,
      confirmDelete,
      deleteTransaction,
      toggleSort,
      refreshBalance,
      updateSettings,
      exportData,
      proceedConfirm,
      cancelConfirm
    };
  }
}).mount('#app');