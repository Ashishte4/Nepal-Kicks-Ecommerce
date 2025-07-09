// js/cart.js
import { allProductsData } from './productsData.js'; // Importing centralized product data

class CartPage {
    constructor() {
        this.products = allProductsData; 
        this.cart = window.app.cart; 
        this.init();
    }

    init() {
        this.renderCartItems();
        this.updateCartSummary();
        this.bindEvents();
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById("cartItems");
        const emptyCartContainer = document.getElementById("emptyCart");

        if (!cartItemsContainer || !emptyCartContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = "";
            emptyCartContainer.classList.remove("hidden");
        } else {
            emptyCartContainer.classList.add("hidden");
            cartItemsContainer.innerHTML = this.cart.map(item => this.createCartItemCard(item)).join("");
        }
    }

    createCartItemCard(item) {
        return `
            <div class="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <p class="text-secondary text-sm">Category: ${item.category}</p>
                    <p class="text-secondary text-sm">Size: ${item.size || 'N/A'}</p>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-3">
                            <button class="qty-btn text-gray-600 dark:text-gray-400 hover:text-primary" data-id="${item.id}" data-size="${item.size}" data-action="decrease">-</button>
                            <span class="qty-display font-medium">${item.quantity}</span>
                            <button class="qty-btn text-gray-600 dark:text-gray-400 hover:text-primary" data-id="${item.id}" data-size="${item.size}" data-action="increase">+</button>
                        </div>
                        <span class="font-bold">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}" data-size="${item.size}" data-action="remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }

    updateCartSummary() {
        const subtotalElement = document.getElementById("subtotal");
        const totalAmountElement = document.getElementById("totalAmount");
        const deliveryCostElement = document.getElementById("deliveryCost");

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let deliveryCost = 0;
        if (subtotal < 5000 && subtotal > 0) {
            deliveryCost = 200; 
            deliveryCostElement.textContent = `Rs. ${deliveryCost.toLocaleString()}`;
        } else if (subtotal === 0) {
            deliveryCostElement.textContent = `Free`; 
        } else {
            deliveryCostElement.textContent = `Free`;
        }

        const total = subtotal + deliveryCost;

        if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (totalAmountElement) totalAmountElement.textContent = `Rs. ${total.toLocaleString()}`;
    }

    bindEvents() {
        const cartItemsContainer = document.getElementById("cartItems");
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener("click", (e) => {
                const target = e.target.closest("button");
                if (!target) return;

                const productId = parseInt(target.dataset.id);
                const size = target.dataset.size || null;
                const action = target.dataset.action;

                if (isNaN(productId)) return;

                const item = this.cart.find(i => i.id === productId && i.size === size);

                if (action === "increase") {
                    if (item) item.quantity++;
                } else if (action === "decrease") {
                    if (item && item.quantity > 1) {
                        item.quantity--;
                    } else if (item && item.quantity === 1) {
                        // If quantity becomes 0, remove item
                        window.app.removeFromCart(productId, size);
                        window.app.showNotification(`${item.name} removed from bag`, 'info');
                    }
                } else if (action === "remove") {
                    if (item) {
                        window.app.removeFromCart(productId, size);
                        window.app.showNotification(`${item.name} removed from bag`, 'info');
                    }
                } else {
                    return; 
                }
                
                window.app.saveCart(); // Updating local storage via global app
                window.app.updateCartCount(); // Updating header cart count
                this.renderCartItems(); // Re-rendering cart display
                this.updateCartSummary(); // Re-calculating summary
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        window.cartPageInstance = new CartPage();
    } else {
        console.warn("NepalKicksApp not yet initialized. Retrying CartPage init...");
        setTimeout(() => {
            window.cartPageInstance = new CartPage();
        }, 50);
    }
});