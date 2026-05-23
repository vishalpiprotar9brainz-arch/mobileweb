import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// 1. Detect and Validate Environment Variables
const env = import.meta.env;

const validateEnv = () => {
  const keys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = keys.filter(key => !env[key]);
  const isPlaceholder = keys.some(key => env[key] && (
    env[key] === 'your_api_key_here' || 
    env[key] === 'your_project_id.firebaseapp.com' ||
    env[key] === 'your_project_id' ||
    env[key] === 'your_project_id.appspot.com' ||
    env[key] === 'your_messaging_sender_id' ||
    env[key] === 'your_app_id_here' ||
    env[key].includes('placeholder') ||
    env[key].includes('FakeKey')
  ));
  
  return {
    isValid: missing.length === 0 && !isPlaceholder,
    missing,
    isPlaceholder
  };
};

const validation = validateEnv();
let useFallback = !validation.isValid;

let app;
let auth;
let db;
let storage;

if (!useFallback) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("[Firebase Config Validator] Real Firebase SDK initialized successfully.");
  } catch (error) {
    console.error("[Firebase Config Validator] Real Firebase initialization failed. Bypassing to Mock service:", error);
    useFallback = true;
  }
} else {
  console.warn(
    "[Firebase Config Validator] Running in Fallback Mode. Environment keys are missing or set to placeholder/mock values.",
    { missing: validation.missing, isPlaceholder: validation.isPlaceholder }
  );
}

// ----------------------------------------------------
// PREMIUM SEED DATA FOR FALLBACK MODE
// ----------------------------------------------------
const defaultCategories = [];

const defaultProducts = [];

const defaultPurchases = [];

const defaultSales = [];

const defaultInventoryHistory = [];

const defaultReports = [];

const defaultBanners = [];

const defaultSettings = {
  storeName: "AeroMobile Store",
  tagline: "Your Premium Destination for Flagship Mobile Devices",
  email: "support@aeromobile.com",
  phone: "+1 (800) 555-MOBI",
  address: "742 Cupertino, CA 95014",
  logoText: "AeroMobile",
  announcement: "⚡ Compare the latest flagship smartphone specifications here! ⚡"
};

// --- Fallback Data Helper Operations ---
const seedCollection = (collectionName) => {
  let data;
  if (collectionName === 'products') data = defaultProducts;
  else if (collectionName === 'categories') data = defaultCategories;
  else if (collectionName === 'banners') data = defaultBanners;
  else if (collectionName === 'settings') data = defaultSettings;
  else if (collectionName === 'purchases') data = defaultPurchases;
  else if (collectionName === 'sales') data = defaultSales;
  else if (collectionName === 'inventoryHistory') data = defaultInventoryHistory;
  else if (collectionName === 'reports') data = defaultReports;
  
  try {
    localStorage.setItem(`firebase_mock_${collectionName}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to seed ${collectionName} to localStorage:`, err);
  }
  return data;
};

const getCollectionData = (collectionName) => {
  if (window[`firebase_mock_in_memory_${collectionName}`]) {
    return window[`firebase_mock_in_memory_${collectionName}`];
  }
  const raw = localStorage.getItem(`firebase_mock_${collectionName}`);
  if (!raw) {
    return seedCollection(collectionName);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    return seedCollection(collectionName);
  }
};

const setCollectionData = (collectionName, data) => {
  try {
    localStorage.setItem(`firebase_mock_${collectionName}`, JSON.stringify(data));
  } catch (quotaError) {
    console.warn(`localStorage quota exceeded for ${collectionName}. Storing in memory fallback.`, quotaError);
    window[`firebase_mock_in_memory_${collectionName}`] = data;
  }
  window.dispatchEvent(new CustomEvent(`firebase-mock-sync-${collectionName}`, { detail: data }));
};

const mockListeners = {
  products: new Set(),
  categories: new Set(),
  banners: new Set(),
  settings: new Set(),
  purchases: new Set(),
  sales: new Set(),
  inventoryHistory: new Set(),
  reports: new Set()
};

const subscribeMock = (collectionName, callback) => {
  mockListeners[collectionName].add(callback);
  
  // Call initially with latest state
  const currentData = getCollectionData(collectionName);
  callback(currentData);
  
  const handleSync = (e) => {
    callback(e.detail);
  };
  
  window.addEventListener(`firebase-mock-sync-${collectionName}`, handleSync);
  
  return () => {
    mockListeners[collectionName].delete(callback);
    window.removeEventListener(`firebase-mock-sync-${collectionName}`, handleSync);
  };
};

const getMockUser = () => {
  const raw = localStorage.getItem('firebase_mock_user');
  return raw ? JSON.parse(raw) : null;
};

const setMockUser = (user) => {
  if (user) {
    localStorage.setItem('firebase_mock_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('firebase_mock_user');
  }
  window.dispatchEvent(new CustomEvent('firebase-mock-sync-auth', { detail: user }));
};

// ----------------------------------------------------
// DUAL-MODE SERVICE DEFINITIONS
// ----------------------------------------------------
export const dbService = {
  // --- PRODUCTS CRUD ---
  subscribeProducts: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(productsList);
      }, (error) => {
        console.error("Error subscribing to products collection:", error);
      });
    } else {
      return subscribeMock('products', callback);
    }
  },

  getDerivedStatus: (quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) return 'Out of Stock';
    if (qty <= 5) return 'Low Stock';
    return 'In Stock';
  },

  addProduct: async (productData) => {
    const qty = parseInt(productData.stockQuantity) || 0;
    const status = dbService.getDerivedStatus(qty);
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docData = {
        ...productData,
        price: parseFloat(productData.price) || 0,
        offerPrice: parseFloat(productData.offerPrice) || null,
        featured: Boolean(productData.featured),
        stockQuantity: qty,
        stockStatus: status,
        createdAt: new Date().getTime()
      };
      const docRef = await addDoc(collection(db, 'products'), docData);
      
      // Add inventory history
      await addDoc(collection(db, 'inventoryHistory'), {
        productId: docRef.id,
        productName: productData.name,
        changeType: 'manual_adjustment',
        quantityChanged: qty,
        previousStock: 0,
        newStock: qty,
        date: new Date().getTime(),
        notes: `Initial stock defined as ${qty}`
      });
      return docRef.id;
    } else {
      const products = getCollectionData('products');
      const newId = `prod-${Date.now()}`;
      const newProduct = {
        id: newId,
        ...productData,
        price: parseFloat(productData.price) || 0,
        offerPrice: parseFloat(productData.offerPrice) || null,
        featured: Boolean(productData.featured),
        stockQuantity: qty,
        stockStatus: status,
        createdAt: new Date().getTime()
      };
      products.unshift(newProduct);
      setCollectionData('products', products);

      // Add inventory history
      const history = getCollectionData('inventoryHistory');
      history.unshift({
        id: `hist-${Date.now()}`,
        productId: newId,
        productName: productData.name,
        changeType: 'manual_adjustment',
        quantityChanged: qty,
        previousStock: 0,
        newStock: qty,
        date: new Date().getTime(),
        notes: `Initial stock defined as ${qty}`
      });
      setCollectionData('inventoryHistory', history);

      return newProduct.id;
    }
  },

  updateProduct: async (id, productData) => {
    const qty = parseInt(productData.stockQuantity) || 0;
    const status = dbService.getDerivedStatus(qty);
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      
      let previousQty = 0;
      try {
        const prodRef = doc(db, 'products', id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          previousQty = prodSnap.data().stockQuantity || 0;
        }
      } catch (err) {
        console.warn("Failed to fetch product for stock log history:", err);
      }

      const docData = {
        ...productData,
        price: parseFloat(productData.price) || 0,
        offerPrice: parseFloat(productData.offerPrice) || null,
        featured: Boolean(productData.featured),
        stockQuantity: qty,
        stockStatus: status
      };
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, docData);

      if (previousQty !== qty) {
        await addDoc(collection(db, 'inventoryHistory'), {
          productId: id,
          productName: productData.name,
          changeType: 'manual_adjustment',
          quantityChanged: qty - previousQty,
          previousStock: previousQty,
          newStock: qty,
          date: new Date().getTime(),
          notes: `Manual stock adjustment from ${previousQty} to ${qty}`
        });
      }
    } else {
      const products = getCollectionData('products');
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const previousQty = products[idx].stockQuantity || 0;
        products[idx] = {
          ...products[idx],
          ...productData,
          price: parseFloat(productData.price) || 0,
          offerPrice: parseFloat(productData.offerPrice) || null,
          featured: Boolean(productData.featured),
          stockQuantity: qty,
          stockStatus: status
        };
        setCollectionData('products', products);

        if (previousQty !== qty) {
          const history = getCollectionData('inventoryHistory');
          history.unshift({
            id: `hist-${Date.now()}`,
            productId: id,
            productName: productData.name,
            changeType: 'manual_adjustment',
            quantityChanged: qty - previousQty,
            previousStock: previousQty,
            newStock: qty,
            date: new Date().getTime(),
            notes: `Manual stock adjustment from ${previousQty} to ${qty}`
          });
          setCollectionData('inventoryHistory', history);
        }
      }
    }
  },

  deleteProduct: async (id) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } else {
      let products = getCollectionData('products');
      products = products.filter(p => p.id !== id);
      setCollectionData('products', products);
    }
  },

  // --- CATEGORIES CRUD ---
  subscribeCategories: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      return onSnapshot(q, (snapshot) => {
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(categoriesList);
      }, (error) => {
        console.error("Error subscribing to categories collection:", error);
      });
    } else {
      return subscribeMock('categories', callback);
    }
  },

  addCategory: async (categoryName) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const nameTrimmed = categoryName.trim();
      if (!nameTrimmed) throw new Error("Category name cannot be empty.");
      const docData = {
        name: nameTrimmed,
        createdAt: new Date().getTime()
      };
      const docRef = await addDoc(collection(db, 'categories'), docData);
      return docRef.id;
    } else {
      const nameTrimmed = categoryName.trim();
      if (!nameTrimmed) throw new Error("Category name cannot be empty.");
      const categories = getCollectionData('categories');
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: nameTrimmed,
        createdAt: new Date().getTime()
      };
      categories.push(newCategory);
      categories.sort((a, b) => a.name.localeCompare(b.name));
      setCollectionData('categories', categories);
      return newCategory.id;
    }
  },

  deleteCategory: async (id) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } else {
      let categories = getCollectionData('categories');
      categories = categories.filter(c => c.id !== id);
      setCollectionData('categories', categories);
    }
  },

  // --- BANNERS CRUD ---
  subscribeBanners: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      return onSnapshot(collection(db, 'banners'), (snapshot) => {
        const bannersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(bannersList);
      }, (error) => {
        console.error("Error subscribing to banners collection:", error);
      });
    } else {
      return subscribeMock('banners', callback);
    }
  },

  addBanner: async (bannerData) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = await addDoc(collection(db, 'banners'), bannerData);
      return docRef.id;
    } else {
      const banners = getCollectionData('banners');
      const newBanner = {
        id: `ban-${Date.now()}`,
        ...bannerData
      };
      banners.push(newBanner);
      setCollectionData('banners', banners);
      return newBanner.id;
    }
  },

  updateBanner: async (id, bannerData) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = doc(db, 'banners', id);
      await setDoc(docRef, bannerData, { merge: true });
    } else {
      const banners = getCollectionData('banners');
      const idx = banners.findIndex(b => b.id === id);
      if (idx !== -1) {
        banners[idx] = {
          ...banners[idx],
          ...bannerData
        };
        setCollectionData('banners', banners);
      }
    }
  },

  deleteBanner: async (id) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = doc(db, 'banners', id);
      await deleteDoc(docRef);
    } else {
      let banners = getCollectionData('banners');
      banners = banners.filter(b => b.id !== id);
      setCollectionData('banners', banners);
    }
  },

  // --- WEBSITE SETTINGS ---
  subscribeSettings: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      return onSnapshot(doc(db, 'settings', 'website'), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        } else {
          callback({
            storeName: "AeroMobile Store",
            tagline: "Your Premium Destination for Flagship Mobile Devices",
            email: "support@aeromobile.com",
            phone: "+1 (800) 555-MOBI",
            address: "742 Cupertino, CA 95014",
            logoText: "AeroMobile",
            announcement: "⚡ Compare premium flagship mobile specifications in real-time! ⚡"
          });
        }
      });
    } else {
      return subscribeMock('settings', callback);
    }
  },

  updateSettings: async (settingsData) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      await setDoc(doc(db, 'settings', 'website'), settingsData);
    } else {
      setCollectionData('settings', settingsData);
    }
  },

  // --- PURCHASES CRUD ---
  subscribePurchases: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'purchases'), orderBy('purchaseDate', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const purchasesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(purchasesList);
      }, (error) => {
        console.error("Error subscribing to purchases collection:", error);
      });
    } else {
      return subscribeMock('purchases', callback);
    }
  },

  addPurchase: async (purchaseData) => {
    const qty = parseInt(purchaseData.quantity) || 0;
    const price = parseFloat(purchaseData.purchasePrice) || 0;
    const date = purchaseData.purchaseDate || new Date().getTime();
    
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      
      const docRef = await addDoc(collection(db, 'purchases'), {
        ...purchaseData,
        quantity: qty,
        purchasePrice: price,
        purchaseDate: date
      });
      
      const prodRef = doc(db, 'products', purchaseData.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data();
        const prevStock = prodData.stockQuantity || 0;
        const newStock = prevStock + qty;
        const newStatus = dbService.getDerivedStatus(newStock);
        
        await updateDoc(prodRef, {
          stockQuantity: newStock,
          stockStatus: newStatus
        });
        
        await addDoc(collection(db, 'inventoryHistory'), {
          productId: purchaseData.productId,
          productName: prodData.name,
          changeType: 'purchase',
          quantityChanged: qty,
          previousStock: prevStock,
          newStock: newStock,
          date: date,
          notes: `Purchased ${qty} units from ${purchaseData.supplierName}`
        });
      }
      return docRef.id;
    } else {
      const purchases = getCollectionData('purchases');
      const newPurchase = {
        id: `purch-${Date.now()}`,
        ...purchaseData,
        quantity: qty,
        purchasePrice: price,
        purchaseDate: date
      };
      purchases.unshift(newPurchase);
      setCollectionData('purchases', purchases);
      
      const products = getCollectionData('products');
      const idx = products.findIndex(p => p.id === purchaseData.productId);
      if (idx !== -1) {
        const prevStock = products[idx].stockQuantity || 0;
        const newStock = prevStock + qty;
        const newStatus = dbService.getDerivedStatus(newStock);
        
        products[idx].stockQuantity = newStock;
        products[idx].stockStatus = newStatus;
        setCollectionData('products', products);
        
        const history = getCollectionData('inventoryHistory');
        history.unshift({
          id: `hist-${Date.now()}`,
          productId: purchaseData.productId,
          productName: products[idx].name,
          changeType: 'purchase',
          quantityChanged: qty,
          previousStock: prevStock,
          newStock: newStock,
          date: date,
          notes: `Purchased ${qty} units from ${purchaseData.supplierName}`
        });
        setCollectionData('inventoryHistory', history);
      }
      return newPurchase.id;
    }
  },

  // --- SALES CRUD ---
  subscribeSales: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'sales'), orderBy('saleDate', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const salesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(salesList);
      }, (error) => {
        console.error("Error subscribing to sales collection:", error);
      });
    } else {
      return subscribeMock('sales', callback);
    }
  },

  addSale: async (saleData) => {
    const qty = parseInt(saleData.quantity) || 0;
    const price = parseFloat(saleData.sellingPrice) || 0;
    const date = saleData.saleDate || new Date().getTime();
    
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      
      const docRef = await addDoc(collection(db, 'sales'), {
        ...saleData,
        quantity: qty,
        sellingPrice: price,
        saleDate: date
      });
      
      const prodRef = doc(db, 'products', saleData.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data();
        const prevStock = prodData.stockQuantity || 0;
        const newStock = Math.max(0, prevStock - qty);
        const newStatus = dbService.getDerivedStatus(newStock);
        
        await updateDoc(prodRef, {
          stockQuantity: newStock,
          stockStatus: newStatus
        });
        
        await addDoc(collection(db, 'inventoryHistory'), {
          productId: saleData.productId,
          productName: prodData.name,
          changeType: 'sale',
          quantityChanged: -qty,
          previousStock: prevStock,
          newStock: newStock,
          date: date,
          notes: `Sold ${qty} units`
        });
      }
      return docRef.id;
    } else {
      const sales = getCollectionData('sales');
      const newSale = {
        id: `sale-${Date.now()}`,
        ...saleData,
        quantity: qty,
        sellingPrice: price,
        saleDate: date
      };
      sales.unshift(newSale);
      setCollectionData('sales', sales);
      
      const products = getCollectionData('products');
      const idx = products.findIndex(p => p.id === saleData.productId);
      if (idx !== -1) {
        const prevStock = products[idx].stockQuantity || 0;
        const newStock = Math.max(0, prevStock - qty);
        const newStatus = dbService.getDerivedStatus(newStock);
        
        products[idx].stockQuantity = newStock;
        products[idx].stockStatus = newStatus;
        setCollectionData('products', products);
        
        const history = getCollectionData('inventoryHistory');
        history.unshift({
          id: `hist-${Date.now()}`,
          productId: saleData.productId,
          productName: products[idx].name,
          changeType: 'sale',
          quantityChanged: -qty,
          previousStock: prevStock,
          newStock: newStock,
          date: date,
          notes: `Sold ${qty} units`
        });
        setCollectionData('inventoryHistory', history);
      }
      return newSale.id;
    }
  },

  // --- INVENTORY HISTORY ---
  subscribeInventoryHistory: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'inventoryHistory'), orderBy('date', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const historyList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(historyList);
      }, (error) => {
        console.error("Error subscribing to inventoryHistory collection:", error);
      });
    } else {
      return subscribeMock('inventoryHistory', callback);
    }
  },

  // --- REPORTS CRUD ---
  subscribeReports: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      const q = query(collection(db, 'reports'), orderBy('date', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const reportsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(reportsList);
      }, (error) => {
        console.error("Error subscribing to reports collection:", error);
      });
    } else {
      return subscribeMock('reports', callback);
    }
  },

  addReport: async (reportData) => {
    if (!useFallback) {
      if (!db) throw new Error("Firebase database not initialized.");
      const docRef = await addDoc(collection(db, 'reports'), {
        ...reportData,
        date: new Date().getTime()
      });
      return docRef.id;
    } else {
      const reports = getCollectionData('reports');
      const newReport = {
        id: `rep-${Date.now()}`,
        ...reportData,
        date: new Date().getTime()
      };
      reports.unshift(newReport);
      setCollectionData('reports', reports);
      return newReport.id;
    }
  },

  // --- STORAGE UPLOADS ---
  uploadImage: async (file) => {
    if (!useFallback) {
      if (!storage) throw new Error("Firebase storage not initialized.");
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

export const authService = {
  getCurrentUserSync: () => {
    if (!useFallback) {
      return auth ? auth.currentUser : null;
    } else {
      return getMockUser();
    }
  },

  login: async (email, password) => {
    // Generate unique sessionId
    const sessionId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
    
    // Set the session ID first so that any snapshot listeners triggered during login already see it!
    sessionStorage.setItem('admin_session_id', sessionId);
    
    if (!useFallback) {
      if (!auth) {
        sessionStorage.removeItem('admin_session_id');
        throw new Error("Firebase Authentication not initialized.");
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (db) {
          await setDoc(doc(db, 'sessions', 'active_admin'), {
            sessionId,
            email,
            loginTime: Date.now(),
            lastActive: Date.now()
          });
        }
        
        return userCredential.user;
      } catch (err) {
        sessionStorage.removeItem('admin_session_id');
        throw err;
      }
    } else {
      // Security Enforcement: Mock authentication is disabled in production builds.
      // All authentication must use real Firebase Auth (signInWithEmailAndPassword).
      throw new Error("Mock authentication is disabled. Please configure real Firebase credentials in .env to login.");
    }
  },

  logout: async () => {
    sessionStorage.removeItem('admin_session_id');
    if (!useFallback) {
      if (db) {
        try {
          await deleteDoc(doc(db, 'sessions', 'active_admin'));
        } catch (err) {
          console.warn("Failed to delete session doc:", err);
        }
      }
      if (!auth) return;
      await signOut(auth);
    } else {
      localStorage.removeItem('firebase_mock_active_admin_session');
      window.dispatchEvent(new CustomEvent('firebase-mock-sync-session', { detail: null }));
      setMockUser(null);
    }
  },

  subscribeAuth: (callback) => {
    if (!useFallback) {
      if (!auth) {
        callback(null);
        return () => {};
      }
      return onAuthStateChanged(auth, callback);
    } else {
      const handleSync = (e) => {
        callback(e.detail);
      };
      window.addEventListener('firebase-mock-sync-auth', handleSync);
      callback(getMockUser());
      return () => {
        window.removeEventListener('firebase-mock-sync-auth', handleSync);
      };
    }
  },

  subscribeSession: (callback) => {
    if (!useFallback) {
      if (!db) return () => {};
      return onSnapshot(doc(db, 'sessions', 'active_admin'), (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        } else {
          callback(null);
        }
      });
    } else {
      const getLatestSession = () => {
        const raw = localStorage.getItem('firebase_mock_active_admin_session');
        return raw ? JSON.parse(raw) : null;
      };
      
      const handleStorage = (e) => {
        if (e.key === 'firebase_mock_active_admin_session') {
          callback(getLatestSession());
        }
      };
      
      const handleCustom = () => {
        callback(getLatestSession());
      };
      
      window.addEventListener('storage', handleStorage);
      window.addEventListener('firebase-mock-sync-session', handleCustom);
      callback(getLatestSession());
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('firebase-mock-sync-session', handleCustom);
      };
    }
  }
};

// Always export true to downstream checkers since the app will function correctly in both modes.
export const isFirebaseConfigured = true;
export { auth, db, storage };
