const products = [
  {
    id: 1,
    name: "Cyberpunk Headphones",
    price: 199.99,
    category: "audio",
    image: "/assests/images/cyber_headphones.jpeg",
    rating: 4.8,
    reviews: 342,
    description:
      "Premium wireless headphones with active noise cancellation and immersive 3D audio. Experience studio-quality sound with 40-hour battery life.",
    features: [
      "Active Noise Cancellation",
      "40-Hour Battery Life",
      "Bluetooth 5.2",
      "Premium Sound Quality",
    ],
  },
  {
    id: 2,
    name: "Neon Gaming Mouse",
    price: 79.99,
    category: "gaming",
    image: "/assests/images/Neon_mouse.jpeg",
    rating: 4.9,
    reviews: 521,
    description:
      "Ultra-responsive gaming mouse with customizable RGB lighting and 16,000 DPI sensor. Ergonomic design for extended gaming sessions.",
    features: [
      "16,000 DPI Sensor",
      "Customizable RGB",
      "Ergonomic Design",
      "6 Programmable Buttons",
    ],
  },
  {
    id: 3,
    name: "RGB Mechanical Keyboard",
    price: 149.99,
    category: "gaming",
    image: "/assests/images/RGB_Keyboard.jpeg",
    rating: 4.7,
    reviews: 289,
    description:
      "Premium mechanical keyboard with hot-swappable switches and per-key RGB lighting. Built for gamers and professionals.",
    features: [
      "Hot-Swappable Switches",
      "Per-Key RGB",
      "Aluminum Frame",
      "N-Key Rollover",
    ],
  },
  {
    id: 4,
    name: "Wireless Earbuds Pro",
    price: 129.99,
    category: "audio",
    image: "/assests/images/Pods.jpeg",
    rating: 4.6,
    reviews: 467,
    description:
      "True wireless earbuds with adaptive EQ and spatial audio. Crystal clear calls and 8-hour playback per charge.",
    features: [
      "Adaptive EQ",
      "Spatial Audio",
      "8-Hour Battery",
      "IPX4 Water Resistant",
    ],
  },
  {
    id: 5,
    name: "Smart Watch Ultra",
    price: 399.99,
    category: "wearable",
    image: "/assests/images/Watch.jpeg",
    rating: 4.9,
    reviews: 612,
    description:
      "Advanced fitness tracking with heart rate monitoring, GPS, and always-on display. Track your health 24/7.",
    features: [
      "Heart Rate Monitor",
      "Built-in GPS",
      "Always-On Display",
      "5-Day Battery Life",
    ],
  },
  {
    id: 6,
    name: "Premium Laptop Stand",
    price: 89.99,
    category: "accessories",
    image: "/assests/images/laptopstand.jpeg",
    rating: 4.5,
    reviews: 234,
    description:
      "Adjustable aluminum laptop stand with ergonomic design. Improve posture and cooling with 6 height settings.",
    features: [
      "6 Height Settings",
      "Aluminum Build",
      "Non-Slip Design",
      "Cable Management",
    ],
  },
  {
    id: 7,
    name: "USB-C Hub Elite",
    price: 59.99,
    category: "accessories",
    image: "/assests/images/usb_Elite.jpg",
    rating: 4.7,
    reviews: 189,
    description:
      "7-in-1 USB-C hub with 4K HDMI, USB 3.0, SD card reader, and 100W power delivery. Your ultimate connectivity solution.",
    features: [
      "4K HDMI Output",
      "100W Power Delivery",
      "USB 3.0 Ports",
      "SD Card Reader",
    ],
  },
  {
    id: 8,
    name: "Gaming Chair Pro",
    price: 299.99,
    category: "gaming",
    image: "/assests/images/Gaming_Chair.jpeg",
    rating: 4.8,
    reviews: 421,
    description:
      "Ergonomic gaming chair with lumbar support and reclining backrest. Premium materials for all-day comfort.",
    features: [
      "Lumbar Support",
      "Reclining Backrest",
      "Premium Materials",
      "360° Swivel",
    ],
  },
];

const categories = [
  { id: "all", name: "All Products" },
  { id: "gaming", name: "Gaming" },
  { id: "audio", name: "Audio" },
  { id: "wearable", name: "Wearables" },
  { id: "accessories", name: "Accessories" },
];

const state = {
  cart: [],
  showCart: false,
  selectedCategory: "all",
  searchQuery: "",
  sortBy: "featured",
  selectedProduct: null,
};

const gridEl = document.getElementById("grid");
const categoryListEl = document.getElementById("categoryList");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const cartRoot = document.getElementById("cartRoot");
const modalRoot = document.getElementById("modalRoot");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");

function formatPrice(n) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function updateCartBadge() {
  const count = state.cart.reduce((s, i) => s + (i.quantity || 0), 0);
  if (count > 0) {
    cartBadge.style.display = "flex";
    cartBadge.textContent = count;
  } else {
    cartBadge.style.display = "none";
  }
}

function addToCart(product) {
  console.log("addToCart called with:", product);
  const existing = state.cart.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 0) + 1;
    console.log("Updated quantity for existing item:", existing);
  } else {
    state.cart.push({ ...product, quantity: 1 });
    console.log("Added new item to cart:", product.name);
  }
  console.log("Current cart:", state.cart);
  updateCartBadge();
  if (state.showCart) renderCartPanel();
  if (cartBtn.animate) {
    cartBtn.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" },
      ],
      { duration: 300 }
    );
  }
}

function updateQuantity(id, delta) {
  state.cart = state.cart
    .map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, (item.quantity || 0) + delta) };
      }
      return item;
    })
    .filter((i) => i.quantity > 0);
  updateCartBadge();
  renderCartPanel();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  updateCartBadge();
  renderCartPanel();
}

function getTotal() {
  return state.cart.reduce((s, i) => s + (i.quantity || 0) * i.price, 0);
}

function matchesFilters(p) {
  const catOK =
    state.selectedCategory === "all" || p.category === state.selectedCategory;
  const q = (state.searchQuery || "").trim().toLowerCase();
  const searchOK = !q || p.name.toLowerCase().includes(q);
  return catOK && searchOK;
}

function sortedProducts(list) {
  const sort = state.sortBy;
  let arr = [...list];
  if (sort === "price-low") arr.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") arr.sort((a, b) => b.price - a.price);
  else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
  return arr;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showProductModal(product) {
  state.selectedProduct = product;
  renderProductModal();
}

function closeProductModal() {
  state.selectedProduct = null;
  renderProductModal();
}

function renderProductModal() {
  modalRoot.innerHTML = "";
  if (!state.selectedProduct) return;

  const product = state.selectedProduct;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="closeModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class="modal-body">
        <div class="modal-image">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
          <div class="new-pill">NEW</div>
        </div>
        
        <div class="modal-details">
          <h2 class="modal-title">${escapeHtml(product.name)}</h2>
          
          <div class="modal-rating">
            <div class="stars">
              ${Array(5)
                .fill(0)
                .map(
                  (_, i) => `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${
                  i < Math.floor(product.rating) ? "#fbbf24" : "none"
                }" stroke="#fbbf24" stroke-width="1.5">
                  <path d="M12 17.3L6.16 20l1.15-6.73L2 9.26l6.84-.99L12 2.5l3.16 5.77 6.84.99-5.31 4.01L17.85 20z"/>
                </svg>
              `
                )
                .join("")}
            </div>
            <span style="color: var(--muted); font-size: 14px;">${
              product.rating
            } (${product.reviews} reviews)</span>
          </div>
          
          <div class="modal-price">${formatPrice(product.price)}</div>
          
          <div class="modal-description">
            ${escapeHtml(product.description)}
          </div>
          
          <div class="modal-features">
            <div style="font-weight: 700; margin-bottom: 10px; color: var(--accent-cyan); font-size: 16px;">Key Features:</div>
            ${product.features
              .map(
                (feature) => `
              <div class="feature-item">
                <svg class="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${escapeHtml(feature)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="modal-actions">
            
            <button class="modal-btn btn-secondary" id="modalClose2">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modalRoot.appendChild(overlay);

  overlay
    .querySelector("#closeModal")
    .addEventListener("click", closeProductModal);
  overlay
    .querySelector("#modalClose2")
    .addEventListener("click", closeProductModal);
  overlay.querySelector(".modal-overlay").addEventListener("click", (e) => {
    if (e.target.className === "modal-overlay") closeProductModal();
  });

  overlay.querySelector("#modalAddToCart").addEventListener("click", () => {
    addToCart(product);
    closeProductModal();
  });
}

function renderCategories() {
  categoryListEl.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className =
      "cat-btn" + (state.selectedCategory === cat.id ? " active" : "");
    btn.textContent = cat.name;
    btn.onclick = () => {
      state.selectedCategory = cat.id;
      renderCategories();
      renderGrid();
    };
    categoryListEl.appendChild(btn);
  });
}

function renderGrid() {
  const filtered = products.filter(matchesFilters);
  const final = sortedProducts(filtered);
  gridEl.innerHTML = "";

  if (final.length === 0) {
    gridEl.innerHTML =
      '<div style="padding:60px 20px;color:var(--muted); grid-column: 1 / -1; text-align:center; font-size:18px;">No products match your search.</div>';
    return;
  }

  final.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb">
        <img loading="lazy" src="${product.image}" alt="${escapeHtml(
      product.name
    )}" />
        <div class="new-pill">NEW</div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(product.name)}</h3>
        <div class="meta">
          <div class="flex gap-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M12 17.3L6.16 20l1.15-6.73L2 9.26l6.84-.99L12 2.5l3.16 5.77 6.84.99-5.31 4.01L17.85 20z"/>
            </svg>
            <span class="tiny">${product.rating}</span>
          </div>
          <span class="tiny muted">(${product.reviews} reviews)</span>
        </div>
        <div class="price-row">
          <div class="price">${formatPrice(product.price)}</div>
          <button class="add-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (!e.target.closest(".add-btn")) {
        showProductModal(product);
      }
    });

    gridEl.appendChild(card);
  });

  gridEl.querySelectorAll(".add-btn").forEach((btn) => {
    const id = Number(btn.dataset.id);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const p = products.find((x) => x.id === id);
      if (p) addToCart(p);
    });
  });
}

function renderCartPanel() {
  cartRoot.innerHTML = "";
  if (!state.showCart) return;

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  overlay.innerHTML = `
    <div class="cart-backdrop"></div>
    <div class="cart-panel">
      <div class="cart-header">
        <div>
          <h2>Shopping Cart</h2>
          <div class="tiny muted">${state.cart.length} item(s)</div>
        </div>
        <button id="closeCart" class="icon-btn" style="background:var(--accent-pink); border-color:var(--accent-pink);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="cartItems" class="cart-items"></div>
      <div id="cartSummary"></div>
    </div>
  `;
  cartRoot.appendChild(overlay);

  overlay.querySelector(".cart-backdrop").addEventListener("click", () => {
    state.showCart = false;
    renderCartPanel();
  });
  overlay.querySelector("#closeCart").addEventListener("click", () => {
    state.showCart = false;
    renderCartPanel();
  });

  const cartItemsEl = overlay.querySelector("#cartItems");
  if (state.cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--muted)">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style="opacity:.5; margin-bottom:20px">
          <path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="10" cy="20" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
        </svg>
        <div style="font-size:18px">Your cart is empty</div>
      </div>
    `;
  } else {
    cartItemsEl.innerHTML = "";
    state.cart.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.name)}"/>
        <div style="flex:1">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="tiny muted" style="margin-top:6px">${formatPrice(
            item.price
          )} each</div>
          <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between">
            <div class="qty-controls">
              <button class="icon-btn dec" data-id="${
                item.id
              }" style="width:32px; height:32px; padding:4px;">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M19 12H5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div style="min-width:32px;text-align:center;font-weight:700; font-size:16px;">${
                item.quantity
              }</div>
              <button class="icon-btn inc" data-id="${
                item.id
              }" style="width:32px; height:32px; padding:4px;">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div style="display:flex; align-items:center; gap:12px">
              <div style="font-weight:700; color:var(--accent-cyan); font-size:16px">${formatPrice(
                (item.quantity || 0) * item.price
              )}</div>
              <button class="icon-btn remove" data-id="${
                item.id
              }" style="background:rgba(236,72,153,0.1); border-color:var(--accent-pink); width:36px; height:36px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="var(--accent-pink)" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(itemEl);
    });

    const summaryEl = overlay.querySelector("#cartSummary");
    summaryEl.innerHTML = `
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; margin-top:20px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px; font-size:16px">
          <div>Subtotal:</div>
          <div style="font-weight:700;color:var(--accent-cyan)">${formatPrice(
            getTotal()
          )}</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px; font-size:16px">
          <div>Shipping:</div>
          <div style="font-weight:700;color:#34d399">FREE</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:22px;margin-bottom:20px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1)">
          <div style="font-weight:800">Total:</div>
          <div style="font-weight:900; color:var(--accent-cyan)">${formatPrice(
            getTotal()
          )}</div>
        </div>
        <button id="checkoutBtn" class="primary-cta">Proceed to Checkout</button>
      </div>
    `;
  }

  overlay.querySelectorAll(".dec").forEach((b) => {
    b.addEventListener("click", () => updateQuantity(Number(b.dataset.id), -1));
  });
  overlay.querySelectorAll(".inc").forEach((b) => {
    b.addEventListener("click", () => updateQuantity(Number(b.dataset.id), 1));
  });
  overlay.querySelectorAll(".remove").forEach((b) => {
    b.addEventListener("click", () => removeFromCart(Number(b.dataset.id)));
  });

  const checkoutBtn = overlay.querySelector("#checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert(
        `Demo checkout - Total: ${formatPrice(
          getTotal()
        )}\n\nThis is just a UI demo!`
      );
      state.cart = [];
      updateCartBadge();
      state.showCart = false;
      renderCartPanel();
    });
  }
}

searchInput.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  clearTimeout(searchInput._t);
  searchInput._t = setTimeout(renderGrid, 200);
});

sortSelect.addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  renderGrid();
});

cartBtn.addEventListener("click", () => {
  state.showCart = !state.showCart;
  renderCartPanel();
});

function init() {
  renderCategories();
  renderGrid();
  updateCartBadge();
  sortSelect.value = state.sortBy;
}
init();
