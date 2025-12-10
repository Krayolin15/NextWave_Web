document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const PRODUCT_API_URL = 'https://fakestoreapi.com/products?limit=10'; 
    let productsData = []; 
    
    // --- Cart State ---
    // Load cart from local storage to maintain state between sessions
    let cart = JSON.parse(localStorage.getItem('tamrin_cart')) || [];

    // --- DOM Elements ---
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const productListContainer = document.getElementById('product-list');
    const sortSelect = document.getElementById('sort-by');
    const cartCountSpan = document.querySelector('.cart-count');

    // Cart Drawer DOM elements
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceSpan = document.querySelector('.cart-total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');


    // =================================================================
    // 1. DATA FETCHING AND RENDERING
    // =================================================================

    /**
     * Generates HTML for star rating icons based on the rate value.
     */
    function generateStarRating(rate) {
        let stars = '';
        const roundedRate = Math.round(rate * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRate) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 === roundedRate) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    /**
     * Renders products into the main grid.
     */
    function renderProducts(products) {
        if (!productListContainer) return;
        productListContainer.innerHTML = ''; 

        if (products.length === 0) {
            productListContainer.innerHTML = `<div class="empty-message">No products found.</div>`;
            return;
        }

        products.forEach(product => {
            const cardHTML = `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p class="category">${product.category}</p>
                        <div class="rating">
                            ${generateStarRating(product.rating.rate)}
                            <span class="review-count">(${product.rating.count})</span>
                        </div>
                        <p class="price">R${product.price.toFixed(2)}</p>
                        <button class="btn add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            productListContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        attachCartListeners();
    }

    /**
     * Fetches product data from the API and initiates rendering.
     */
    async function fetchProducts() {
        try {
            productListContainer.innerHTML = `<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>`;

            const response = await fetch(PRODUCT_API_URL);
            if (!response.ok) throw new Error('Failed to fetch product data from API.');
            
            productsData = await response.json();
            
            // Truncate long titles for better display
            productsData.forEach(p => {
                p.title = p.title.length > 50 ? p.title.substring(0, 47) + '...' : p.title;
            });

            renderProducts(productsData);

        } catch (error) {
            console.error("Error fetching products:", error);
            productListContainer.innerHTML = `<div class="error-message">Error loading products. Please check your connection.</div>`;
        }
    }

    // =================================================================
    // 2. INTERACTIVITY & SORTING
    // =================================================================

    /**
     * Sorts the products based on user selection (price, rating).
     */
    function handleSortChange() {
        const sortValue = sortSelect.value;
        let sortedProducts = [...productsData];

        if (sortValue === 'price-asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-desc') {
             sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'rating-desc') {
            sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        } 

        renderProducts(sortedProducts);
    }

    // =================================================================
    // 3. CART MANAGEMENT
    // =================================================================

    /**
     * Saves the current cart state to LocalStorage and updates the UI.
     */
    function updateCart() {
        // Save to persistent storage
        localStorage.setItem('tamrin_cart', JSON.stringify(cart));
        
        // Render UI
        renderCartItems();
    }

    /**
     * Renders all items currently in the cart array into the drawer.
     */
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
            if (checkoutBtn) {
                checkoutBtn.disabled = true; 
                checkoutBtn.textContent = 'Cart is Empty';
            }
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${item.title}</h4>
                            <p>R${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceed to Checkout';
            }
        }
        
        // Use South African Rand (R)
        cartTotalPriceSpan.textContent = `R${subtotal.toFixed(2)}`;
        cartCountSpan.textContent = totalItems;

        // Reattach remove listeners after rendering
        document.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveFromCart);
        });
    }

    /**
     * Toggles the visibility of the cart drawer and background overlay.
     */
    function toggleCart(open) {
        if (open) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    /**
     * Adds a product to the cart or increments quantity if it exists.
     */
    function handleAddToCart(event) {
        const productId = parseInt(event.target.dataset.productId);
        const product = productsData.find(p => p.id === productId);

        if (product) {
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            updateCart(); // Update local storage and UI
            toggleCart(true);

            // Simple visual feedback
            event.target.textContent = 'Added!';
            event.target.disabled = true;
            setTimeout(() => {
                event.target.textContent = 'Add to Cart';
                event.target.disabled = false;
            }, 1500);
        }
    }

    /**
     * Removes an item completely from the cart.
     */
    function handleRemoveFromCart(event) {
        const productId = parseInt(event.currentTarget.dataset.id);
        
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            updateCart(); // Update local storage and UI
        }
        
        if (cart.length === 0) {
            toggleCart(false);
        }
    }

    /**
     * Attaches click listeners to all "Add to Cart" buttons.
     */
    function attachCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.removeEventListener('click', handleAddToCart); // Prevent double-binding
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    // =================================================================
    // 4. CHECKOUT LOGIC
    // =================================================================
    
    /**
     * Handles the checkout process: validates cart, ensures data is saved, and initiates redirection.
     */
    function handleCheckout(event) {
        event.preventDefault(); 
        
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            toggleCart(false); 
            return;
        }

        // Data is saved via updateCart(), now we simulate checkout
        console.log("Proceeding to checkout with items:", cart);
        
        // This is the simulated action. In a live environment: window.location.href = '/checkout.html';
        alert(`Redirecting to Checkout! Total items: ${cart.length}. Total Price: ${cartTotalPriceSpan.textContent}`);
        toggleCart(false); 
    }


    // =================================================================
    // 5. INITIALIZATION
    // =================================================================
    
    fetchProducts();
    sortSelect.addEventListener('change', handleSortChange);
    
    // Attach main UI listeners
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout); 
    }
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => toggleCart(true));
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCart(false));
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => toggleCart(false)); 
    }
    
    // Initial load of the cart items (from local storage)
    renderCartItems(); 
});


document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const PRODUCT_API_URL = 'https://fakestoreapi.com/products?limit=10'; 
    let productsData = []; 
    
    // --- Cart State ---
    let cart = JSON.parse(localStorage.getItem('tamrin_cart')) || [];

    // --- DOM Elements ---
    const mobileMenu = document.getElementById('mobile-menu'); // Target the mobile menu container
    const menuToggleBtn = document.querySelector('.menu-toggle'); // Target the hamburger icon button
    const productListContainer = document.getElementById('product-list');
    const sortSelect = document.getElementById('sort-by');
    const cartCountSpan = document.querySelector('.cart-count');

    // Cart Drawer DOM elements
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceSpan = document.querySelector('.cart-total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');


    // =================================================================
    // 1. DATA FETCHING AND RENDERING
    // =================================================================

    function generateStarRating(rate) {
        let stars = '';
        const roundedRate = Math.round(rate * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRate) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 === roundedRate) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    function renderProducts(products) {
        if (!productListContainer) return;
        productListContainer.innerHTML = ''; 

        if (products.length === 0) {
            productListContainer.innerHTML = `<div class="empty-message">No products found.</div>`;
            return;
        }

        products.forEach(product => {
            const cardHTML = `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p class="category">${product.category}</p>
                        <div class="rating">
                            ${generateStarRating(product.rating.rate)}
                            <span class="review-count">(${product.rating.count})</span>
                        </div>
                        <p class="price">R${product.price.toFixed(2)}</p>
                        <button class="btn add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            productListContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        attachCartListeners();
    }

    async function fetchProducts() {
        try {
            productListContainer.innerHTML = `<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>`;

            const response = await fetch(PRODUCT_API_URL);
            if (!response.ok) throw new Error('Failed to fetch product data from API.');
            
            productsData = await response.json();
            
            productsData.forEach(p => {
                p.title = p.title.length > 50 ? p.title.substring(0, 47) + '...' : p.title;
            });

            renderProducts(productsData);

        } catch (error) {
            console.error("Error fetching products:", error);
            productListContainer.innerHTML = `<div class="error-message">Error loading products. Please check your connection.</div>`;
        }
    }

    // =================================================================
    // 2. INTERACTIVITY & SORTING
    // =================================================================

    function handleSortChange() {
        const sortValue = sortSelect.value;
        let sortedProducts = [...productsData];

        if (sortValue === 'price-asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-desc') {
             sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'rating-desc') {
            sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        } 

        renderProducts(sortedProducts);
    }

    // =================================================================
    // 3. CART MANAGEMENT
    // =================================================================

    function updateCart() {
        localStorage.setItem('tamrin_cart', JSON.stringify(cart));
        renderCartItems();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
            if (checkoutBtn) {
                checkoutBtn.disabled = true; 
                checkoutBtn.textContent = 'Cart is Empty';
            }
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${item.title}</h4>
                            <p>R${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceed to Checkout';
            }
        }
        
        cartTotalPriceSpan.textContent = `R${subtotal.toFixed(2)}`;
        cartCountSpan.textContent = totalItems;

        document.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveFromCart);
        });
    }

    function toggleCart(open) {
        if (open) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function handleAddToCart(event) {
        const productId = parseInt(event.target.dataset.productId);
        const product = productsData.find(p => p.id === productId);

        if (product) {
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            updateCart();
            toggleCart(true);

            event.target.textContent = 'Added!';
            event.target.disabled = true;
            setTimeout(() => {
                event.target.textContent = 'Add to Cart';
                event.target.disabled = false;
            }, 1500);
        }
    }

    function handleRemoveFromCart(event) {
        const productId = parseInt(event.currentTarget.dataset.id);
        
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            updateCart();
        }
        
        if (cart.length === 0) {
            toggleCart(false);
        }
    }

    function attachCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.removeEventListener('click', handleAddToCart); 
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    // =================================================================
    // 4. GENERAL UI INTERACTION
    // =================================================================
    
    // ⭐️ Mobile Menu Toggle Logic ⭐️
    if (menuToggleBtn && mobileMenu) {
        menuToggleBtn.addEventListener('click', () => {
            // Toggle the 'open' class on the mobile menu container
            mobileMenu.classList.toggle('open');
            
            // Toggle the icon (Hamburger <-> Close)
            const icon = menuToggleBtn.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times'); // Change to 'X' icon
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars'); // Change back to Hamburger icon
            }
        });
    }
    
    function handleCheckout(event) {
        event.preventDefault(); 
        
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            toggleCart(false); 
            return;
        }

        console.log("Proceeding to checkout with items:", cart);
        
        alert(`Redirecting to Checkout! Total items: ${cart.length}. Total Price: ${cartTotalPriceSpan.textContent}`);
        toggleCart(false); 
    }


    // =================================================================
    // 5. INITIALIZATION & Event Listeners
    // =================================================================
    
    fetchProducts();
    sortSelect.addEventListener('change', handleSortChange);
    
    // Cart Drawer Toggle Listeners
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout); 
    }
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => toggleCart(true));
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCart(false));
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => toggleCart(false)); 
    }
    
    renderCartItems(); 
});