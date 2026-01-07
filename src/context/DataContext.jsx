import { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Expanded Initial Data with Phase 3 Schema
const initialProjects = [
    { id: 1, title: 'Nebula', category: 'Web Design', image: 'https://placehold.co/600x400/1a1a1a/FFF?text=Nebula', content: '<p>Une exploration profonde de l\'espace numérique.</p>' },
    { id: 2, title: 'Quartz', category: 'Branding', image: 'https://placehold.co/600x400/2a2a2a/FFF?text=Quartz', content: '<p>Identité visuelle cristalline et intemporelle.</p>' },
    { id: 3, title: 'Echo', category: 'App Mobile', image: 'https://placehold.co/600x400/151515/FFF?text=Echo', content: '<p>Connecter les gens par la voix.</p>' },
    { id: 4, title: 'Horizon', category: 'Ecommerce', image: 'https://placehold.co/600x400/0f0f0f/FFF?text=Horizon', content: '<p>Le futur du commerce en ligne.</p>' },
];

const initialProducts = [
    {
        id: 1,
        name: 'Pack Icones Minimal',
        price: 29,
        promoPrice: 19, // New Phase 3 field
        isFeatured: true, // New Phase 3 field
        image: 'https://placehold.co/400x400/222/FFF?text=Icones',
        category: 'Design Assets',
        tags: ['icones', 'svg', 'minimal'],
        options: []
    },
    {
        id: 2,
        name: 'Template Notion',
        price: 19,
        promoPrice: null,
        isFeatured: false,
        image: 'https://placehold.co/400x400/252525/FFF?text=Notion',
        category: 'Productivity',
        tags: ['notion', 'template', 'organisation'],
        options: [{ name: 'Style', values: ['Dark', 'Light'] }]
    },
    {
        id: 3,
        name: 'UI Kit Dark Mode',
        price: 49,
        promoPrice: null,
        isFeatured: true,
        image: 'https://placehold.co/400x400/1a1a1a/FFF?text=UI+Kit',
        category: 'Design Assets',
        tags: ['figma', 'ui', 'darkmode'],
        options: [{ name: 'Licence', values: ['Perso', 'Commercial'] }]
    },
];

// Initial Admin User (Auto-created if no users exist)
const initialAdmin = {
    id: 'admin_01',
    name: 'Administrateur',
    email: 'rustiksbaz@gmail.com',
    password: 'admin123', // In a real app, hash this!
    role: 'admin'
};

export const DataProvider = ({ children }) => {
    // --- CORE DATA ---
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('portfolio_projects');
        return saved ? JSON.parse(saved) : initialProjects;
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('portfolio_products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    // --- E-COMMERCE DATA ---
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('portfolio_users');
        let parsedUsers = saved ? JSON.parse(saved) : [];

        // Phase 3: Ensure Admin exists
        if (!parsedUsers.find(u => u.email === initialAdmin.email)) {
            parsedUsers = [...parsedUsers, initialAdmin];
        }
        return parsedUsers;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('portfolio_currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('portfolio_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('portfolio_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // --- SYNC EFFECTS ---
    useEffect(() => localStorage.setItem('portfolio_projects', JSON.stringify(projects)), [projects]);
    useEffect(() => localStorage.setItem('portfolio_products', JSON.stringify(products)), [products]);
    useEffect(() => localStorage.setItem('portfolio_users', JSON.stringify(users)), [users]);
    useEffect(() => {
        localStorage.setItem('portfolio_currentUser', JSON.stringify(currentUser));
        // Sync role to localStorage for ProtectedRoute
        if (currentUser && currentUser.role === 'admin') {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.removeItem('isAdmin');
        }
    }, [currentUser]);
    useEffect(() => localStorage.setItem('portfolio_cart', JSON.stringify(cart)), [cart]);
    useEffect(() => localStorage.setItem('portfolio_orders', JSON.stringify(orders)), [orders]);

    // Phase 4: Promo Codes State
    const [promoCodes, setPromoCodes] = useState(() => {
        const saved = localStorage.getItem('portfolio_promoCodes');
        return saved ? JSON.parse(saved) : [
            { id: 1, code: 'WELCOME10', type: 'percent', value: 10 }, // Example code
            { id: 2, code: 'MINUS5', type: 'fixed', value: 5 }
        ];
    });
    useEffect(() => localStorage.setItem('portfolio_promoCodes', JSON.stringify(promoCodes)), [promoCodes]);

    // --- ACTIONS ---

    // Admin / Data
    const addProject = (project) => setProjects([...projects, { ...project, id: Date.now() }]);
    const deleteProject = (id) => setProjects(projects.filter(p => p.id !== id));
    const updateProject = (id, updatedProject) => {
        setProjects(projects.map(p => p.id === id ? { ...p, ...updatedProject } : p));
    };

    // Updated addProduct to support Phase 3 fields
    const addProduct = (product) => setProducts([...products, { ...product, id: Date.now() }]);
    const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));
    const updateProduct = (id, updatedProduct) => {
        setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    };

    // User Auth
    const register = (email, password, name) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();
        const exists = users.find(u => u.email === cleanEmail);
        if (exists) return { success: false, message: 'Email déjà utilisé.' };

        const newUser = { id: Date.now(), email: cleanEmail, password: cleanPassword, name, role: 'client' };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        return { success: true };
    };

    const login = (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // Phase 3: No more hardcoded backdoor. Check against users array.
        const user = users.find(u => u.email === cleanEmail && u.password === cleanPassword);

        if (user) {
            setCurrentUser(user);
            return { success: true, isAdmin: user.role === 'admin' };
        }
        return { success: false, message: 'Identifiants incorrects.' };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('isAdmin');
    };

    // Promo Codes
    const addPromoCode = (code) => setPromoCodes([...promoCodes, { ...code, id: Date.now() }]);
    const deletePromoCode = (id) => setPromoCodes(promoCodes.filter(c => c.id !== id));

    // Helper to calculate product dynamic price
    const calculateProductPrice = (product) => {
        // Logic for auto-calc can go here if we want dynamic rules, 
        // but for now we rely on explicit promoPrice set by admin.
        return product.promoPrice || product.price;
    };

    // Helper to calculate total price including options modifiers
    const calculateItemTotal = (item) => {
        let base = item.promoPrice || item.price;
        // Add option modifiers
        if (item.options && Array.isArray(item.options)) {
            item.options.forEach(opt => {
                // If option has a priceModifier
                if (opt.priceModifier) base += parseFloat(opt.priceModifier);
            });
        }
        // If options structure changes to { name: "Size", value: "XL", modifier: 5 }, handle it
        // For Phase 5 we will standardize cart items to hold the specific selected variant's modifier
        return base;
    };

    // Cart
    const addToCart = (product, selectedOptions = [], quantity = 1) => {
        // selectedOptions should be array of { name, value, priceModifier, type }
        setCart(prev => {
            // Check if same product with same options exists
            const existing = prev.find(item =>
                item.productId === product.id &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );

            // Calculate unit price at time of add (Base + Modifiers)
            let unitPrice = product.promoPrice || product.price;
            selectedOptions.forEach(opt => {
                if (opt.priceModifier) unitPrice += parseFloat(opt.priceModifier);
            });

            if (existing) {
                return prev.map(item =>
                    (item.productId === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: unitPrice, // Persist the calculated price
                basePrice: product.price,
                image: product.image,
                selectedOptions,
                quantity
            }];
        });
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Orders
    // Phase 3: Added verification that payment was successful (status checking)
    const placeOrder = (shippingDetails, paymentDetails) => {
        if (!currentUser) return false;

        const newOrder = {
            id: Date.now().toString(),
            userId: currentUser.id,
            customerName: currentUser.name,
            email: currentUser.email,
            items: [...cart],
            total: getCartTotal(),
            status: 'Payé', // Phase 3: Orders are now created AFTER payment success
            date: new Date().toISOString(),
            shipping: shippingDetails,
            paymentId: paymentDetails ? paymentDetails.id : 'MANUAL_TEST'
        };
        setOrders([newOrder, ...orders]);
        clearCart();
        return newOrder;
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    };

    return (
        <DataContext.Provider value={{
            // Data
            projects, products,
            addProject, deleteProject, updateProject,
            addProduct, deleteProduct, updateProduct,

            // Auth
            users, currentUser, register, login, logout,

            // Cart
            cart, addToCart, removeFromCart, clearCart, getCartTotal,

            // Orders
            orders, placeOrder, updateOrderStatus,

            // Promo Codes
            promoCodes, addPromoCode, deletePromoCode
        }}>
            {children}
        </DataContext.Provider>
    );
};
