// js/product.js
import { allProductsData } from './productsData.js'; 

class ProductPage {
    constructor() {
        this.products = allProductsData; 
        this.currentProduct = null;
        this.selectedSize = null; 
        this.selectedColor = null; 

        this.init();
    }

    init() {
        this.loadProductDetails();
        this.initializeImageGallery(); 
        this.initializeColorSelection();
        this.initializeTabFunctionality();
        this.loadRelatedProducts();
        this.bindAddToCart();
    }

    loadProductDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get("id"));

        this.currentProduct = this.products.find(p => p.id === productId);

        if (!this.currentProduct) {
            console.error("Product not found for ID:", productId);
            document.getElementById("productDetails").innerHTML = `
                <div class="text-center py-20">
                    <h1 class="text-4xl font-bold mb-4">Product Not Found</h1>
                    <p class="text-secondary mb-8">The product you are looking for does not exist or has been removed.</p>
                    <a href="shop.html" class="bg-primary dark:bg-white dark:text-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        Back to Shop
                    </a>
                </div>
            `;
            const relatedSection = document.getElementById("relatedProductsSection");
            if (relatedSection) relatedSection.classList.add("hidden");
            return;
        }

        const breadcrumbProductName = document.getElementById("breadcrumbProductName");
        if (breadcrumbProductName) {
            breadcrumbProductName.textContent = this.currentProduct.name;
        }

        document.getElementById("productName").textContent = this.currentProduct.name;
        document.getElementById("productCategory").textContent = this.currentProduct.category;
        document.getElementById("productPrice").textContent = `Rs. ${this.currentProduct.price.toLocaleString()}`;
        document.getElementById("mainImage").src = this.currentProduct.image;
        document.getElementById("productDescription").textContent = this.currentProduct.description || "No description available.";

        const originalPriceElement = document.getElementById("originalPrice");
        const discountBadge = document.getElementById("discountBadge");
        if (this.currentProduct.originalPrice) {
            originalPriceElement.textContent = `Rs. ${this.currentProduct.originalPrice.toLocaleString()}`;
            originalPriceElement.classList.remove("hidden");
            const discount = Math.round((1 - this.currentProduct.price / this.currentProduct.originalPrice) * 100);
            discountBadge.textContent = `${discount}% OFF`;
            discountBadge.classList.remove("hidden");
        } else {
            originalPriceElement.classList.add("hidden");
            discountBadge.classList.add("hidden");
        }

        const colorOptionsContainer = document.getElementById("colorOptions");
        if (colorOptionsContainer) {
            colorOptionsContainer.innerHTML = '';
            this.currentProduct.colors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = `w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer flex items-center justify-center relative transition-all duration-200`;
                colorDiv.style.backgroundColor = this.getColorCode(color);
                colorDiv.title = color;
                colorDiv.dataset.color = color;

                const checkIcon = document.createElement('i');
                checkIcon.className = `fas fa-check text-xs absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 hidden`;
                if (color === 'White' || color === 'Chalk' || color === 'Cream' || color === 'Yellow' || color === 'Gold' || color === 'Volt') {
                    checkIcon.classList.add('text-gray-800');
                } else {
                    checkIcon.classList.add('text-white');
                }
                colorDiv.appendChild(checkIcon);
                colorOptionsContainer.appendChild(colorDiv);
            });
            this.initializeColorSelection();
        }

        const sizeOptionsContainer = document.getElementById("sizeOptions");
        if (sizeOptionsContainer) {
            sizeOptionsContainer.innerHTML = '';
            if (this.currentProduct.sizes && this.currentProduct.sizes.length > 0) {
                this.currentProduct.sizes.map(size => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `size-option border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm hover:border-accent transition-colors`;
                    button.dataset.size = size;
                    button.textContent = size;
                    sizeOptionsContainer.appendChild(button);
                });
                this.initializeSizeSelection();
            } else {
                sizeOptionsContainer.innerHTML = `<p class="text-secondary">No sizes available for this product.</p>`;
            }
        }
        // Removed additionalImages from this part as well, only main image now
        // The thumbnailContainer logic will be updated in initializeImageGallery
    }

    // Image gallery functionality (updated to only use main image)
    initializeImageGallery() {
        const thumbnailContainer = document.getElementById("thumbnailContainer");
        if (thumbnailContainer && this.currentProduct) {
            // Clear existing thumbnails
            thumbnailContainer.innerHTML = '';

            // Only add the main product image as a thumbnail
            const mainImageButton = document.createElement('button');
            mainImageButton.type = 'button';
            mainImageButton.className = `border border-primary aspect-square rounded-lg overflow-hidden`;
            mainImageButton.onclick = () => this.changeImage(this.currentProduct.image, mainImageButton);
            
            const img = document.createElement('img');
            img.src = this.currentProduct.image;
            img.alt = `${this.currentProduct.name} - Main View`;
            img.className = 'w-full h-full object-cover';
            
            mainImageButton.appendChild(img);
            thumbnailContainer.appendChild(mainImageButton);

            // Seting the main image to the product's primary image
            const mainImageElement = document.getElementById("mainImage");
            if (mainImageElement) {
                mainImageElement.src = this.currentProduct.image;
            }
        }
    }

    changeImage(newSrc, clickedButton) {
        const mainImage = document.getElementById("mainImage");
        mainImage.src = newSrc;

        document.querySelectorAll("#thumbnailContainer button").forEach((btn) => {
            btn.classList.remove("border-primary");
            btn.classList.add("border-gray-200", "dark:border-gray-700");
        });
        if (clickedButton) {
            clickedButton.classList.add("border-primary");
            clickedButton.classList.remove("border-gray-200", "dark:border-gray-700");
        }
    }

    initializeSizeSelection() {
        document.querySelectorAll(".size-option").forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".size-option").forEach((btn) => {
                    btn.classList.remove("border-primary", "bg-primary", "text-white");
                    btn.classList.add("border-gray-300", "dark:border-gray-600");
                });
                button.classList.add("border-primary", "bg-primary", "text-white");
                button.classList.remove("border-gray-300", "dark:border-gray-600");
                this.selectedSize = button.dataset.size;
            });
        });
        const firstSizeOption = document.querySelector(".size-option");
        if (firstSizeOption) {
            firstSizeOption.click();
        }
    }

    initializeColorSelection() {
        document.querySelectorAll("#colorOptions div[data-color]").forEach((colorDiv) => {
            colorDiv.addEventListener("click", () => {
                document.querySelectorAll("#colorOptions div[data-color]").forEach((div) => {
                    div.classList.remove('border-primary', 'ring-2', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-gray-900');
                    div.querySelector('i')?.classList.add('hidden');
                });
                colorDiv.classList.add('border-primary', 'ring-2', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-gray-900');
                colorDiv.querySelector('i')?.classList.remove('hidden');
                this.selectedColor = colorDiv.dataset.color;
            });
        });
        const firstColorOption = document.querySelector("#colorOptions div[data-color]");
        if (firstColorOption) {
            firstColorOption.click();
        }
    }

    initializeTabFunctionality() {
        document.querySelectorAll(".tab-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const tabId = button.dataset.tab;

                document.querySelectorAll(".tab-btn").forEach((btn) => {
                    btn.classList.remove("border-primary", "text-primary", "dark:text-white");
                    btn.classList.add("border-transparent", "text-secondary", "dark:text-gray-400");
                });
                button.classList.add("border-primary", "text-primary", "dark:text-white");
                button.classList.remove("border-transparent", "text-secondary", "dark:text-gray-400");

                document.querySelectorAll(".tab-content").forEach((content) => {
                    content.classList.add("hidden");
                });
                document.getElementById(tabId).classList.remove("hidden");
            });
        });
        const firstTabBtn = document.querySelector(".tab-btn");
        if (firstTabBtn) {
            firstTabBtn.click();
        }
    }

    loadRelatedProducts() {
        const container = document.getElementById("relatedProducts");
        if (!container) return;

        const otherProducts = this.products.filter(p =>
            p.id !== this.currentProduct.id &&
            (p.gender === this.currentProduct.gender || p.category === this.currentProduct.category)
        );
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        let selectedRelated = shuffled.slice(0, 4);

        if (selectedRelated.length < 4) {
            const allOtherProducts = this.products.filter(p => p.id !== this.currentProduct.id);
            const moreShuffled = allOtherProducts.sort(() => 0.5 - Math.random());
            selectedRelated = [...new Set([...selectedRelated, ...moreShuffled])].slice(0, 4);
        }

        container.innerHTML = selectedRelated
            .map(
                (product) => `
                <div class="product-card group cursor-pointer" onclick="window.location.href='product.html?id=${product.id}'">
                    <div class="relative overflow-hidden rounded-lg mb-4">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover">
                        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button type="button" class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    onclick="event.stopPropagation(); window.app.toggleWishlist(${product.id})">
                                <i class="far fa-heart text-lg"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-name font-semibold">${product.name}</div>
                        <div class="product-category text-secondary text-sm">${product.category}</div>
                        <div class="product-price font-semibold">Rs. ${product.price.toLocaleString()}</div>
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

    bindAddToCart() {
        const addToBagBtn = document.getElementById("addToBagBtn");
        if (addToBagBtn) {
            addToBagBtn.addEventListener("click", () => {
                if (!this.selectedSize) {
                    window.app.showNotification("Please select a size.", "error");
                    return;
                }
                window.app.addToCart(this.currentProduct.id, this.selectedSize, 1);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.productPageInstance = new ProductPage();
});