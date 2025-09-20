import React, { useState, useEffect } from 'react'
import api from '../services/api'

function PaymentSummary({ billId, splits }) {
  const [paymentLinks, setPaymentLinks] = useState([])
  const [organizerVenmo, setOrganizerVenmo] = useState('')
  const [loading, setLoading] = useState(false)

  const generatePaymentLinks = async () => {
    if (!organizerVenmo.trim()) {
      alert('Please enter your Venmo username')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/bills/${billId}/payment-links?organizer_venmo=${organizerVenmo}`)
      setPaymentLinks(response.data.payment_links)
    } catch (error) {
      console.error('Failed to generate payment links:', error)
      alert('Failed to generate payment links. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Venmo Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Setup</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={organizerVenmo}
            onChange={(e) => setOrganizerVenmo(e.target.value)}
            placeholder="Your Venmo username (without @)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generatePaymentLinks}
            disabled={loading || !organizerVenmo.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Links'}
          </button>
        </div>
      </div>

      {/* Payment Links */}
      {paymentLinks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Links</h3>
          {paymentLinks.map((link, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">{link.person}</h4>
                <span className="text-xl font-bold text-green-600">
                  ${link.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                {/* QR Code */}
                <div className="text-center">
                  <img 
                    src={link.qr_code} 
                    alt={`QR code for ${link.person}`}
                    className="mx-auto w-32 h-32"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Scan with Venmo app
                  </p>
                </div>
                
                {/* Venmo Link */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Venmo Link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link.venmo_link}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(link.venmo_link)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* Open in Venmo Button */}
                <a
                  href={link.venmo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Open in Venmo
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentSummary
