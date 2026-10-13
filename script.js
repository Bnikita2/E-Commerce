/* =========================================================
   Kora — simple e-commerce front end (vanilla JavaScript)
   Sections: data, state, helpers, render, cart logic, events
   ========================================================= */

/* ---------- Product data ---------- */
const PRODUCTS = [
  { id: 1,  name: "Wireless Headphones", category: "Audio",     price: 3499, oldPrice: 4999, rating: 4.6, emoji: "🎧", color: "#dbe7ff", tag: "Sale",
    desc: "Over-ear headphones with soft cushions and active noise cancelling for long work sessions.",
    specs: ["35 hours of battery life", "Bluetooth 5.3 with fast pairing", "Foldable design with carry pouch"] },
  { id: 2,  name: "Bluetooth Speaker",   category: "Audio",     price: 1999, rating: 4.3, emoji: "🔊", color: "#ffe3d6",
    desc: "A compact, water-resistant speaker with clear sound for the desk, kitchen or balcony.",
    specs: ["12 hours of playtime", "IPX6 water resistance", "USB-C charging"] },
  { id: 3,  name: "Mechanical Keyboard", category: "Desk",      price: 4299, rating: 4.8, emoji: "⌨️", color: "#e4f4e8", tag: "New",
    desc: "A tenkeyless keyboard with hot-swappable switches and a solid aluminium frame.",
    specs: ["Hot-swappable switches", "White backlight, 3 brightness levels", "Wired and wireless modes"] },
  { id: 4,  name: "Ergonomic Mouse",     category: "Desk",      price: 1499, rating: 4.4, emoji: "🖱️", color: "#fff1c9",
    desc: "A vertical-grip mouse that keeps your wrist in a natural position.",
    specs: ["Adjustable 800–2400 DPI", "Silent click buttons", "Rechargeable battery"] },
  { id: 5,  name: "Laptop Stand",        category: "Desk",      price: 1299, oldPrice: 1799, rating: 4.5, emoji: "💻", color: "#e9e4f7", tag: "Sale",
    desc: "A foldable aluminium stand that lifts your screen to eye level.",
    specs: ["Six height settings", "Fits 10–17 inch laptops", "Folds flat for travel"] },
  { id: 6,  name: "Smart Watch",         category: "Wearables", price: 5999, rating: 4.2, emoji: "⌚", color: "#d9f1f5",
    desc: "A lightweight watch that tracks steps, sleep and heart rate with a bright AMOLED display.",
    specs: ["7-day battery life", "Heart rate and SpO2 sensors", "5 ATM water resistance"] },
  { id: 7,  name: "Fitness Band",        category: "Wearables", price: 2199, rating: 4.1, emoji: "📿", color: "#fde0e6",
    desc: "A slim band for everyday activity tracking, with 20 workout modes.",
    specs: ["14-day battery life", "20 workout modes", "Call and message alerts"] },
  { id: 8,  name: "Earbuds",             category: "Audio",     price: 2799, oldPrice: 3499, rating: 4.5, emoji: "🎵", color: "#e2e8f0", tag: "Sale",
    desc: "Small true wireless earbuds with a charging case and a clear microphone for calls.",
    specs: ["28 hours with the case", "Touch controls", "IPX4 sweat resistance"] },
  { id: 9,  name: "Desk Lamp",           category: "Home",      price: 1199, rating: 4.7, emoji: "💡", color: "#fff3bf",
    desc: "A dimmable LED lamp with three colour temperatures and a flexible neck.",
    specs: ["Touch dimming", "Warm, neutral and cool light", "Eye-care flicker-free LED"] },
  { id: 10, name: "Ceramic Mug Set",     category: "Home",      price: 899,  rating: 4.4, emoji: "☕", color: "#f6e7da",
    desc: "A set of two hand-glazed mugs that are microwave and dishwasher safe.",
    specs: ["Set of 2, 320 ml each", "Microwave and dishwasher safe", "Matte speckled glaze"] },
  { id: 11, name: "Indoor Plant Pot",    category: "Home",      price: 649,  rating: 4.3, emoji: "🪴", color: "#dff2dc", tag: "New",
    desc: "A self-watering planter with a drainage tray, suited to small desk plants.",
    specs: ["Self-watering reservoir", "Holds up to 18 cm plants", "Recycled materials"] },
  { id: 12, name: "Backpack",            category: "Wearables", price: 2499, rating: 4.6, emoji: "🎒", color: "#dce3f0",
    desc: "A water-resistant 24 L backpack with a padded laptop sleeve and hidden back pocket.",
    specs: ["Fits up to 15.6 inch laptops", "Water-resistant fabric", "Padded, breathable back panel"] }
];

const FREE_SHIPPING_ABOVE = 2000;
const SHIPPING_FEE = 99;
const FEATURED_ID = 3;

/* ---------- State ---------- */
const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: loadCart()       // [{ id, qty }]
};

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const money = (n) => "₹" + n.toLocaleString("en-IN");
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("kora-cart")) || [];
  } catch (e) {
    return [];
  }
}
function saveCart() {
  try {
    localStorage.setItem("kora-cart", JSON.stringify(state.cart));
  } catch (e) { /* storage unavailable: cart still works for this session */ }
}

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2000);
}

/* ---------- Rendering: products ---------- */
function getVisibleProducts() {
  let list = PRODUCTS.filter((p) => {
    const matchCat = state.category === "All" || p.category === state.category;
    const q = state.search.trim().toLowerCase();
    const matchText = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchText;
  });

  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

function productCard(p) {
  return `
    <article class="card">
      <button class="thumb" style="background:${p.color}" data-view="${p.id}" aria-label="View details for ${p.name}">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <span aria-hidden="true">${p.emoji}</span>
      </button>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3>${p.name}</h3>
        <span class="rating"><b>★ ${p.rating.toFixed(1)}</b> rating</span>
        <div class="card-foot">
          <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</span>
          <button class="add-btn" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const list = getVisibleProducts();
  $("#product-grid").innerHTML = list.map(productCard).join("");
  $("#empty").hidden = list.length > 0;
  $("#result-count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
}

function renderFilters() {
  const cats = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  $("#filters").innerHTML = cats
    .map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${c === state.category}">${c}</button>`)
    .join("");
}

function renderHero() {
  const p = findProduct(FEATURED_ID);
  $("#hero-feature").innerHTML = `
    <div class="thumb" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span></div>
    <div class="meta">
      <div>
        <h3>${p.name}</h3>
        <span class="price">${money(p.price)}</span>
      </div>
      <button class="btn btn-accent" data-view="${p.id}">View details</button>
    </div>`;
}

/* ---------- Rendering: modal ---------- */
let modalQty = 1;
let modalProductId = null;

function openModal(id) {
  const p = findProduct(id);
  modalProductId = id;
  modalQty = 1;
  $("#modal-body").innerHTML = `
    <div class="thumb" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span></div>
    <div class="modal-info">
      <span class="card-cat">${p.category}</span>
      <h2 id="modal-title">${p.name}</h2>
      <span class="rating"><b>★ ${p.rating.toFixed(1)}</b> rating</span>
      <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</span>
      <p>${p.desc}</p>
      <ul class="specs">${p.specs.map((s) => `<li>${s}</li>`).join("")}</ul>
      <div class="qty-row">
        <div class="qty">
          <button data-modal-qty="-1" aria-label="Decrease quantity">−</button>
          <span id="modal-qty">1</span>
          <button data-modal-qty="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-primary" data-modal-add>Add to cart</button>
      </div>
    </div>`;
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
}

/* ---------- Rendering: cart ---------- */
function cartTotals() {
  const subtotal = state.cart.reduce((sum, i) => sum + findProduct(i.id).price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const count = state.cart.reduce((n, i) => n + i.qty, 0);
  $("#cart-count").textContent = count;

  const empty = state.cart.length === 0;
  $("#cart-empty").hidden = !empty;
  $("#cart-footer").hidden = empty;
  $("#cart-items").hidden = empty;

  $("#cart-items").innerHTML = state.cart
    .map((item) => {
      const p = findProduct(item.id);
      return `
        <li class="cart-item">
          <div class="thumb" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span></div>
          <div>
            <h3>${p.name}</h3>
            <span class="price">${money(p.price * item.qty)}</span>
            <div class="qty">
              <button data-cart-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity of ${p.name}">−</button>
              <span>${item.qty}</span>
              <button data-cart-qty="${p.id}" data-delta="1" aria-label="Increase quantity of ${p.name}">+</button>
            </div>
          </div>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </li>`;
    })
    .join("");

  const { subtotal, shipping, total } = cartTotals();
  $("#subtotal").textContent = money(subtotal);
  $("#shipping").textContent = shipping === 0 ? "Free" : money(shipping);
  $("#total").textContent = money(total);
}

/* ---------- Cart logic ---------- */
function addToCart(id, qty = 1) {
  const existing = state.cart.find((i) => i.id === id);
  if (existing) existing.qty += qty;
  else state.cart.push({ id, qty });

  saveCart();
  renderCart();

  const badge = $("#cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth;            // restart the animation
  badge.classList.add("bump");
  toast(`${findProduct(id).name} added to cart`);
}

function changeQty(id, delta) {
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

/* ---------- Open / close panels ---------- */
function openDrawer() {
  $("#drawer").hidden = false;
  document.body.style.overflow = "hidden";
}
function closePanel(which) {
  $("#" + which).hidden = true;
  if ($("#modal").hidden && $("#drawer").hidden) document.body.style.overflow = "";
}

/* ---------- Events ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;

  if (t.dataset.add) addToCart(Number(t.dataset.add));
  else if (t.dataset.view) openModal(Number(t.dataset.view));
  else if (t.dataset.cat) {
    state.category = t.dataset.cat;
    renderFilters();
    renderProducts();
  }
  else if (t.dataset.modalQty) {
    modalQty = Math.max(1, modalQty + Number(t.dataset.modalQty));
    $("#modal-qty").textContent = modalQty;
  }
  else if (t.hasAttribute("data-modal-add")) {
    addToCart(modalProductId, modalQty);
    closePanel("modal");
  }
  else if (t.dataset.cartQty) changeQty(Number(t.dataset.cartQty), Number(t.dataset.delta));
  else if (t.dataset.remove) removeFromCart(Number(t.dataset.remove));
  else if (t.dataset.close) closePanel(t.dataset.close);
});

// Backdrops are divs, so handle them separately
document.addEventListener("click", (e) => {
  const close = e.target.closest(".modal-backdrop");
  if (close) closePanel(close.dataset.close);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closePanel("modal"); closePanel("drawer"); }
});

$("#cart-btn").addEventListener("click", openDrawer);
$("#search").addEventListener("input", (e) => { state.search = e.target.value; renderProducts(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });

$("#clear-cart").addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
});

$("#checkout").addEventListener("click", () => {
  const { total } = cartTotals();
  state.cart = [];
  saveCart();
  renderCart();
  closePanel("drawer");
  toast(`Order placed! You paid ${money(total)} (demo only)`);
});

/* ---------- Init ---------- */
renderHero();
renderFilters();
renderProducts();
renderCart();
