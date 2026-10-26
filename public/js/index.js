const API_URL = "https://dummyjson.com/products";

const productGrid = document.getElementById("product-grid");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const resultMeta = document.getElementById("result-meta");
const productCount = document.getElementById("product-count");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const refreshBtn = document.getElementById("refresh-btn");
const retryBtn = document.getElementById("retry-btn");

let allProducts = [];

/**
 * Format angka ke mata uang USD
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}


function calculateDiscountPrice(originalPrice, discountPercentage = 0) {
  const safeDiscount = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  const finalPrice = originalPrice * (1 - safeDiscount / 100);
  return {
    originalPrice,
    finalPrice,
    discountPercentage: safeDiscount,
  };
}

/**
 * Hitung persentase lebar bintang kuning dari skala 5 dengan presisi desimal
 * @param {number} rating
 * @returns {number}
 */
function getStarWidthPercentage(rating) {
  const clampedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return Number(((clampedRating / 5) * 100).toFixed(2));
}

/**
 * Buat elemen kartu produk menggunakan manipulasi DOM
 * @param {Object} product
 * @returns {HTMLElement}
 */
function createProductCard(product) {
  const { originalPrice, finalPrice, discountPercentage } = calculateDiscountPrice(
    product.price,
    product.discountPercentage
  );
  const starWidth = getStarWidthPercentage(product.rating);
  const ratingFixed = Number(product.rating || 0).toFixed(2);

  const card = document.createElement("article");
  card.className = "product-card";

  const thumbWrapper = document.createElement("div");
  thumbWrapper.className = "product-thumb-wrapper";

  const img = document.createElement("img");
  img.className = "product-thumb";
  img.src = product.thumbnail;
  img.alt = product.title;
  img.loading = "lazy";
  thumbWrapper.appendChild(img);

  if (discountPercentage > 0) {
    const badge = document.createElement("span");
    badge.className = "discount-badge";
    badge.textContent = `-${discountPercentage.toFixed(1)}%`;
    thumbWrapper.appendChild(badge);
  }

  const body = document.createElement("div");
  body.className = "product-body";

  const category = document.createElement("span");
  category.className = "product-category";
  category.textContent = product.category || "umum";

  const title = document.createElement("h2");
  title.className = "product-title";
  title.textContent = product.title;

  
  const ratingRow = document.createElement("div");
  ratingRow.className = "rating-row";
  ratingRow.setAttribute("aria-label", `Rating ${ratingFixed} dari 5`);

  const starsOuter = document.createElement("div");
  starsOuter.className = "stars-outer";

  const starsInner = document.createElement("div");
  starsInner.className = "stars-inner";
  starsInner.style.width = `${starWidth}%`;
  starsOuter.appendChild(starsInner);

  const ratingValue = document.createElement("span");
  ratingValue.className = "rating-value";
  ratingValue.textContent = `${ratingFixed} / 5`;

  ratingRow.appendChild(starsOuter);
  ratingRow.appendChild(ratingValue);

  
  const priceGroup = document.createElement("div");
  priceGroup.className = "price-group";

  const finalPriceEl = document.createElement("span");
  finalPriceEl.className = "price-final";
  finalPriceEl.textContent = formatPrice(finalPrice);
  priceGroup.appendChild(finalPriceEl);

  if (discountPercentage > 0) {
    const originalPriceEl = document.createElement("del");
    originalPriceEl.className = "price-original";
    originalPriceEl.textContent = formatPrice(originalPrice);
    priceGroup.appendChild(originalPriceEl);
  }

  body.appendChild(category);
  body.appendChild(title);
  body.appendChild(ratingRow);
  body.appendChild(priceGroup);

  card.appendChild(thumbWrapper);
  card.appendChild(body);

  return card;
}

/**
 * Tampilkan daftar produk ke halaman web
 * @param {Array} products
 */
function renderProducts(products) {
  productGrid.innerHTML = "";
  productCount.textContent = String(products.length);
  resultMeta.classList.remove("hidden");

  if (products.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "Tidak ada produk yang cocok dengan pencarian Anda.";
    emptyMsg.style.color = "#71717a";
    productGrid.appendChild(emptyMsg);
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });
  productGrid.appendChild(fragment);
}

/**
 * Isi dropdown kategori  berdasarkan data produk
 * @param {Array} products
 */
function populateCategories(products) {
  const categories = [...new Set(products.map((item) => item.category))].sort();
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}


function filterAndDisplayProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = allProducts.filter((product) => {
    const matchesTitle = product.title.toLowerCase().includes(keyword);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesTitle && matchesCategory;
  });

  renderProducts(filtered);
}


async function fetchProducts() {
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  resultMeta.classList.add("hidden");
  productGrid.innerHTML = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Gagal mengambil data produk.`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.products)) {
      throw new Error("Format response JSON tidak valid.");
    }

    allProducts = data.products;
    populateCategories(allProducts);
    filterAndDisplayProducts();
  } catch (error) {
    errorMessage.textContent =
      error.message || "Tidak dapat terhubung ke server DummyJSON.";
    errorState.classList.remove("hidden");
  } finally {
    loadingState.classList.add("hidden");
  }
}


searchInput.addEventListener("input", filterAndDisplayProducts);
categoryFilter.addEventListener("change", filterAndDisplayProducts);
refreshBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  fetchProducts();
});
retryBtn.addEventListener("click", fetchProducts);

document.addEventListener("DOMContentLoaded", fetchProducts);