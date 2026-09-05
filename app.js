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

  msg.textContent = "✅ UID format is valid. Please confirm your UID before payment.";
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
}
