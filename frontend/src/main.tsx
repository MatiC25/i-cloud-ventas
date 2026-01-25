import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' 
import { ClerkProvider } from '@clerk/clerk-react'
import {dark} from "@clerk/themes"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Falta la VITE_CLERK_PUBLISHABLE_KEY en el archivo .env")
}


ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
      <App />
  </React.StrictMode>,
)