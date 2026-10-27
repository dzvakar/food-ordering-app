let foods = [];
let foodModal;
let orderModal;

document.addEventListener("DOMContentLoaded", () => {
  foodModal = new bootstrap.Modal(document.getElementById("foodModal"));
  orderModal = new bootstrap.Modal(document.getElementById("orderModal"));

  document.getElementById("foodForm").addEventListener("submit", saveFood);
  document.getElementById("orderForm").addEventListener("submit", placeOrder);

  loadFoods();
  loadOrders();
});

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showAlert(message, type = "success") {
  document.getElementById("alertBox").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

async function loadFoods() {
  try {
    foods = await api("/api/foods");
    renderFoods();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function renderFoods() {
  const container = document.getElementById("foodList");

  if (!foods.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">No dishes yet. Click <b>Add Dish</b> to create your first menu item.</div>
      </div>`;
    return;
  }

  container.innerHTML = foods.map(food => `
    <div class="col-md-6 col-lg-4">
      <div class="card food-card shadow-sm">
        ${food.image
          ? `<img src="${escapeHtml(food.image)}" class="card-img-top food-image" alt="${escapeHtml(food.name)}">`
          : `<div class="food-image d-flex align-items-center justify-content-center fs-1">🍴</div>`}
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h5 class="card-title">${escapeHtml(food.name)}</h5>
            <span class="badge ${food.available ? "bg-success" : "bg-secondary"}">
              ${food.available ? "Available" : "Unavailable"}
            </span>
          </div>
          <small class="text-muted">${escapeHtml(food.category)}</small>
          <p class="card-text mt-2">${escapeHtml(food.description || "No description")}</p>
          <div class="price mb-3">₹${Number(food.price).toFixed(2)}</div>
          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" ${!food.available ? "disabled" : ""} onclick="openOrder('${food._id}')">Order</button>
            <button class="btn btn-outline-primary btn-sm" onclick="openEditFood('${food._id}')">Edit</button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteFood('${food._id}')">Delete</button>
          </div>
        </div>
      </div>
    </div>`).join("");
}

function openAddFood() {
  document.getElementById("foodForm").reset();
  document.getElementById("foodId").value = "";
  document.getElementById("foodAvailable").checked = true;
  document.getElementById("foodModalTitle").textContent = "Add Dish";
  foodModal.show();
}

function openEditFood(id) {
  const food = foods.find(item => item._id === id);
  if (!food) return;

  document.getElementById("foodId").value = food._id;
  document.getElementById("foodName").value = food.name;
  document.getElementById("foodCategory").value = food.category;
  document.getElementById("foodPrice").value = food.price;
  document.getElementById("foodDescription").value = food.description || "";
  document.getElementById("foodImage").value = food.image || "";
  document.getElementById("foodAvailable").checked = food.available;
  document.getElementById("foodModalTitle").textContent = "Update Dish";
  foodModal.show();
}

async function saveFood(event) {
  event.preventDefault();

  const id = document.getElementById("foodId").value;
  const payload = {
    name: document.getElementById("foodName").value,
    category: document.getElementById("foodCategory").value,
    price: Number(document.getElementById("foodPrice").value),
    description: document.getElementById("foodDescription").value,
    image: document.getElementById("foodImage").value,
    available: document.getElementById("foodAvailable").checked
  };

  try {
    if (id) {
      await api(`/api/foods/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showAlert("Dish updated successfully.");
    } else {
      await api("/api/foods", { method: "POST", body: JSON.stringify(payload) });
      showAlert("Dish added successfully.");
    }

    foodModal.hide();
    loadFoods();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function deleteFood(id) {
  if (!confirm("Are you sure you want to delete this dish?")) return;

  try {
    await api(`/api/foods/${id}`, { method: "DELETE" });
    showAlert("Dish deleted successfully.");
    loadFoods();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function openOrder(id) {
  const food = foods.find(item => item._id === id);
  if (!food) return;

  document.getElementById("selectedFoodId").value = food._id;
  document.getElementById("selectedFoodPrice").value = food.price;
  document.getElementById("selectedFoodNameValue").value = food.name;
  document.getElementById("selectedFoodName").textContent = `${food.name} — ₹${Number(food.price).toFixed(2)}`;
  document.getElementById("foodQuantity").value = 1;
  orderModal.show();
}

async function placeOrder(event) {
  event.preventDefault();

  const quantity = Number(document.getElementById("foodQuantity").value);
  const price = Number(document.getElementById("selectedFoodPrice").value);

  const payload = {
    customerName: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value,
    items: [{
      foodId: document.getElementById("selectedFoodId").value,
      name: document.getElementById("selectedFoodNameValue").value,
      price,
      quantity
    }],
    totalAmount: price * quantity
  };

  try {
    await api("/api/orders", { method: "POST", body: JSON.stringify(payload) });
    orderModal.hide();
    document.getElementById("orderForm").reset();
    showAlert("Order placed successfully.");
    loadOrders();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function loadOrders() {
  try {
    const orders = await api("/api/orders");
    renderOrders(orders);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function renderOrders(orders) {
  const container = document.getElementById("ordersList");

  if (!orders.length) {
    container.innerHTML = `<div class="alert alert-secondary">No customer orders yet.</div>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="card order-card shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-lg-3">
            <h5 class="mb-1">Order #${order._id.slice(-6).toUpperCase()}</h5>
            <div><b>${escapeHtml(order.customerName)}</b></div>
            <small>${escapeHtml(order.phone)}</small>
          </div>
          <div class="col-lg-3">
            ${order.items.map(item => `<div>${escapeHtml(item.name)} × ${item.quantity}</div>`).join("")}
            <strong>Total: ₹${Number(order.totalAmount).toFixed(2)}</strong>
          </div>
          <div class="col-lg-3">
            <small class="text-muted">Delivery address</small>
            <div>${escapeHtml(order.address)}</div>
          </div>
          <div class="col-lg-2">
            <select class="form-select status-select" onchange="updateOrderStatus('${order._id}', this.value)">
              ${["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]
                .map(status => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </div>
          <div class="col-lg-1">
            <button class="btn btn-outline-danger btn-sm" onclick="deleteOrder('${order._id}')">Delete</button>
          </div>
        </div>
      </div>
    </div>`).join("");
}

async function updateOrderStatus(id, status) {
  try {
    await api(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    showAlert("Order status updated.");
    loadOrders();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;

  try {
    await api(`/api/orders/${id}`, { method: "DELETE" });
    showAlert("Order deleted successfully.");
    loadOrders();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}