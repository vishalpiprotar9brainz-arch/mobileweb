import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminT } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../firebase';
import { useToast } from '../components/Toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Image as ImageIcon, 
  Smartphone, 
  LogOut, 
  Save, 
  X, 
  Check, 
  Upload, 
  Layers, 
  Star, 
  Search,
  Sparkles,
  ExternalLink,
  LayoutDashboard,
  Tags,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  DollarSign,
  Package,
  History,
  Download,
  Printer,
  Languages,
  Sun,
  Moon
} from 'lucide-react';

export const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { T, toggle: toggleLang, label: langLabel, isGujarati } = useAdminT();
  const { adminTheme, toggleAdminTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path) => {
    if (path.endsWith('/products')) return 'products';
    if (path.endsWith('/categories')) return 'categories';
    if (path.endsWith('/banners')) return 'banners';
    if (path.endsWith('/settings')) return 'settings';
    if (path.endsWith('/purchases')) return 'purchases';
    if (path.endsWith('/sales')) return 'sales';
    if (path.endsWith('/reports')) return 'reports';
    return 'overview';
  };

  // Tab State
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Data States
  const [products, setProducts] = useState([]);
  const [dbBanners, setDbBanners] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    storeName: '', tagline: '', email: '', phone: '', address: '', logoText: '', announcement: ''
  });

  // Purchases, Sales, History States
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  // Form States for Purchases and Sales
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantity: '',
    supplierName: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [salesForm, setSalesForm] = useState({
    productId: '',
    quantity: '',
    sellingPrice: '',
    saleDate: new Date().toISOString().split('T')[0]
  });

  // Reporting Filters
  const [reportFilter, setReportFilter] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', brand: '', price: '', offerPrice: '', description: '',
    category: 'Apple', stockQuantity: 0, stockStatus: 'In Stock', featured: false, images: []
  });
  
  // Custom specification state management (Key-Value)
  const [specifications, setSpecifications] = useState([
    { key: 'OS', value: '' },
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' },
    { key: 'Storage', value: '' },
    { key: 'Display', value: '' },
    { key: 'Camera', value: '' },
    { key: 'Battery', value: '' }
  ]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Search/Filters in Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Derived metrics & reporting computations
  const totalStockAvailable = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalPhonesPurchased = purchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalPhonesSold = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + ((s.quantity || 0) * (s.sellingPrice || 0)), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + ((p.stockQuantity || 0) * (p.price || 0)), 0);
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5).length;
  const outOfStockCount = products.filter(p => (p.stockQuantity || 0) === 0).length;

  const getFilteredData = (items, dateField) => {
    const now = new Date();
    let startTimestamp = 0;
    
    if (reportFilter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTimestamp = todayStart.getTime();
    } else if (reportFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startTimestamp = sevenDaysAgo.getTime();
    } else if (reportFilter === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startTimestamp = thirtyDaysAgo.getTime();
    } else if (reportFilter === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      startTimestamp = sixMonthsAgo.getTime();
    } else if (reportFilter === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startTimestamp = oneYearAgo.getTime();
    } else if (reportFilter === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      if (end) {
        const parsedEnd = new Date(end);
        parsedEnd.setHours(23, 59, 59, 999);
        return items.filter(item => {
          const t = item[dateField];
          if (start && t < new Date(start).getTime()) return false;
          if (end && t > parsedEnd.getTime()) return false;
          return true;
        });
      }
      return items.filter(item => {
        const t = item[dateField];
        if (start && t < new Date(start).getTime()) return false;
        return true;
      });
    }

    return items.filter(item => item[dateField] >= startTimestamp);
  };

  const filteredPurchases = getFilteredData(purchases, 'purchaseDate');
  const filteredSales = getFilteredData(sales, 'saleDate');

  const filteredPhonesPurchased = filteredPurchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const filteredPurchasesCost = filteredPurchases.reduce((acc, p) => acc + ((p.quantity || 0) * (p.purchasePrice || 0)), 0);
  const filteredPhonesSold = filteredSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  const filteredSalesRevenue = filteredSales.reduce((acc, s) => acc + ((s.quantity || 0) * (s.sellingPrice || 0)), 0);
  const filteredProfit = filteredSalesRevenue - filteredPurchasesCost;

  const brandSalesVolume = {};
  filteredSales.forEach(s => {
    const prod = products.find(p => p.id === s.productId);
    const brand = prod ? prod.brand : 'Unknown';
    brandSalesVolume[brand] = (brandSalesVolume[brand] || 0) + (s.quantity || 0);
  });
  let topBrand = 'N/A';
  let topBrandVolume = 0;
  Object.entries(brandSalesVolume).forEach(([brand, vol]) => {
    if (vol > topBrandVolume) {
      topBrand = brand;
      topBrandVolume = vol;
    }
  });

  const modelSalesVolume = {};
  filteredSales.forEach(s => {
    modelSalesVolume[s.productName] = (modelSalesVolume[s.productName] || 0) + (s.quantity || 0);
  });
  let topModel = 'N/A';
  let topModelVolume = 0;
  Object.entries(modelSalesVolume).forEach(([model, vol]) => {
    if (vol > topModelVolume) {
      topModel = model;
      topModelVolume = vol;
    }
  });

  // Authenticate user & Redirect if not authorized
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  // Subscribe to DB collections
  useEffect(() => {
    if (!currentUser) return;

    const unsubProducts = dbService.subscribeProducts((data) => {
      setProducts(data);
    });

    const unsubBanners = dbService.subscribeBanners((data) => {
      setDbBanners(data);
    });

    const unsubCategories = dbService.subscribeCategories((data) => {
      setCategories(data);
    });

    const unsubSettings = dbService.subscribeSettings((data) => {
      if (data) setSiteSettings(data);
    });

    const unsubPurchases = dbService.subscribePurchases((data) => {
      setPurchases(data);
    });

    const unsubSales = dbService.subscribeSales((data) => {
      setSales(data);
    });

    const unsubHistory = dbService.subscribeInventoryHistory((data) => {
      setInventoryHistory(data);
    });

    return () => {
      unsubProducts();
      unsubBanners();
      unsubCategories();
      unsubSettings();
      unsubPurchases();
      unsubSales();
      unsubHistory();
    };
  }, [currentUser]);

  // Sync local banners list from database banners
  useEffect(() => {
    if (banners.length === 0 && dbBanners.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBanners(JSON.parse(JSON.stringify(dbBanners)));
    }
  }, [dbBanners, banners.length]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      showToast("Category name cannot be empty.", "warning");
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showToast(`Category "${name}" already exists.`, "warning");
      return;
    }

    setAddingCategory(true);
    try {
      await dbService.addCategory(name);
      showToast(`Category "${name}" added successfully.`, "success");
      setNewCategoryName('');
    } catch (e) {
      console.error("Error", e);
      showToast("Failed to add category.", "error");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await dbService.deleteCategory(id);
        showToast(`Category "${name}" deleted.`, "success");
      } catch (e) {
        showToast("Failed to delete category.", "error");
      }
    }
  };

  // Logout trigger
  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out of administrator panel.", "info");
      navigate('/');
    } catch (e) {
      showToast("Error signing out.", "error");
    }
  };

  // ----------------------------------------------------
  // PRODUCT MANAGEMENT LOGIC
  // ----------------------------------------------------

  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '', brand: '', price: '', offerPrice: '', description: '',
      category: categories[0]?.name || 'Apple', stockQuantity: 0, stockStatus: 'In Stock', featured: false, images: []
    });
    setSpecifications([
      { key: 'OS', value: '' },
      { key: 'Processor', value: '' },
      { key: 'RAM', value: '' },
      { key: 'Storage', value: '' },
      { key: 'Display', value: '' },
      { key: 'Camera', value: '' },
      { key: 'Battery', value: '' }
    ]);
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      offerPrice: product.offerPrice || '',
      description: product.description || '',
      category: product.category || categories[0]?.name || 'Apple',
      stockQuantity: product.stockQuantity || 0,
      stockStatus: product.stockStatus || 'In Stock',
      featured: product.featured || false,
      images: product.images || []
    });

    // Populate specs array from object
    const specsArray = [];
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([k, v]) => {
        specsArray.push({ key: k, value: v });
      });
    } else {
      specsArray.push(
        { key: 'OS', value: '' },
        { key: 'Processor', value: '' },
        { key: 'RAM', value: '' },
        { key: 'Storage', value: '' },
        { key: 'Display', value: '' },
        { key: 'Camera', value: '' },
        { key: 'Battery', value: '' }
      );
    }
    setSpecifications(specsArray);
    setShowProductModal(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Image Upload handler
  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    showToast(`Uploading ${files.length} file(s)...`, "info");

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await dbService.uploadImage(file);
        uploadedUrls.push(url);
      }
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showToast("Images uploaded and linked successfully.", "success");
    } catch (e) {
      console.error("Error", e);
      showToast("Failed to upload image assets.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveFormImage = (idxToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  // Custom spec rows management
  const handleSpecValueChange = (idx, val) => {
    const updated = [...specifications];
    updated[idx].value = val;
    setSpecifications(updated);
  };

  const handleAddCustomSpec = (e) => {
    e.preventDefault();
    if (!newSpecKey.trim()) return;

    // Check if key already exists
    if (specifications.some(s => s.key.toLowerCase() === newSpecKey.trim().toLowerCase())) {
      showToast(`Spec key "${newSpecKey}" already exists!`, "warning");
      return;
    }

    setSpecifications(prev => [...prev, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey('');
    setNewSpecValue('');
    showToast("Custom specification row added.", "success");
  };

  const handleRemoveSpec = (idx) => {
    setSpecifications(prev => prev.filter((_, i) => i !== idx));
  };

  // Save Product trigger
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand || !productForm.price) {
      showToast("Name, Brand, and Price are required fields.", "warning");
      return;
    }

    setSavingProduct(true);

    // Convert specs array back to object format (filtering out empty fields)
    const specsObj = {};
    specifications.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const fullProductData = {
      ...productForm,
      specifications: specsObj
    };

    try {
      if (editingProductId) {
        await dbService.updateProduct(editingProductId, fullProductData);
        showToast("Product updated successfully.", "success");
      } else {
        await dbService.addProduct(fullProductData);
        showToast("New product created successfully.", "success");
      }
      setShowProductModal(false);
    } catch (e) {
      console.error("Error", e);
      showToast("Error saving product details.", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name}?`)) {
      try {
        await dbService.deleteProduct(id);
        showToast("Product deleted successfully.", "success");
      } catch (e) {
        showToast("Failed to delete product.", "error");
      }
    }
  };

  // Fast toggles for stock/featured inside inventory list
  const toggleProductFeatured = async (product) => {
    try {
      await dbService.updateProduct(product.id, {
        ...product,
        featured: !product.featured
      });
      showToast(`${product.name} featured state toggled.`, "success");
    } catch (e) {
      showToast("Toggle error.", "error");
    }
  };

  const toggleProductStock = async (product) => {
    const isAvailable = (product.stockQuantity || 0) > 0 || product.stockStatus === 'In Stock' || product.stockStatus === 'Low Stock';
    const nextQty = isAvailable ? 0 : 10;
    try {
      await dbService.updateProduct(product.id, {
        ...product,
        stockQuantity: nextQty
      });
      showToast(`${product.name} stock level toggled to ${nextQty} units.`, "success");
    } catch (e) {
      showToast("Toggle error.", "error");
    }
  };

  const handlePurchaseInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'productId' && value) {
        const prod = products.find(p => p.id === value);
        if (prod) {
          updated.purchasePrice = prod.price;
        }
      }
      return updated;
    });
  };

  const handleSalesInputChange = (e) => {
    const { name, value } = e.target;
    setSalesForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'productId' && value) {
        const prod = products.find(p => p.id === value);
        if (prod) {
          updated.sellingPrice = prod.offerPrice || prod.price;
        }
      }
      return updated;
    });
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    const { productId, quantity, supplierName, purchasePrice, purchaseDate } = purchaseForm;
    
    if (!productId) {
      showToast("Please select a product.", "warning");
      return;
    }
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      showToast("Quantity must be at least 1.", "warning");
      return;
    }
    const price = parseFloat(purchasePrice) || 0;
    if (price <= 0) {
      showToast("Purchase price must be greater than 0.", "warning");
      return;
    }
    if (!supplierName.trim()) {
      showToast("Please enter supplier name.", "warning");
      return;
    }

    const selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) {
      showToast("Selected product not found.", "error");
      return;
    }

    try {
      await dbService.addPurchase({
        productId,
        productName: selectedProduct.name,
        quantity: qty,
        purchasePrice: price,
        supplierName: supplierName.trim(),
        purchaseDate: new Date(purchaseDate).getTime()
      });
      showToast(`Purchase recorded: ${qty} units of ${selectedProduct.name}.`, "success");
      setPurchaseForm({
        productId: '',
        quantity: '',
        supplierName: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.error("Error", e);
      showToast("Failed to record purchase.", "error");
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    const { productId, quantity, sellingPrice, saleDate } = salesForm;
    
    if (!productId) {
      showToast("Please select a product.", "warning");
      return;
    }
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      showToast("Quantity must be at least 1.", "warning");
      return;
    }
    const price = parseFloat(sellingPrice) || 0;
    if (price <= 0) {
      showToast("Selling price must be greater than 0.", "warning");
      return;
    }

    const selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) {
      showToast("Selected product not found.", "error");
      return;
    }

    const availableStock = selectedProduct.stockQuantity || 0;
    if (qty > availableStock) {
      showToast(`Insufficient stock. Only ${availableStock} units available.`, "warning");
      return;
    }

    try {
      await dbService.addSale({
        productId,
        productName: selectedProduct.name,
        quantity: qty,
        sellingPrice: price,
        saleDate: new Date(saleDate).getTime()
      });
      showToast(`Sale recorded: ${qty} units of ${selectedProduct.name}.`, "success");
      setSalesForm({
        productId: '',
        quantity: '',
        sellingPrice: '',
        saleDate: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.error("Error", e);
      showToast("Failed to record sale.", "error");
    }
  };

  const exportCSV = () => {
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [];
    rows.push(["AEROMOBILE INVENTORY & SALES REPORT"]);
    rows.push(["Report Period", reportFilter.toUpperCase()]);
    rows.push(["Generated At", new Date().toLocaleString()]);
    rows.push([]);

    rows.push(["METRIC", "VALUE"]);
    rows.push(["Total Sales Revenue", `$${totalRevenue.toFixed(2)}`]);
    rows.push(["Total Stock Available", totalStockAvailable]);
    rows.push(["Total Phones Sold", totalPhonesSold]);
    rows.push(["Total Phones Purchased", totalPhonesPurchased]);
    rows.push(["Low Stock Count", lowStockCount]);
    rows.push(["Out of Stock Count", outOfStockCount]);
    rows.push([]);

    rows.push(["SALES RECORD"]);
    rows.push(["Transaction ID", "Product Name", "Quantity Sold", "Selling Price", "Total Revenue", "Date"]);
    filteredSales.forEach(s => {
      rows.push([
        s.id,
        s.productName,
        s.quantity,
        s.sellingPrice,
        s.quantity * s.sellingPrice,
        new Date(s.saleDate).toLocaleDateString()
      ]);
    });
    rows.push([]);

    rows.push(["PURCHASES RECORD"]);
    rows.push(["Purchase ID", "Product Name", "Quantity Purchased", "Purchase Price", "Total Cost", "Supplier Name", "Date"]);
    filteredPurchases.forEach(p => {
      rows.push([
        p.id,
        p.productName,
        p.quantity,
        p.purchasePrice,
        p.quantity * p.purchasePrice,
        p.supplierName,
        new Date(p.purchaseDate).toLocaleDateString()
      ]);
    });

    const csvContent = rows.map(r => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // eslint-disable-next-line react-hooks/purity
    link.setAttribute("download", `aeromobile_report_${reportFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report exported successfully.", "success");
  };

  // --- REPORTING GRAPHIC COMPUTATION HELPERS ---
  const getStockAtTime = (timestamp) => {
    let stock = totalStockAvailable;
    const actionsAfter = inventoryHistory.filter(h => h.date > timestamp);
    actionsAfter.forEach(h => {
      stock -= h.quantityChanged;
    });
    return Math.max(0, stock);
  };

  const getChartDataPoints = (items, dateField, valueField, filterType, count = 6) => {
    const now = new Date();
    let startTimestamp = 0;
    
    if (filterType === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTimestamp = todayStart.getTime();
    } else if (filterType === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startTimestamp = sevenDaysAgo.getTime();
    } else if (filterType === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startTimestamp = thirtyDaysAgo.getTime();
    } else if (filterType === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      startTimestamp = sixMonthsAgo.getTime();
    } else if (filterType === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startTimestamp = oneYearAgo.getTime();
    } else if (filterType === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      startTimestamp = start ? start.getTime() : now.getTime() - 7 * 24 * 60 * 60 * 1000;
    }

    const endTimestamp = filterType === 'custom' && customEndDate 
      ? new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1 
      : now.getTime();

    const timeDiff = endTimestamp - startTimestamp;
    const intervalLength = timeDiff / count;
    
    const intervals = [];
    for (let i = 0; i < count; i++) {
      const intervalStart = startTimestamp + i * intervalLength;
      const intervalEnd = intervalStart + intervalLength;
      
      let label = '';
      const dateObj = new Date(intervalStart + intervalLength / 2);
      if (filterType === 'today') {
        // label = `${dateObj.getHours()}:00`;
      } else if (filterType === '7days' || filterType === '30days' || filterType === 'custom') {
        label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else {
        label = dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
      
      const totalVal = items
        .filter(item => item[dateField] >= intervalStart && item[dateField] < intervalEnd)
        .reduce((sum, item) => sum + (valueField === 'revenue' 
          ? ((item.quantity || 0) * (item.sellingPrice || 0)) 
          : valueField === 'cost'
            ? ((item.quantity || 0) * (item.purchasePrice || 0))
            : (item[valueField] || 0)), 0);
            
      intervals.push({ label, value: totalVal });
    }
    
    return intervals;
  };

  const getStockTrendPoints = (filterType, count = 6) => {
    const now = new Date();
    let startTimestamp = 0;
    
    if (filterType === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTimestamp = todayStart.getTime();
    } else if (filterType === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startTimestamp = sevenDaysAgo.getTime();
    } else if (filterType === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startTimestamp = thirtyDaysAgo.getTime();
    } else if (filterType === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      startTimestamp = sixMonthsAgo.getTime();
    } else if (filterType === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startTimestamp = oneYearAgo.getTime();
    } else if (filterType === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      startTimestamp = start ? start.getTime() : now.getTime() - 7 * 24 * 60 * 60 * 1000;
    }

    const endTimestamp = filterType === 'custom' && customEndDate 
      ? new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1 
      : now.getTime();

    const timeDiff = endTimestamp - startTimestamp;
    const intervalLength = timeDiff / count;
    
    const points = [];
    for (let i = 0; i < count; i++) {
      const intervalEnd = startTimestamp + (i + 1) * intervalLength;
      
      let label = '';
      const dateObj = new Date(intervalEnd - intervalLength / 2);
      if (filterType === 'today') {
        // label = `${dateObj.getHours()}:00`;
      } else if (filterType === '7days' || filterType === '30days' || filterType === 'custom') {
        label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else {
        label = dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
      
      const stockVal = getStockAtTime(intervalEnd);
      points.push({ label, value: stockVal });
    }
    return points;
  };

  const getBrandShareData = () => {
    const brandSales = {};
    filteredSales.forEach(s => {
      const prod = products.find(p => p.id === s.productId);
      const brand = prod ? prod.brand : 'Other';
      brandSales[brand] = (brandSales[brand] || 0) + (s.quantity || 0);
    });

    const totalSold = Object.values(brandSales).reduce((sum, v) => sum + v, 0);
    if (totalSold === 0) return [];

    const colors = [
      '#6366f1',
      '#06b6d4',
      '#10b981',
      '#f59e0b',
      '#ec4899',
      '#8b5cf6'
    ];

    let accumulatedPercentage = 0;
    return Object.entries(brandSales).map(([brand, quantity], idx) => {
      const percentage = (quantity / totalSold) * 100;
      const item = {
        brand,
        quantity,
        percentage,
        color: colors[idx % colors.length],
        accumulatedPercentage
      };
      accumulatedPercentage += percentage;
      return item;
    });
  };

  const renderSalesChartGraphic = () => {
    const points = getChartDataPoints(sales, 'saleDate', 'revenue', reportFilter);
    const maxVal = Math.max(...points.map(p => p.value), 100);
    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;
    
    const coords = points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (p.value / maxVal) * (height - 2 * paddingY);
      return { x, y, label: p.label, value: p.value };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaPath = coords.length > 0 
      ? `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z` 
      : '';

    return (
      <svg viewBox="0 0 500 200" className="w-full h-48 sm:h-64 text-slate-200 dark:text-slate-700/50">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingY + ratio * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="currentColor"
              strokeDasharray="4 4"
            />
          );
        })}
        {areaPath && <path d={areaPath} fill="url(#salesGrad)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {coords.map((c, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={c.x}
              cy={c.y}
              r="4.5"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-200 group-hover:r-6"
            />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect
                x={c.x - 45}
                y={c.y - 28}
                width="90"
                height="18"
                rx="4"
                fill="#1e293b"
              />
              <text
                x={c.x}
                y={c.y - 16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
              >
                ${c.value.toFixed(2)}
              </text>
            </g>
          </g>
        ))}
        {coords.map((c, idx) => (
          <text
            key={idx}
            x={c.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            className="fill-light-muted dark:fill-dark-muted"
          >
            {c.label}
          </text>
        ))}
      </svg>
    );
  };

  const renderPurchaseChartGraphic = () => {
    const points = getChartDataPoints(purchases, 'purchaseDate', 'cost', reportFilter);
    const maxVal = Math.max(...points.map(p => p.value), 100);
    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;
    
    return (
      <svg viewBox="0 0 500 200" className="w-full h-48 sm:h-64 text-slate-200 dark:text-slate-700/50">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingY + ratio * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="currentColor"
              strokeDasharray="4 4"
            />
          );
        })}
        {points.map((p, idx) => {
          const barWidth = 24;
          const spacing = (width - 2 * paddingX) / points.length;
          const x = paddingX + idx * spacing + (spacing - barWidth) / 2;
          const barHeight = (p.value / maxVal) * (height - 2 * paddingY);
          const y = height - paddingY - barHeight;
          return (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="#10b981"
                className="transition-all duration-200 group-hover:opacity-90"
              />
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={x + barWidth / 2 - 45}
                  y={y - 28}
                  width="90"
                  height="18"
                  rx="4"
                  fill="#1e293b"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 16}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  ${p.value.toFixed(2)}
                </text>
              </g>
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                className="fill-light-muted dark:fill-dark-muted"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderStockChartGraphic = () => {
    const points = getStockTrendPoints(reportFilter);
    const maxVal = Math.max(...points.map(p => p.value), 10);
    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;
    
    const coords = points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (p.value / maxVal) * (height - 2 * paddingY);
      return { x, y, label: p.label, value: p.value };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

    return (
      <svg viewBox="0 0 500 200" className="w-full h-48 sm:h-64 text-slate-200 dark:text-slate-700/50">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingY + ratio * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="currentColor"
              strokeDasharray="4 4"
            />
          );
        })}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {coords.map((c, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={c.x}
              cy={c.y}
              r="4.5"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-200 group-hover:r-6"
            />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect
                x={c.x - 35}
                y={c.y - 28}
                width="70"
                height="18"
                rx="4"
                fill="#1e293b"
              />
              <text
                x={c.x}
                y={c.y - 16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
              >
                {c.value} units
              </text>
            </g>
          </g>
        ))}
        {coords.map((c, idx) => (
          <text
            key={idx}
            x={c.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            className="fill-light-muted dark:fill-dark-muted"
          >
            {c.label}
          </text>
        ))}
      </svg>
    );
  };

  const renderBrandShareGraphic = () => {
    const brandShareData = getBrandShareData();
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 w-full">
        {brandShareData.length > 0 ? (
          <>
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              {brandShareData.map((share, idx) => {
                const r = 50;
                const circ = 2 * Math.PI * r;
                const strokeDasharray = `${(share.percentage / 100) * circ} ${circ}`;
                const strokeDashoffset = `${circ - (share.accumulatedPercentage / 100) * circ + (circ / 4)}`;
                return (
                  <circle
                    key={idx}
                    cx="80"
                    cy="80"
                    r={r}
                    fill="transparent"
                    stroke={share.color}
                    strokeWidth="16"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-[20px]"
                  />
                );
              })}
              <circle cx="80" cy="80" r="38" className="fill-light-surface dark:fill-dark-surface" />
              <text
                x="80"
                y="76"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                className="fill-light-muted dark:fill-dark-muted"
              >
                Total Sold
              </text>
              <text
                x="80"
                y="94"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                className="fill-light-text dark:fill-dark-text"
              >
                {filteredPhonesSold}
              </text>
            </svg>
            
            <div className="flex flex-col gap-2">
              {brandShareData.map((share, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: share.color }}
                  />
                  <span className="text-light-text dark:text-dark-text">{share.brand}</span>
                  <span className="text-light-muted dark:text-dark-muted">
                    ({share.quantity} units, {share.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-xs text-light-muted dark:text-dark-muted py-12 text-center">
            No sales recorded to compute brand share.
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // WEBSITE SETTINGS LOGIC
  // ----------------------------------------------------

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateSettings(siteSettings);
      showToast("Website configuration saved and pushed.", "success");
    } catch (e) {
      showToast("Error updating settings.", "error");
    }
  };

  // ----------------------------------------------------
  // CAROUSEL BANNERS MANAGEMENT LOGIC
  // ----------------------------------------------------

  const handleBannerFieldChange = (idx, field, value) => {
    const updated = [...banners];
    updated[idx][field] = value;
    setBanners(updated);
  };

  const handleBannerImageUpload = async (idx, file) => {
    showToast("Uploading banner image...", "info");
    try {
      const url = await dbService.uploadImage(file);
      handleBannerFieldChange(idx, 'image', url);
      showToast("Banner image loaded.", "success");
    } catch (e) {
      showToast("Banner upload failed.", "error");
    }
  };

  const handleAddBannerSlot = () => {
    const nextBanners = [
      ...banners,
      {
        id: `banner-${Date.now()}`,
        title: 'New Slide Banner',
        subtitle: 'Subheading Alert',
        description: 'Detail overview text...',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=80',
        link: '/shop',
        badge: 'Promo Deal'
      }
    ];
    setBanners(nextBanners);
    showToast("New banner slot added at the end.", "success");
  };

  const handleRemoveBannerSlot = (id) => {
    if (window.confirm("Remove this banner slide?")) {
      const filtered = banners.filter(b => b.id !== id);
      setBanners(filtered);
      showToast("Banner slide slot removed.", "warning");
    }
  };

  const handleSaveBanners = async () => {
    try {
      const deletedBanners = dbBanners.filter(dbB => !banners.some(b => b.id === dbB.id));
      for (const dbB of deletedBanners) {
        if (!dbB.id.startsWith('banner-')) {
          await dbService.deleteBanner(dbB.id);
        }
      }
      
      for (const b of banners) {
        const bannerData = {
          title: b.title || '',
          subtitle: b.subtitle || '',
          description: b.description || '',
          image: b.image || '',
          link: b.link || '',
          badge: b.badge || ''
        };
        if (b.id.startsWith('banner-')) {
          await dbService.addBanner(bannerData);
        } else {
          await dbService.updateBanner(b.id, bannerData);
        }
      }
      
      showToast("Banner sliders updated successfully.", "success");
      setBanners([]);
    } catch (e) {
      console.error(e);
      showToast("Failed to save banners list.", "error");
    }
  };

  // Calculations for print charts
  const printSalesPoints = getChartDataPoints(sales, 'saleDate', 'revenue', reportFilter);
  const printSalesMaxVal = Math.max(...printSalesPoints.map(p => p.value), 100);
  const printSalesCoords = printSalesPoints.map((p, i) => {
    const x = 40 + (i / (printSalesPoints.length - 1)) * 420;
    const y = 170 - (p.value / printSalesMaxVal) * 140;
    return { x, y, label: p.label, value: p.value };
  });
  const printSalesLinePath = printSalesCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const printSalesAreaPath = printSalesCoords.length > 0 
    ? `${printSalesLinePath} L ${printSalesCoords[printSalesCoords.length - 1].x} 170 L ${printSalesCoords[0].x} 170 Z` 
    : '';

  const printPurchasePoints = getChartDataPoints(purchases, 'purchaseDate', 'cost', reportFilter);
  const printPurchaseMaxVal = Math.max(...printPurchasePoints.map(p => p.value), 100);

  // Filter products by admin search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pb-20 print:hidden">
      
      {/* Dashboard Subheader */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary text-white rounded-xl">
              <Smartphone className="w-6 h-6 animate-float" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-medium tracking-tight flex items-center gap-2">
                <span>Console Cockpit</span>
                <span className="text-xs bg-brand-primary/15 text-brand-primary px-2.5 py-0.5 rounded-full font-medium">
                  v1.2
                </span>
              </h1>
              <p className="text-xs text-light-muted dark:text-dark-muted font-medium mt-0.5">
                Logged in: <span className="text-light-text dark:text-dark-text">{currentUser?.email}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              target="_blank"
              className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
            >
              <span>{T('admin.viewFrontend')}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              title={T('admin.languageSwitch')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 text-xs font-medium rounded-xl hover:text-white transition-all focus:outline-none cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className={isGujarati ? 'font-gujarati' : 'font-english'}>
                {langLabel}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleAdminTheme}
              className="p-2 rounded-xl bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white transition-all focus:outline-none cursor-pointer"
            >
              {adminTheme === 'dark' ? <Sun className="w-4 h-4 text-brand-accent" /> : <Moon className="w-4 h-4 text-brand-primary" />}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 text-xs font-medium rounded-xl hover:text-white transition-all focus:outline-none cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{T('admin.logOut')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-light-border dark:border-dark-border gap-2 mb-8 pb-1">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'overview'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{T('admin.overview')}</span>
          </button>

          <button
            onClick={() => navigate('/admin/products')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'products'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{T('admin.products')} ({products.length})</span>
          </button>

          <button
            onClick={() => navigate('/admin/categories')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'categories'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>{T('admin.categories')} ({categories.length})</span>
          </button>

          <button
            onClick={() => navigate('/admin/purchases')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'purchases'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{T('admin.purchases')} ({purchases.length})</span>
          </button>

          <button
            onClick={() => navigate('/admin/sales')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'sales'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{T('admin.sales')} ({sales.length})</span>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'reports'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{T('admin.reports')}</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/banners')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'banners'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{T('admin.banners')} ({dbBanners.length})</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/settings')}
            className={`px-5 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none cursor-pointer ${
              activeTab === 'settings'
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Website Settings</span>
          </button>
        </div>

        {/* ----------------------------------------------------
            TAB 0: DASHBOARD OVERVIEW
           ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Total Revenue */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">Total Revenue</span>
                  <span className="text-3xl font-medium text-brand-primary">${totalRevenue.toFixed(2)}</span>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium mt-1">Earnings from sales logs</span>
                </div>
                <div className="p-3.5 bg-brand-primary/10 text-brand-primary rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 2: Total Inventory Value */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">Inventory Valuation</span>
                  <span className="text-3xl font-medium text-brand-secondary">${totalInventoryValue.toFixed(2)}</span>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium mt-1">Stock quantity × retail price</span>
                </div>
                <div className="p-3.5 bg-brand-secondary/10 text-brand-secondary rounded-2xl">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 3: Total Stock Available */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">Stock On Hand</span>
                  <span className="text-3xl font-medium text-emerald-500">{totalStockAvailable} <span className="text-xs font-medium text-light-muted dark:text-dark-muted">units</span></span>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium mt-1">Total count of all devices</span>
                </div>
                <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 4: Sales Activity Volume */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">Sold vs Purchased</span>
                  <span className="text-xl font-medium text-purple-500">
                    {totalPhonesSold} sold / {totalPhonesPurchased} bought
                  </span>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium mt-1">Aggregate transaction records</span>
                </div>
                <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Alert / Brand Status Indicators row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Brand Categories */}
              <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex items-center gap-3">
                <div className="p-2 bg-indigo-500/15 text-indigo-500 rounded-xl">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium block">Brand Partners</span>
                  <span className="text-lg font-medium text-light-text dark:text-dark-text">{categories.length} Brand Profiles</span>
                </div>
              </div>
              
              {/* Low Stock count */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-amber-600 dark:text-amber-500 font-medium block">Low Stock Alert</span>
                  <span className="text-lg font-medium text-amber-700 dark:text-amber-400">{lowStockCount} Devices</span>
                </div>
              </div>

              {/* Out of stock count */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3">
                <div className="p-2 bg-rose-500/15 text-rose-500 rounded-xl">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-rose-600 dark:text-rose-500 font-medium block">Out of Stock Alert</span>
                  <span className="text-lg font-medium text-rose-700 dark:text-rose-400">{outOfStockCount} Devices</span>
                </div>
              </div>
            </div>

            {/* Bottom Overview Section: Recent Additions & Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Additions Column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* Recent Arrivals Table */}
                <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                        <span>Recent Arrivals</span>
                      </h3>
                      <button 
                        onClick={() => navigate('/admin/products')}
                        className="text-xs font-medium text-brand-primary hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="divide-y divide-light-border dark:divide-dark-border">
                      {products.slice(0, 3).length > 0 ? (
                        products.slice(0, 3).map((p) => {
                          const displayImage = p.images && p.images.length > 0 
                            ? p.images[0] 
                            : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
                          return (
                            <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-slate-900/50 flex items-center justify-center p-1">
                                  <img src={displayImage} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-light-text dark:text-dark-text block">{p.name}</span>
                                  <span className="text-[9px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">{p.brand} &bull; {p.category}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-right">
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-light-text dark:text-dark-text">${p.offerPrice || p.price}</span>
                                  {p.offerPrice && <span className="text-[9px] text-light-muted dark:text-dark-muted line-through">${p.price}</span>}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase ${
                                  p.stockStatus === 'In Stock' 
                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                    : p.stockStatus === 'Low Stock'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                  {p.stockStatus}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-light-muted dark:text-dark-muted font-medium text-xs">
                          No devices listed yet.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-light-bg/50 dark:bg-dark-bg/20 border-t border-light-border dark:border-dark-border text-center">
                    <button
                      onClick={openAddProductModal}
                      className="w-full py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
                    >
                      + Create New Smart Device Product
                    </button>
                  </div>
                </div>

                {/* Recent Sales Transactions Table */}
                <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-primary" />
                      <span>Recent Sales Transactions</span>
                    </h3>
                    <button 
                      onClick={() => navigate('/admin/sales')}
                      className="text-xs font-medium text-brand-primary hover:underline cursor-pointer"
                    >
                      View All Sales
                    </button>
                  </div>
                  
                  <div className="divide-y divide-light-border dark:divide-dark-border">
                    {sales.slice(0, 4).length > 0 ? (
                      sales.slice(0, 4).map((s) => {
                        const dateStr = new Date(s.saleDate).toLocaleDateString();
                        return (
                          <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-light-text dark:text-dark-text">{s.productName}</span>
                              <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium">Date: {dateStr}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium text-light-text dark:text-dark-text block">${(s.quantity * s.sellingPrice).toFixed(2)}</span>
                              <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium">{s.quantity} units @ ${s.sellingPrice}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-light-muted dark:text-dark-muted font-medium text-xs">
                        No sales recorded yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sidebar Quick Action / Settings Summary */}
              <div className="flex flex-col gap-6">
                
                {/* Stock Alerts Warning Panel */}
                <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                    <History className="w-4 h-4 text-rose-500" />
                    <span>Low & Out of Stock Alerts</span>
                  </h3>
                  
                  <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {products.filter(p => (p.stockQuantity || 0) <= 5).length > 0 ? (
                      products.filter(p => (p.stockQuantity || 0) <= 5).map((p) => (
                        <div 
                          key={p.id}
                          className="p-3 bg-light-bg dark:bg-dark-bg/40 border border-light-border dark:border-dark-border rounded-xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-medium text-light-text dark:text-dark-text block">{p.name}</span>
                            <span className="text-[9px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">{p.brand}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase ${
                            (p.stockQuantity || 0) === 0 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            Qty: {p.stockQuantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-light-muted dark:text-dark-muted text-center py-4">All products are healthy in stock.</span>
                    )}
                  </div>
                </div>

                {/* Settings Card */}
                <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-primary" />
                    <span>Store Profile</span>
                  </h3>
                  
                  <div className="text-xs flex flex-col gap-2.5">
                    <div className="flex justify-between">
                      <span className="text-light-muted dark:text-dark-muted font-medium">Store Name:</span>
                      <span className="font-medium text-light-text dark:text-dark-text">{siteSettings.storeName || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-muted dark:text-dark-muted font-medium">Email support:</span>
                      <span className="font-medium text-light-text dark:text-dark-text truncate max-w-[150px]">{siteSettings.email || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-muted dark:text-dark-muted font-medium">Helpline Contact:</span>
                      <span className="font-medium text-light-text dark:text-dark-text">{siteSettings.phone || 'Not Set'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/admin/settings')}
                    className="text-left text-xs font-medium text-brand-primary hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Edit site configurations</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 1: PRODUCTS INVENTORY DIRECTORY
           ---------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-6">
            
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter mobiles inventory..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-light-border bg-light-surface dark:border-dark-border dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-light-muted dark:text-dark-muted" />
              </div>

              {/* Add button */}
              <button
                onClick={openAddProductModal}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-90 shadow-md shadow-brand-primary/10 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Add Smart Device</span>
              </button>
            </div>

            {/* Inventory Table Container */}
            <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/20 text-light-muted dark:text-dark-muted font-medium text-xs uppercase">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Model Name</th>
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Price details</th>
                      <th className="px-6 py-4">Stock Status</th>
                      <th className="px-6 py-4 text-center">Featured</th>
                      <th className="px-6 py-4 text-right">Inventory Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => {
                        const hasDiscount = p.offerPrice && p.offerPrice < p.price;
                        const displayImage = p.images && p.images.length > 0 
                          ? p.images[0] 
                          : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';

                        return (
                          <tr key={p.id} className="border-b border-light-border dark:border-dark-border/50 hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                            {/* Product preview image */}
                            <td className="px-6 py-3.5">
                              <div className="w-12 h-12 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-slate-900/50 flex items-center justify-center p-1.5">
                                <img src={displayImage} alt="model" className="max-h-full max-w-full object-contain" />
                              </div>
                            </td>
                            {/* Product Name */}
                            <td className="px-6 py-3.5">
                              <span className="font-medium text-light-text dark:text-dark-text block">{p.name}</span>
                              <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase">{p.category}</span>
                            </td>
                            {/* Brand */}
                            <td className="px-6 py-3.5 font-normal text-brand-secondary">
                              {p.brand}
                            </td>
                            {/* Price details */}
                            <td className="px-6 py-3.5 font-normal">
                              {hasDiscount ? (
                                <div className="flex flex-col">
                                  <span className="text-light-text dark:text-dark-text">${p.offerPrice}</span>
                                  <span className="text-[10px] text-light-muted dark:text-dark-muted line-through font-normal">${p.price}</span>
                                </div>
                              ) : (
                                <span>${p.price}</span>
                              )}
                            </td>
                            {/* Stock status toggle */}
                            <td className="px-6 py-3.5">
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  onClick={() => toggleProductStock(p)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border cursor-pointer ${
                                    p.stockStatus === 'In Stock'
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : p.stockStatus === 'Low Stock'
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                  }`}
                                >
                                  {p.stockStatus}
                                </button>
                                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium pl-1">
                                  Qty: {p.stockQuantity === undefined ? 0 : p.stockQuantity}
                                </span>
                              </div>
                            </td>
                            {/* Featured status toggle */}
                            <td className="px-6 py-3.5 text-center">
                              <button
                                onClick={() => toggleProductFeatured(p)}
                                className={`p-1.5 rounded-full border cursor-pointer mx-auto transition-colors ${
                                  p.featured
                                    ? 'bg-brand-accent/10 border-brand-accent/25 text-brand-accent'
                                    : 'bg-light-bg dark:bg-dark-bg text-gray-300 dark:text-gray-600 border-light-border dark:border-dark-border'
                                }`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </td>
                            {/* Edit/Delete Actions */}
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Edit details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Delete device"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-light-muted dark:text-dark-muted font-normal">
                          No items match your search. Try adding a device.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 1.5: BRAND CATEGORIES MANAGEMENT
           ---------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6">
            
            {/* Header panel */}
            <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm">
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 flex items-center gap-2">
                  <Tags className="w-5 h-5 text-brand-primary" />
                  <span>Brands Directory Manager</span>
                </h3>
                <p className="text-light-muted dark:text-dark-muted font-medium">
                  Create and manage the brand categories used to filter products across the store.
                </p>
              </div>
            </div>

            {/* Warning Alert Box */}
            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-xs text-amber-600 dark:text-amber-500 max-w-2xl font-medium leading-relaxed">
              <strong>⚠️ Warning:</strong> Deleting a brand category will immediately remove its corresponding filter option from the user storefront side navigation and product detail dropdown list. It is recommended to update or delete all related mobile products before deleting the brand category.
            </div>

            {/* Add Brand category Form */}
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm max-w-md">
              <h4 className="text-xs uppercase font-semibold tracking-wide text-brand-primary mb-3">Add Brand Category</h4>
              <form onSubmit={handleAddCategory} className="flex gap-2 text-xs sm:text-sm">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Google Pixel, OnePlus..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text"
                  disabled={addingCategory}
                />
                <button
                  type="submit"
                  disabled={addingCategory}
                  className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {addingCategory ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Add Brand</span>
                </button>
              </form>
            </div>

            {/* List Table of active Categories */}
            <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm max-w-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/20 text-light-muted dark:text-dark-muted font-medium text-xs uppercase">
                      <th className="px-6 py-4">Brand / Category Name</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat) => {
                        const dateStr = cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A';
                        return (
                          <tr key={cat.id} className="border-b border-light-border dark:border-dark-border/50 hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                            <td className="px-6 py-4 font-normal text-light-text dark:text-dark-text">
                              {cat.name}
                            </td>
                            <td className="px-6 py-4 text-light-muted dark:text-dark-muted font-normal">
                              {dateStr}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Delete Brand Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-12 text-light-muted dark:text-dark-muted font-normal">
                          No categories defined yet. Start by adding one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 2: PROMOTIONAL BANNERS CAROUSEL MANAGER
           ---------------------------------------------------- */}
        {activeTab === 'banners' && (
          <div className="flex flex-col gap-6">
            
            {/* Info panel */}
            <div className="p-4 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-between gap-4">
              <div className="text-xs sm:text-sm">
                <h3 className="font-medium text-light-text dark:text-dark-text mb-0.5">Banner Carousel Management</h3>
                <p className="text-light-muted dark:text-dark-muted font-medium">
                  Modify the promotional slider displayed at the top of the homepage store.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddBannerSlot}
                  className="px-4 py-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-medium hover:bg-light-bg dark:hover:bg-dark-border cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
                <button
                  onClick={handleSaveBanners}
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-medium hover:opacity-95 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Carousel Changes</span>
                </button>
              </div>
            </div>

            {/* List of active Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((b, idx) => (
                <div key={b.id} className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4 relative">
                  
                  {/* Delete banner slot indicator */}
                  <button
                    onClick={() => handleRemoveBannerSlot(b.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="Remove Slide Slot"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h4 className="text-sm font-medium text-brand-primary uppercase tracking-wide">
                    Slide Banner #{idx + 1}
                  </h4>

                  {/* Banner Fields Form */}
                  <div className="flex flex-col gap-3 text-xs sm:text-sm">
                    {/* Header */}
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="font-medium">Title Text</label>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => handleBannerFieldChange(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                        />
                      </div>
                      <div className="w-1/3 flex flex-col gap-1">
                        <label className="font-medium">Badge Text</label>
                        <input
                          type="text"
                          value={b.badge}
                          onChange={(e) => handleBannerFieldChange(idx, 'badge', e.target.value)}
                          className="w-full px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                          placeholder="e.g. New release"
                        />
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Subheading Text</label>
                      <input
                        type="text"
                        value={b.subtitle}
                        onChange={(e) => handleBannerFieldChange(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Description Details</label>
                      <textarea
                        value={b.description}
                        onChange={(e) => handleBannerFieldChange(idx, 'description', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl resize-none"
                      />
                    </div>

                    {/* Link */}
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Redirect Button Link</label>
                      <input
                        type="text"
                        value={b.link}
                        onChange={(e) => handleBannerFieldChange(idx, 'link', e.target.value)}
                        className="w-full px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                        placeholder="e.g. /product/iphone-15-pro-max"
                      />
                    </div>

                    {/* Banner Image selector */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="font-medium">Banner Background Image URL</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={b.image}
                          onChange={(e) => handleBannerFieldChange(idx, 'image', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                        />
                        <label className="flex items-center gap-1 px-3 py-2 bg-light-bg hover:bg-light-border dark:bg-dark-bg dark:hover:bg-dark-border border border-light-border dark:border-dark-border rounded-xl cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
                          <span className="text-[10px] font-medium">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerImageUpload(idx, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {/* Image Preview */}
                      {b.image && (
                        <div className="w-full h-24 rounded-lg overflow-hidden mt-1 bg-light-bg dark:bg-dark-bg/50 border border-light-border dark:border-dark-border">
                          <img src={b.image} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {banners.length === 0 && (
              <div className="text-center py-12 border border-dashed border-light-border dark:border-dark-border rounded-2xl">
                <p className="text-light-muted dark:text-dark-muted font-medium mb-3">No slides defined in the homepage carousel.</p>
                <button
                  onClick={handleAddBannerSlot}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-full"
                >
                  Create First Slide
                </button>
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 3: WEBSITE SETTINGS CONFIGURATION
           ---------------------------------------------------- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm max-w-2xl">
            <h3 className="text-base font-semibold tracking-tight mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-primary" />
              <span>Configure Site Information</span>
            </h3>

            <div className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Store Brand Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={siteSettings.storeName}
                    onChange={handleSettingsChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                    placeholder="e.g. AeroMobile Store"
                    required
                  />
                </div>
                {/* Logo text */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Logo Branding Text</label>
                  <input
                    type="text"
                    name="logoText"
                    value={siteSettings.logoText}
                    onChange={handleSettingsChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                    placeholder="e.g. AeroMobile"
                    required
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Store Slogan Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={siteSettings.tagline}
                  onChange={handleSettingsChange}
                  className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                  placeholder="e.g. Your Premium Destination for Flagship Mobile Devices"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Support Email */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Helpline Email</label>
                  <input
                    type="email"
                    name="email"
                    value={siteSettings.email}
                    onChange={handleSettingsChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                    placeholder="support@store.com"
                  />
                </div>
                {/* Support Phone */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Helpline Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={siteSettings.phone}
                    onChange={handleSettingsChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                    placeholder="+1 (800) 555-MOBI"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Store Storefront Address</label>
                <input
                  type="text"
                  name="address"
                  value={siteSettings.address}
                  onChange={handleSettingsChange}
                  className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40"
                  placeholder="742 Evergreen Terrace, Cupertino, CA 95014"
                />
              </div>

              {/* Announcement marquee alert */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Top Bar Announcement Banner Text</label>
                <textarea
                  name="announcement"
                  value={siteSettings.announcement}
                  onChange={handleSettingsChange}
                  rows="2"
                  className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 resize-none animate-pulse-slow"
                  placeholder="⚡ Special Opening Sale: Use coupon... ⚡"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-fit mt-3 px-6 py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------
            TAB 4: PURCHASES RECORD LOG
           ---------------------------------------------------- */}
        {activeTab === 'purchases' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Purchase Form */}
            <div className="lg:col-span-1 p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm h-fit">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-brand-primary" />
                <span>Record Purchase Entry</span>
              </h3>
              <form onSubmit={handleAddPurchase} className="flex flex-col gap-4 text-xs sm:text-sm">
                {/* Product Select */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Select Mobile Model *</label>
                  <select
                    name="productId"
                    value={purchaseForm.productId}
                    onChange={handlePurchaseInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  >
                    <option value="">-- Choose Device --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Quantity Purchased *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={purchaseForm.quantity}
                    onChange={handlePurchaseInputChange}
                    min="1"
                    placeholder="e.g. 5"
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                {/* Purchase Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Unit Purchase Cost ($) *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={purchaseForm.purchasePrice}
                    onChange={handlePurchaseInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 900"
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                {/* Supplier Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Supplier / Distributor *</label>
                  <input
                    type="text"
                    name="supplierName"
                    value={purchaseForm.supplierName}
                    onChange={handlePurchaseInputChange}
                    placeholder="e.g. Apple Logistics"
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                {/* Purchase Date */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Purchase Date *</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={purchaseForm.purchaseDate}
                    onChange={handlePurchaseInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 px-5 py-3 bg-brand-primary hover:opacity-90 text-white font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Purchase</span>
                </button>
              </form>
            </div>

            {/* Purchase Log Table */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-brand-primary" />
                    <span>Purchase Transaction Logs</span>
                  </h3>
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium">
                    Total Logs: {purchases.length}
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/20 text-light-muted dark:text-dark-muted font-medium text-xs uppercase">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4">Unit Cost</th>
                        <th className="px-6 py-4">Total Cost</th>
                        <th className="px-6 py-4">Supplier</th>
                        <th className="px-6 py-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border">
                      {purchases.length > 0 ? (
                        purchases.map((p) => {
                          const total = (p.quantity || 0) * (p.purchasePrice || 0);
                          const dateStr = new Date(p.purchaseDate).toLocaleDateString();
                          return (
                            <tr key={p.id} className="hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                              <td className="px-6 py-4 font-normal text-light-text dark:text-dark-text">{p.productName}</td>
                              <td className="px-6 py-4 text-center font-normal text-light-text dark:text-dark-text">{p.quantity}</td>
                              <td className="px-6 py-4 font-normal">${p.purchasePrice}</td>
                              <td className="px-6 py-4 font-normal text-brand-secondary">${total.toFixed(2)}</td>
                              <td className="px-6 py-4 font-normal text-light-muted dark:text-dark-muted">{p.supplierName}</td>
                              <td className="px-6 py-4 text-right text-light-muted dark:text-dark-muted font-normal">{dateStr}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-light-muted dark:text-dark-muted font-normal">
                            No purchase logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 5: SALES RECORD LOG
           ---------------------------------------------------- */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Form */}
            <div className="lg:col-span-1 p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm h-fit">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-brand-primary" />
                <span>Record Sales Entry</span>
              </h3>
              <form onSubmit={handleAddSale} className="flex flex-col gap-4 text-xs sm:text-sm">
                {/* Product Select */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Select Mobile Model *</label>
                  <select
                    name="productId"
                    value={salesForm.productId}
                    onChange={handleSalesInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  >
                    <option value="">-- Choose Device --</option>
                    {products
                      .filter(p => (p.stockQuantity || 0) > 0)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                      ))}
                  </select>
                  {products.filter(p => (p.stockQuantity || 0) > 0).length === 0 && (
                    <span className="text-[10px] text-rose-500 font-medium mt-1">⚠️ All devices are currently out of stock! Add stock via Purchases first.</span>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Quantity Sold *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={salesForm.quantity}
                    onChange={handleSalesInputChange}
                    min="1"
                    max={salesForm.productId ? (products.find(p => p.id === salesForm.productId)?.stockQuantity || 1) : undefined}
                    placeholder="e.g. 1"
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                  {salesForm.productId && (
                    <span className="text-[10px] text-brand-secondary font-medium pl-1 mt-0.5">
                      Max available stock: {products.find(p => p.id === salesForm.productId)?.stockQuantity || 0} units
                    </span>
                  )}
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Selling Price per unit ($) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={salesForm.sellingPrice}
                    onChange={handleSalesInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 1099"
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                {/* Sale Date */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-light-text dark:text-dark-text">Sale Date *</label>
                  <input
                    type="date"
                    name="saleDate"
                    value={salesForm.saleDate}
                    onChange={handleSalesInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 px-5 py-3 bg-brand-primary hover:opacity-90 text-white font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Record Sale</span>
                </button>
              </form>
            </div>

            {/* Sales Log Table */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-brand-primary" />
                    <span>Sales Transaction Logs</span>
                  </h3>
                  <span className="text-xs text-light-muted dark:text-dark-muted font-medium">
                    Total Logs: {sales.length}
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/20 text-light-muted dark:text-dark-muted font-medium text-xs uppercase">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4 text-center">Qty Sold</th>
                        <th className="px-6 py-4">Selling Price</th>
                        <th className="px-6 py-4">Total Revenue</th>
                        <th className="px-6 py-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border">
                      {sales.length > 0 ? (
                        sales.map((s) => {
                          const total = (s.quantity || 0) * (s.sellingPrice || 0);
                          const dateStr = new Date(s.saleDate).toLocaleDateString();
                          return (
                            <tr key={s.id} className="hover:bg-light-bg/30 dark:hover:bg-dark-bg/10 transition-colors">
                              <td className="px-6 py-4 font-normal text-light-text dark:text-dark-text">{s.productName}</td>
                              <td className="px-6 py-4 text-center font-normal text-light-text dark:text-dark-text">{s.quantity}</td>
                              <td className="px-6 py-4 font-normal">${s.sellingPrice}</td>
                              <td className="px-6 py-4 font-normal text-emerald-500">${total.toFixed(2)}</td>
                              <td className="px-6 py-4 text-right text-light-muted dark:text-dark-muted font-normal">{dateStr}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-light-muted dark:text-dark-muted font-normal">
                            No sales logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 6: REPORTS & INTERACTIVE GRAPHICS
           ---------------------------------------------------- */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-8">
            {/* Filter Toolbar */}
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-primary" />
                  <span>Interactive Reports & Analytics</span>
                </h3>
                <p className="text-xs text-light-muted dark:text-dark-muted font-medium">
                  Analyze sales volumes, purchase entries, stock trends, and brand performance.
                </p>
              </div>

              {/* Date Filter controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap bg-light-bg dark:bg-dark-bg/60 p-1.5 rounded-xl border border-light-border dark:border-dark-border gap-1">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: '7 Days' },
                    { id: '30days', label: '30 Days' },
                    { id: '6months', label: '6 Months' },
                    { id: '1year', label: '1 Year' },
                    { id: 'custom', label: 'Custom Range' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setReportFilter(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        reportFilter === opt.id
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCSV}
                    className="p-2.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-medium hover:bg-light-bg dark:hover:bg-dark-bg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download CSV"
                  >
                    <Download className="w-4 h-4 text-brand-primary" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-2.5 bg-brand-primary text-white rounded-xl text-xs font-medium hover:opacity-90 shadow-md flex items-center gap-1 cursor-pointer"
                    title="Print Report / Save PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print / PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Date Range pickers if selected */}
            {reportFilter === 'custom' && (
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-wrap gap-4 items-end animate-slideDown max-w-xl">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-xs font-medium text-light-text dark:text-dark-text">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-xs font-medium text-light-text dark:text-dark-text">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl text-xs"
                  />
                </div>
                <button
                  onClick={() => showToast("Filters applied to date fields.", "success")}
                  className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-medium rounded-xl cursor-pointer"
                >
                  Apply Custom Dates
                </button>
              </div>
            )}

            {/* Filtered Metrics summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* 1. Revenue */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider block mb-1">Sales Revenue</span>
                <span className="text-2xl font-medium text-brand-primary">${filteredSalesRevenue.toFixed(2)}</span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium block mt-1.5">
                  {filteredPhonesSold} units sold
                </span>
              </div>

              {/* 2. Purchase Cost */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider block mb-1">Purchase Cost</span>
                <span className="text-2xl font-medium text-brand-secondary">${filteredPurchasesCost.toFixed(2)}</span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium block mt-1.5">
                  {filteredPhonesPurchased} units bought
                </span>
              </div>

              {/* 3. Profit */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider block mb-1">Net Margin</span>
                <span className={`text-2xl font-medium ${filteredProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${filteredProfit.toFixed(2)}
                </span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium block mt-1.5">
                  Net Profit/Loss margin
                </span>
              </div>

              {/* 4. Top Selling Brand */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider block mb-1">Top Brand</span>
                <span className="text-xl font-medium text-indigo-500 line-clamp-1">{topBrand}</span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium block mt-1.5">
                  {topBrandVolume} units sold
                </span>
              </div>

              {/* 5. Top Selling Model */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider block mb-1">Top Model</span>
                <span className="text-xl font-medium text-pink-500 line-clamp-1">{topModel}</span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium block mt-1.5">
                  {topModelVolume} units sold
                </span>
              </div>
            </div>

            {/* Graphical Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. Sales Trend SVG */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-3">
                  <h4 className="text-xs uppercase font-semibold tracking-wide text-brand-primary flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Sales Revenue Trend (USD)</span>
                  </h4>
                </div>
                <div className="flex items-center justify-center p-2 bg-light-bg/40 dark:bg-dark-bg/20 rounded-xl">
                  {renderSalesChartGraphic()}
                </div>
              </div>

              {/* 2. Purchase Trend SVG */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-3">
                  <h4 className="text-xs uppercase font-semibold tracking-wide text-emerald-500 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Purchase Cost Trend (USD)</span>
                  </h4>
                </div>
                <div className="flex items-center justify-center p-2 bg-light-bg/40 dark:bg-dark-bg/20 rounded-xl">
                  {renderPurchaseChartGraphic()}
                </div>
              </div>

              {/* 3. Stock Trend SVG */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-3">
                  <h4 className="text-xs uppercase font-semibold tracking-wide text-cyan-500 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Stock Level Trend (Units)</span>
                  </h4>
                </div>
                <div className="flex items-center justify-center p-2 bg-light-bg/40 dark:bg-dark-bg/20 rounded-xl">
                  {renderStockChartGraphic()}
                </div>
              </div>

              {/* 4. Brand Share Donut SVG */}
              <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-3">
                  <h4 className="text-xs uppercase font-semibold tracking-wide text-purple-500 flex items-center gap-1.5">
                    <Tags className="w-4 h-4" />
                    <span>Brand Volume Sales Share (%)</span>
                  </h4>
                </div>
                <div className="flex items-center justify-center p-2 bg-light-bg/40 dark:bg-dark-bg/20 rounded-xl">
                  {renderBrandShareGraphic()}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ----------------------------------------------------
          MODAL OVERLAY: ADD / EDIT PRODUCT FORM
         ---------------------------------------------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-2xl p-6 sm:p-8 animate-scaleIn flex flex-col justify-between">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-border text-light-muted dark:text-dark-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium tracking-tight">
                {editingProductId ? 'Edit Mobile details' : 'Add Mobile Product'}
              </h3>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-6 text-xs sm:text-sm">
              
              {/* Product Info Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mobile Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Mobile Model Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductInputChange}
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                    placeholder="e.g. iPhone 15 Pro Max"
                    required
                  />
                </div>
                {/* Brand */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Manufacture Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductInputChange}
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                    placeholder="e.g. Apple"
                    required
                  />
                </div>
                {/* Category Selection */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Category Brand Filter</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductInputChange}
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && <option value="">No categories defined</option>}
                  </select>
                </div>
              </div>

              {/* Price details & status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Normal Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Standard Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductInputChange}
                    min="0"
                    step="0.01"
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl font-medium"
                    placeholder="e.g. 1199"
                    required
                  />
                </div>
                {/* Offer Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Offer Discount Price ($)</label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={productForm.offerPrice}
                    onChange={handleProductInputChange}
                    min="0"
                    step="0.01"
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl font-medium text-emerald-500"
                    placeholder="e.g. 1099 (Optional)"
                  />
                </div>
                {/* Stock Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Available Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={productForm.stockQuantity === undefined ? 0 : productForm.stockQuantity}
                    onChange={handleProductInputChange}
                    min="0"
                    className="px-3 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl"
                    placeholder="e.g. 10"
                    required
                  />
                </div>
                {/* Featured Checkbox */}
                <div className="flex items-center gap-2.5 pl-2 mt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={productForm.featured}
                    onChange={handleProductInputChange}
                    className="w-4.5 h-4.5 text-brand-primary bg-light-bg border-light-border rounded focus:ring-brand-primary dark:bg-dark-bg dark:border-dark-border"
                  />
                  <label htmlFor="featured" className="font-medium text-light-text dark:text-dark-text cursor-pointer select-none">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Description details */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Detailed Writeup Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductInputChange}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl resize-none"
                  placeholder="Enter detailed device specifications description, user target segment, and display overview details..."
                />
              </div>

              {/* Images Manager */}
              <div className="flex flex-col gap-2">
                <label className="font-medium flex items-center gap-1 text-xs uppercase tracking-wide">
                  <ImageIcon className="w-4 h-4 text-brand-primary" />
                  <span>Product Image Assets</span>
                </label>
                
                {/* Image upload selector / Add URLs */}
                <div className="p-4 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center gap-3 bg-light-bg/40 dark:bg-dark-bg/10">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium text-xs hover:opacity-90 transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Select Files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                    
                    <span className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase">Or Add Direct URL:</span>
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          e.preventDefault();
                          setProductForm(prev => ({
                            ...prev,
                            images: [...prev.images, e.target.value.trim()]
                          }));
                          e.target.value = '';
                          showToast("Image URL linked.", "success");
                        }
                      }}
                      placeholder="Paste Image URL & Press Enter"
                      className="flex-1 px-3 py-1.5 border border-light-border bg-light-surface dark:border-dark-border dark:bg-dark-surface rounded-xl text-xs"
                    />
                  </div>

                  <p className="text-[10px] text-light-muted dark:text-dark-muted text-center font-medium">
                    Supports selecting files (automatically converted locally or uploaded to cloud storage) or linking public web images.
                  </p>
                </div>

                {/* Uploaded Form Images Previews grid */}
                {productForm.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin mt-2">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex-shrink-0 flex items-center justify-center p-2">
                        <img src={img} alt={`form-${idx}`} className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormImage(idx)}
                          className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SPECIFICATIONS GRID (KEY VALUE BUILDER) */}
              <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col gap-4">
                <h4 className="text-xs uppercase font-semibold tracking-wide text-brand-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Technical Specifications Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-24 text-xs font-medium text-light-muted dark:text-dark-muted line-clamp-1">
                        {spec.key}
                      </span>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecValueChange(idx, e.target.value)}
                        placeholder={`e.g. for ${spec.key}...`}
                        className="flex-1 px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Remove specifications row"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Spec Row */}
                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-end gap-3 flex-wrap">
                  <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-light-muted dark:text-dark-muted">Custom Spec Key</label>
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="e.g. Weight, Bluetooth"
                      className="px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl text-xs"
                    />
                  </div>
                  
                  <div className="flex-[2] min-w-[200px] flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-light-muted dark:text-dark-muted">Spec Value</label>
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="e.g. 187 grams, v5.3"
                      className="px-3 py-1.5 border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/30 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    onClick={handleAddCustomSpec}
                    className="px-4 py-2 bg-light-bg hover:bg-light-border dark:bg-dark-bg dark:hover:bg-dark-border border border-light-border dark:border-dark-border text-xs font-medium rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-brand-primary" />
                    <span>Add Row</span>
                  </button>
                </div>

              </div>

              {/* Form submit actions */}
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || imageUploading}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:opacity-95 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50"
                >
                  {savingProduct ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{savingProduct ? "Saving Device..." : "Save Product Details"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>

    {/* ----------------------------------------------------
        PRINTABLE REPORT DOCUMENT (media-print layout)
       ---------------------------------------------------- */}
    <div className="hidden print:block p-8 bg-white text-slate-950 min-h-screen">
      {/* Brand/Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-medium uppercase tracking-tight">{siteSettings.storeName || 'AeroMobile Store'}</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">INVENTORY & SALES MANAGEMENT REPORT</p>
        </div>
        <div className="text-right text-xs text-slate-600">
          <p><strong>Generated At:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Period:</strong> {reportFilter.toUpperCase()}</p>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8 border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Filtered Sales Revenue</span>
          <span className="text-2xl font-medium">${filteredSalesRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">{filteredPhonesSold} units sold</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Filtered Purchases Cost</span>
          <span className="text-2xl font-medium">${filteredPurchasesCost.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">{filteredPhonesPurchased} units bought</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Net Profit / Loss</span>
          <span className={`text-2xl font-medium ${filteredProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ${filteredProfit.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Sales Revenue minus Purchase Cost</span>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8 text-center bg-slate-50 border border-slate-200 rounded-xl py-4">
        <div>
          <span className="text-[9px] font-medium text-slate-500 uppercase block">Stock On Hand</span>
          <span className="text-lg font-medium">{totalStockAvailable} units</span>
        </div>
        <div>
          <span className="text-[9px] font-medium text-slate-500 uppercase block">Total Valuation</span>
          <span className="text-lg font-medium">${totalInventoryValue.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[9px] font-medium text-slate-500 uppercase block">Low Stock Alert</span>
          <span className="text-lg font-medium text-amber-700">{lowStockCount} items</span>
        </div>
        <div>
          <span className="text-[9px] font-medium text-slate-500 uppercase block">Out of Stock Alert</span>
          <span className="text-lg font-medium text-rose-700">{outOfStockCount} items</span>
        </div>
      </div>

      {/* Charts in Print */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Sales Trend Print */}
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-xs font-medium text-slate-800 uppercase border-b pb-1">Sales Revenue Trend</h3>
          <svg viewBox="0 0 500 200" className="w-full h-44 text-slate-300">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
              <line key={idx} x1="40" y1={30 + ratio * 140} x2="460" y2={30 + ratio * 140} stroke="#e2e8f0" strokeDasharray="4 4" />
            ))}
            {printSalesAreaPath && <path d={printSalesAreaPath} fill="#eff6ff" />}
            {printSalesLinePath && <path d={printSalesLinePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />}
            {printSalesCoords.map((c, idx) => (
              <g key={idx}>
                <circle cx={c.x} cy={c.y} r="3.5" fill="#2563eb" />
                <text x={c.x} y={c.y - 8} textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="bold">${c.value.toFixed(0)}</text>
                <text x={c.x} y="185" textAnchor="middle" fontSize="8" fontWeight="semibold" fill="#64748b">{c.label}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Purchase Trend Print */}
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-xs font-medium text-slate-800 uppercase border-b pb-1">Purchase Cost Trend</h3>
          <svg viewBox="0 0 500 200" className="w-full h-44 text-slate-300">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
              <line key={idx} x1="40" y1={30 + ratio * 140} x2="460" y2={30 + ratio * 140} stroke="#e2e8f0" strokeDasharray="4 4" />
            ))}
            {printPurchasePoints.map((p, idx) => {
              const barWidth = 20;
              const spacing = (500 - 2 * 40) / printPurchasePoints.length;
              const x = 40 + idx * spacing + (spacing - barWidth) / 2;
              const barHeight = (p.value / printPurchaseMaxVal) * 140;
              const y = 170 - barHeight;
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} rx="2" fill="#059669" />
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="bold">${p.value.toFixed(0)}</text>
                  <text x={x + barWidth / 2} y="185" textAnchor="middle" fontSize="8" fontWeight="semibold" fill="#64748b">{p.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Sales Logs */}
      <div className="page-break mb-8">
        <h3 className="text-xs font-medium text-slate-800 uppercase mb-3 border-b pb-1">Filtered Sales Activity Logs</h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-medium uppercase">
              <th className="py-2 px-3">Product Name</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3">Selling Price</th>
              <th className="py-2 px-3 text-right">Total Revenue</th>
              <th className="py-2 px-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSales.map((s, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3 font-normal">{s.productName}</td>
                <td className="py-2 px-3 text-center font-normal">{s.quantity}</td>
                <td className="py-2 px-3">${s.sellingPrice}</td>
                <td className="py-2 px-3 text-right font-normal">${((s.quantity || 0) * (s.sellingPrice || 0)).toFixed(2)}</td>
                <td className="py-2 px-3 text-right text-slate-600">{new Date(s.saleDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-slate-500">No sales recorded in filter range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Purchase Logs */}
      <div>
        <h3 className="text-xs font-medium text-slate-800 uppercase mb-3 border-b pb-1">Filtered Purchase Activity Logs</h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-medium uppercase">
              <th className="py-2 px-3">Product Name</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3">Purchase Price</th>
              <th className="py-2 px-3 text-right">Total Cost</th>
              <th className="py-2 px-3">Supplier</th>
              <th className="py-2 px-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPurchases.map((p, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3 font-normal">{p.productName}</td>
                <td className="py-2 px-3 text-center font-normal">{p.quantity}</td>
                <td className="py-2 px-3">${p.purchasePrice}</td>
                <td className="py-2 px-3 text-right font-normal">${((p.quantity || 0) * (p.purchasePrice || 0)).toFixed(2)}</td>
                <td className="py-2 px-3 text-slate-600">{p.supplierName}</td>
                <td className="py-2 px-3 text-right text-slate-600">{new Date(p.purchaseDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredPurchases.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-slate-500">No purchases recorded in filter range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
);
};
