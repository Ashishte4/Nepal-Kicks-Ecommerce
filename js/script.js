import { allProductsData } from './productsData.js'; // Importing centralized product data

class NepalKicksApp {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    this.wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    this.theme = localStorage.getItem("theme") || "light";
    this.products = allProductsData; 

    this.init();
  }

  init() {
    this.initializeTheme();
    this.updateCartCount();
    this.updateWishlistCount();
    this.initializeAuth();
    this.initializeModals();
    this.initializeMobileMenu();
    this.loadTrendingProducts();
    this.bindEvents();
    this.initializeAnimations();
  }

  // Theme Management
  initializeTheme() {
    this.applyTheme(this.theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    this.applyTheme(this.theme);
    this.updateThemeIcon();
    localStorage.setItem("theme", this.theme);
    this.showNotification(`Switched to ${this.theme} mode`);
  }

  applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const moonIcon = themeToggle.querySelector(".fa-moon");
      const sunIcon = themeToggle.querySelector(".fa-sun");

      if (this.theme === "dark") {
        moonIcon?.classList.add("hidden");
        sunIcon?.classList.remove("hidden");
      } else {
        moonIcon?.classList.remove("hidden");
        sunIcon?.classList.add("hidden");
      }
    }
  }

  // Authentication
  initializeAuth() {
    this.updateAuthButton();
  }

  updateAuthButton() {
    const authBtn = document.getElementById("authBtn");
    if (authBtn) {
      if (this.currentUser) {
        authBtn.textContent = `Hi, ${this.currentUser.name.split(" ")[0]}`;
      } else {
        authBtn.textContent = "Sign In";
      }
    }
  }

  // Modals
  initializeModals() {
    const authBtn = document.getElementById("authBtn");
    const authModal = document.getElementById("authModal");

    if (authBtn && authModal) {
      authBtn.addEventListener("click", () => {
        if (this.currentUser) {
          this.logout();
        } else {
          this.showModal("authModal");
        }
      });
    }

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-overlay");
        this.hideModal(modal.id);
      });
    });

    // Close modal on overlay click
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.hideModal(overlay.id);
        }
      });
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  // Mobile Menu
  initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        const icon = mobileMenuBtn.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      });
    }
  }

  loadTrendingProducts() {
    const container = document.getElementById("trendingProducts");
    if (!container) return;

    const trendingProducts = this.products.filter((p) => p.trending).slice(0, 4);

    container.innerHTML = trendingProducts
      .map(
        (product) => `
            <div class="product-card group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="relative overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg" 
                                onclick="event.stopPropagation(); app.toggleWishlist(${product.id})">
                            <i class="far fa-heart text-lg text-gray-700"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">${product.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">${product.category}</p>
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-lg text-gray-900 dark:text-white">Rs. ${product.price.toLocaleString()}</span>
                        <div class="flex space-x-1">
                            ${product.colors
                              .slice(0, 3)
                              .map(
                                (color) => `
                                <div class="w-4 h-4 rounded-full border border-gray-300" style="background-color: ${this.getColorCode(color)}" title="${color}"></div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  getColorCode(colorName) {
    const colors = {
      Black: "#000000",
      White: "#FFFFFF",
      Red: "#FF0000",
      Blue: "#0000FF",
      Gray: "#808080",
      "Black/Red": "#000000",
      "Multi-color": "linear-gradient(45deg, #FF0000, #0000FF, #00FF00)",
      "Chalk": "#F5F5DC",
      "Green": "#008000",
      "Navy": "#000080",
      "Orange": "#FFA500",
      "Volt": "#CCFF00",
      "Cream": "#FFFDD0",
      "Gold": "#FFD700",
      "Yellow": "#FFFF00",
      "Pink": "#FFC0CB", 
    };
    return colors[colorName] || "#000000";
  }

  // Cart Management
  addToCart(productId, size = null, quantity = 1) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find((item) => item.id === productId && item.size === size);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        ...product,
        size,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${product.name} added to bag`);
  }

  removeFromCart(productId, size = null) {
    this.cart = this.cart.filter((item) => !(item.id === productId && item.size === size));
    this.saveCart();
    this.updateCartCount();
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      if (totalItems > 0) {
        cartCount.classList.remove("hidden");
        cartCount.classList.add("flex");
      } else {
        cartCount.classList.add("hidden");
        cartCount.classList.remove("flex");
      }
    }
  }
  toggleWishlist(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    const existingIndex = this.wishlist.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      this.wishlist.splice(existingIndex, 1);
      this.showNotification(`${product.name} removed from favorites`);
    } else {
      this.wishlist.push(product);
      this.showNotification(`${product.name} added to favorites`);
    }

    this.saveWishlist();
    this.updateWishlistCount();
  }

  saveWishlist() {
    localStorage.setItem("wishlist", JSON.stringify(this.wishlist));
  }

  updateWishlistCount() {
    const wishlistCount = document.querySelector(".wishlist-count");
    if (wishlistCount) {
      wishlistCount.textContent = this.wishlist.length;
      if (this.wishlist.length > 0) {
        wishlistCount.classList.remove("hidden");
        wishlistCount.classList.add("flex");
      } else {
        wishlistCount.classList.add("hidden");
        wishlistCount.classList.remove("flex");
      }
    }
  }

  // Authentication
  login(email, password) {
    // Simulating the login
    const user = {
      id: 1,
      name: "Ashish SHAH",
      email: email,
    };

    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.updateAuthButton();
    this.hideModal("authModal");
    this.showNotification("Welcome back!");
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.updateAuthButton();
    this.showNotification("You've been signed out");
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 transform translate-x-full transition-transform duration-300 max-w-sm`;

    notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${message}</span>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Animations
  initializeAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".fade-in-up").forEach((el) => {
      observer.observe(el);
    });
  }

  bindEvents() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Newsletter form
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        if (email) {
          this.showNotification("Thanks for signing up!");
          newsletterForm.reset();
        }
      });
    }

    // Auth form
    const authForm = document.getElementById("authForm");
    if (authForm) {
      authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.login(formData.get("email"), formData.get("password"));
      });
    }
document.querySelectorAll('input[placeholder="Search"]').forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = e.target.value.trim();
          if (query) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  window.app = new NepalKicksApp();
});

// Performance monitoring
window.addEventListener("load", () => {
  if ("performance" in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
  }
});