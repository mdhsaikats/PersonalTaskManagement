export function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");

  let color = "bg-green-500";
  if (type === "error") color = "bg-red-500";
  if (type === "warning") color = "bg-yellow-500";

  toast.className = `${color} text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-full opacity-0 transition-all duration-300`;

  toast.innerText = message;

  container.appendChild(toast);

  // show animation
  setTimeout(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
  }, 50);

  // hide after 3s
  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
