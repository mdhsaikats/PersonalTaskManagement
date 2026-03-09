import { BASE_URL } from "./config.js";
import { showToast } from "./toast.js";

document.getElementById("login").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/login`, {
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
      showToast("Login successful!", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    })
    .catch((error) => {
      showToast("Login failed. Please check your credentials.", "error");
    });
});
