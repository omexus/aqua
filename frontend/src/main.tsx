import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import 'dotenv/config'
import { GoogleOAuthProvider } from "@react-oauth/google"


ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </GoogleOAuthProvider>
)
