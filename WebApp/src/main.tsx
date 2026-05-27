import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

window.onerror = (msg, url, line, col, err) => {
  console.error("GLOBAL ERROR:", msg, err)
  const div = document.createElement("div")
  div.style.cssText = "position:fixed;bottom:0;left:0;right:0;background:#ef4444;color:#fff;padding:16px;font-size:14px;z-index:9999;font-family:monospace"
  div.textContent = `Error: ${err?.message || msg}`
  document.body.appendChild(div)
}

window.addEventListener("unhandledrejection", (e) => {
  console.error("UNHANDLED PROMISE:", e.reason)
})

console.log("main.tsx loaded")

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {})
  })
}

const root = document.getElementById("root")
console.log("Root element:", root)

ReactDOM.createRoot(root!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log("React rendered")
