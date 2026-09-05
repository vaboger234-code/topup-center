let selected = null;
let orderId = null;
let settings = {};

async function load() {
  try {
    // Settings load
    const settingsRes = await fetch("/api/settings");
    settings = await settingsRes.json();

    document.querySelector("#store").textContent =
      settings.storeName || "Free Fire Top Up";

    if (settings.upiId) {
      document.querySelector("#upi").textContent =
        "UPI: " + settings.upiId;
    }

    if (settings.qrImageUrl) {
      document.querySelector("#qr").src = settings.qrImageUrl;
    }

    // Products load
    const productsRes = await fetch("/api/products");
    const products = await productsRes.json();

    const list = document.querySelector("#list");

    list.innerHTML = products.map(p => `
      <div class="product">
        <b>${p.name}</b>
        <p>${p.description || ""}</p>
        <div class="price">₹${p.price}</div>
        <button class="btn" onclick='choose(${JSON.stringify(p)})'>
          Select
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error("Load error:", error);

    document.querySelector("#list").innerHTML =
      "<p>❌ Packages load nahi ho rahe. Please refresh.</p>";
  }
}


function verify() {
  const uid = document.querySelector("#uid").value.trim();
  const msg = document.querySelector("#verifyMsg");

  if (!uid) {
    msg.textContent = "❌ Please enter your Free Fire UID.";
    return;
  }

  if (!/^\d+$/.test(uid)) {
    msg.textContent = "❌ UID must contain numbers only.";
    return;
  }

  if (uid.length < 8 || uid.length > 12) {
    msg.textContent = "❌ Please enter a valid Free Fire UID.";
    return;
  }

  msg.textContent =
    "✅ UID format is valid. Please confirm your UID before payment.";

  document.querySelector("#products").scrollIntoView({
    behavior: "smooth"
  });
}


function choose(p) {
  const uid = document.querySelector("#uid").value.trim();
  const region = document.querySelector("#region").value;

  if (!uid) {
    alert("Enter your UID first.");
    return;
  }

  selected = p;

  document.querySelector("#summary").textContent =
    `UID: ${uid} • ${p.name} • ₹${p.price}`;

  document.querySelector("#pay").classList.remove("hidden");

  document.querySelector("#pay").scrollIntoView({
    behavior: "smooth"
  });

  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uid: uid,
      region: region,
      itemId: p.id
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.orderId) {
        orderId = data.orderId;
      }
    })
    .catch(error => {
      console.error("Order error:", error);
    });
}


function paid() {
  if (!orderId) {
    alert("Order create nahi hua. Please package dobara select karein.");
    return;
  }

  fetch("/api/orders/" + orderId + "/paid", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(
          "✅ Payment submitted!\n\nOrder ID: " +
          data.orderId +
          "\n\nYour order is pending manual verification."
        );
      }
    })
    .catch(error => {
      console.error("Payment error:", error);
      alert("❌ Payment submit nahi hua.");
    });
}


// Website load hote hi packages load karo
load();
