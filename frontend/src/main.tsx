import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SimpleManagerApp from './SimpleManagerApp.tsx'
import './index.css'
// import 'dotenv/config'
import { GoogleOAuthProvider } from "@react-oauth/google"

// Switch between regular app and manager app
const USE_MANAGER_APP = true; // Set to true to use the new manager app

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com">
    <React.StrictMode>
      {USE_MANAGER_APP ? <SimpleManagerApp /> : <App />}
    </React.StrictMode>
  </GoogleOAuthProvider>
)
