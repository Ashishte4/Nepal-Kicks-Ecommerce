// js/shop.js
import { allProductsData } from './productsData.js'; // Import centralized product data

class ShopPage {
  constructor() {
    this.products = allProductsData; // Use the imported centralized product data
    this.filteredProducts = [...this.products];
    this.currentPage = 1;
    this.productsPerPage = 9;
    this.filters = {
      categories: [],
      genders: [],
      prices: [],
      sizes: [],
      search: "",
    };

    this.init();
  }

  init() {
    // Theme initialization is handled by NepalKicksApp in script.js which runs first
    // No need to initializeTheme again here.
    this.initializeFilters();
    this.initializeSearch();
    this.initializeSorting();
    this.loadProducts(); // Initial product load
    this.handleURLParams(); // Apply filters/search from URL
    this.bindEvents();
  }

  // Removed initializeTheme and updateThemeIcon from here as script.js handles it globally

  initializeFilters() {
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateFilters();
        this.applyFilters();
      });
    });

    // Gender filters
    document.querySelectorAll('input[name="gender"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateFilters();
        this.applyFilters();
      });
    });

    // Price filters
    document.querySelectorAll('input[name="price"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateFilters();
        this.applyFilters();
      });
    });

    // Size filters
    document.querySelectorAll(".size-filter").forEach((button) => {
      button.addEventListener("click", () => {
        const isActive = button.classList.contains("bg-accent");

        // Deactivate all size buttons first
        document.querySelectorAll(".size-filter").forEach((btn) => {
          btn.classList.remove("bg-accent", "text-white", "border-accent");
          btn.classList.add("bg-white", "dark:bg-gray-800", "text-gray-900", "dark:text-white", "border-gray-300", "dark:border-gray-600");
        });

        // Activate the clicked button if it wasn't active
        if (!isActive) {
          button.classList.add("bg-accent", "text-white", "border-accent");
          button.classList.remove("bg-white", "dark:bg-gray-800", "text-gray-900", "dark:text-white", "border-gray-300", "dark:border-gray-600");
        }

        this.updateFilters();
        this.applyFilters();
      });
    });
  }

  updateFilters() {
    this.filters.categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(
      (checkbox) => checkbox.value,
    );

    this.filters.genders = Array.from(document.querySelectorAll('input[name="gender"]:checked')).map(
      (checkbox) => checkbox.value,
    );

    this.filters.prices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(
      (checkbox) => checkbox.value,
    );

    // Correctly get selected size from active button
    this.filters.sizes = Array.from(document.querySelectorAll(".size-filter.bg-accent")).map(
      (button) => button.dataset.size,
    );
  }

  initializeSearch() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }
  }

  initializeSorting() {
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortProducts(e.target.value);
      });
    }
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((product) => {
      // Category filter
      if (this.filters.categories.length > 0) {
        // More robust category mapping
        const productCategoryMapped = (() => {
          const cat = product.category.toLowerCase();
          if (cat.includes("shoe")) return "shoes";
          if (cat.includes("t-shirt") || cat.includes("hoodie") || cat.includes("pants") || cat.includes("clothing")) return "clothing";
          return "accessories"; // Default or other explicit accessory type
        })();
        
        if (!this.filters.categories.includes(productCategoryMapped)) {
          return false;
        }
      }

      // Gender filter
      if (this.filters.genders.length > 0 && !this.filters.genders.includes(product.gender)) {
        return false;
      }

      // Price filter
      if (this.filters.prices.length > 0) {
        const matchesPrice = this.filters.prices.some((priceRange) => {
          switch (priceRange) {
            case "0-5000":
              return product.price < 5000;
            case "5000-15000":
              return product.price >= 5000 && product.price < 15000;
            case "15000-25000":
              return product.price >= 15000 && product.price < 25000;
            case "25000+":
              return product.price >= 25000;
            default:
              return true;
          }
        });
        if (!matchesPrice) return false;
      }

      // Size filter: Ensure product.sizes exists before checking
      if (this.filters.sizes.length > 0 && product.sizes && !product.sizes.some((size) => this.filters.sizes.includes(String(size)))) {
        return false;
      }

      // Search filter
      if (this.filters.search && !product.name.toLowerCase().includes(this.filters.search)) {
        return false;
      }

      return true;
    });

    this.currentPage = 1; // Reset to first page after filtering
    this.loadProducts();
    this.updateResultsCount();
  }

  sortProducts(sortBy) {
    switch (sortBy) {
      case "price-low":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Sort newest first, then by ID as a tie-breaker
        this.filteredProducts.sort((a, b) => (b.newest ? 1 : 0) - (a.newest ? 1 : 0) || (a.id - b.id));
        break;
      case "featured":
      default:
        // Sort featured first, then by ID as a tie-breaker
        this.filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.id - b.id));
        break;
    }

    this.loadProducts();
  }

  loadProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToRender = this.filteredProducts.slice(0, endIndex); // Only render up to endIndex

    grid.innerHTML = productsToRender.map((product) => this.createProductCard(product)).join("");

    const loadMoreBtn = document.getElementById("loadMore");
    if (loadMoreBtn) {
      if (endIndex >= this.filteredProducts.length) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "block";
        loadMoreBtn.onclick = () => this.loadMoreProducts();
      }
    }
  }

  loadMoreProducts() {
    this.currentPage++;
    this.loadProducts();
  }

  createProductCard(product) {
    return `
            <div class="product-card group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="relative overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button type="button" class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                                onclick="event.stopPropagation(); window.app.toggleWishlist(${product.id})">
                            <i class="far fa-heart text-lg text-gray-700"></i>
                        </button>
                    </div>
                    ${
                      product.originalPrice
                        ? `
                        <div class="absolute top-4 left-4">
                            <span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                ${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                            </span>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="p-6">
                    <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">${product.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">${product.category}</p>
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                            <span class="font-bold text-lg text-gray-900 dark:text-white">Rs. ${product.price.toLocaleString()}</span>
                            ${
                              product.originalPrice
                                ? `
                                <span class="text-sm text-gray-500 line-through">Rs. ${product.originalPrice.toLocaleString()}</span>
                            `
                                : ""
                            }
                        </div>
                    </div>
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
        `;
  }

  getColorCode(colorName) {
    const colors = {
      Black: "#000000",
      White: "#FFFFFF",
      Red: "#FF0000",
      Blue: "#0000FF",
      Gray: "#808080",
      Pink: "#FFC0CB",
      Green: "#008000",
      Navy: "#000080",
      "Black/Red": "#000000",
      "Multi-color": "linear-gradient(45deg, #FF0000, #0000FF, #00FF00)",
      "Chalk": "#F5F5DC",
      "Orange": "#FFA500",
      "Volt": "#CCFF00",
      "Cream": "#FFFDD0",
      "Gold": "#FFD700",
      "Yellow": "#FFFF00",
    };
    return colors[colorName] || "#000000";
  }

  updateResultsCount() {
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount) {
      resultsCount.textContent = `${this.filteredProducts.length} Results`;
    }
  }

  handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    const search = urlParams.get("search");

    let initialFilterApplied = false;

    if (category) {
        // Handle "new" or "sale" categories (which are not filters in the sidebar)
        if (category === "new") {
            this.filteredProducts = this.products.filter(p => p.newest);
            initialFilterApplied = true;
        } else if (category === "sale") {
            this.filteredProducts = this.products.filter(p => p.originalPrice);
            initialFilterApplied = true;
        }

        // Check/activate corresponding filter checkboxes/buttons
        const genderCheckbox = document.querySelector(`input[name="gender"][value="${category}"]`);
        if (genderCheckbox) {
            genderCheckbox.checked = true;
            this.filters.genders.push(category); // Add to active filters
            initialFilterApplied = true;
        } else {
            const categoryCheckbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
                this.filters.categories.push(category); // Add to active filters
                initialFilterApplied = true;
            }
        }
        this.updateFilters(); // Recalculate filters after setting checkboxes
        this.applyFilters(); // Re-apply all filters, including any from URL
        
        const mainHeading = document.querySelector('.max-w-7xl.mx-auto.px-6.py-8 main h1');
        if (mainHeading) {
            if (category === 'new') {
                mainHeading.textContent = 'New Arrivals';
            } else if (category === 'sale') {
                mainHeading.textContent = 'On Sale';
            } else if (category === 'men' || category === 'women' || category === 'kids') {
                mainHeading.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`;
            } else {
                mainHeading.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}`;
            }
        }
    }

    if (search) {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = search;
        this.filters.search = search.toLowerCase();
        initialFilterApplied = true;
      }
    }

    if (initialFilterApplied) {
        this.applyFilters(); 
        this.sortProducts(document.getElementById("sortSelect").value);
    } else {
        
        this.sortProducts(document.getElementById("sortSelect").value);
    }

    const currentPath = window.location.pathname.split('/').pop();
    const currentCategory = urlParams.get("category");

    document.querySelectorAll('ul.lg\\:flex li a').forEach(link => {
        link.classList.remove('text-accent', 'border-b-2', 'border-accent');
        link.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
    });

    if (currentPath === 'shop.html') {
        if (currentCategory === 'new') {
            const newFeaturedLink = document.querySelector('ul.lg\\:flex li a[href*="category=new"]');
            if (newFeaturedLink) {
                newFeaturedLink.classList.add('text-accent', 'border-b-2', 'border-accent');
                newFeaturedLink.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
            }
        } else if (currentCategory === 'men') {
            const menLink = document.querySelector('ul.lg\\:flex li a[href*="category=men"]');
            if (menLink) {
                menLink.classList.add('text-accent', 'border-b-2', 'border-accent');
                menLink.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
            }
        } else if (currentCategory === 'women') {
            const womenLink = document.querySelector('ul.lg\\:flex li a[href*="category=women"]');
            if (womenLink) {
                womenLink.classList.add('text-accent', 'border-b-2', 'border-accent');
                womenLink.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
            }
        } else if (currentCategory === 'kids') {
            const kidsLink = document.querySelector('ul.lg\\:flex li a[href*="category=kids"]');
            if (kidsLink) {
                kidsLink.classList.add('text-accent', 'border-b-2', 'border-accent');
                kidsLink.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
            }
        } else if (currentCategory === 'sale' || !currentCategory) { // 'Sale' link or default shop.html (all products)
            const saleLink = document.querySelector('ul.lg\\:flex li a[href="shop.html"]');
            if (saleLink) {
                saleLink.classList.add('text-accent', 'border-b-2', 'border-accent');
                saleLink.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-gray-900', 'dark:hover:text-white');
            }
        }
    }
}

  bindEvents() {
  }

}

document.addEventListener("DOMContentLoaded", () => {
  window.shopPageInstance = new ShopPage();
});