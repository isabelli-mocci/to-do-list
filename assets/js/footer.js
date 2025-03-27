/**
 * Altera o ano no rodapé automaticamente.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
});
