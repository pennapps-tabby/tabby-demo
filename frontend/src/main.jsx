import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './index.css'
import HomePage from './pages/HomePage'
import BillPage from './pages/BillPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import PaymentLinks from './pages/PaymentLinks'
import PaymentRedirectPage from './pages/PaymentRedirectPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'bill/:billId', element: <BillPage /> },
      { path: 'bill/:billId/payment-links', element: <PaymentLinks /> },
      { path: 'pay', element: <PaymentRedirectPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)