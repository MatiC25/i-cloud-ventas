import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' 
import { ClerkProvider } from '@clerk/clerk-react'
import {dark} from "@clerk/themes"




ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
      <App />
  </React.StrictMode>,
)