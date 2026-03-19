import { BASE_URL } from "./config.js";

const emailInput = document.getElementById("profile_email");

async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/profile/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Profile fetch failed: ${res.status}`);
    }

    const data = await res.json();
    if (data && data.email && emailInput) {
      emailInput.value = data.email;
    } else if (emailInput) {
      emailInput.placeholder = "Email unavailable";
    }
  } catch (err) {
    console.error(err);
    if (emailInput) emailInput.placeholder = "Unable to load email";
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
