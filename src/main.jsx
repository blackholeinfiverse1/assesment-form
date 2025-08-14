import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { CLERK_PUBLISHABLE_KEY } from './config/auth'
import './index.css'
import App from './App.jsx'

const clerkKey = CLERK_PUBLISHABLE_KEY

const Root = () => (
  <StrictMode>
    {clerkKey ? (
      <ClerkProvider publishableKey={clerkKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>
)

createRoot(document.getElementById('root')).render(<Root />)
