import React from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App"

document.addEventListener("DOMContentLoaded", function() {
  const root = document.querySelector('#mount') as Element
  createRoot(root).render(React.createElement(App))
})
