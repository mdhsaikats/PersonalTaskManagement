import { BASE_URL } from "./config.js";
import { showToast } from "./toast.js";

document
  .getElementById("registration")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    fetch(`${BASE_URL}/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        showToast("Registration successful!", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      })
      .catch((error) => {
        showToast("Registration failed. Please try again.", "error");
      });
  });
