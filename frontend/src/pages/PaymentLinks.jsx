import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

function PaymentLinks() {
  const { billId } = useParams()
  const navigate = useNavigate()
  const [organizerVenmo, setOrganizerVenmo] = useState('')
  const [paymentInfo, setPaymentInfo] = useState({ payment_links: [], outstanding_amount: 0, my_total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [billDetails, setBillDetails] = useState(null)
  const [linksGenerated, setLinksGenerated] = useState(false)

  useEffect(() => {
    const savedVenmo = localStorage.getItem('organizerVenmo')
    if (savedVenmo) {
      setOrganizerVenmo(savedVenmo)
    }

    const initialize = async () => {
      try {
        setIsLoading(true)
        const billDetailsResponse = await api.get(`/bills/${billId}`)
        setBillDetails(billDetailsResponse.data)

        const venmoHandle = localStorage.getItem('organizerVenmo')
        if (venmoHandle) {
          // If venmo handle exists, generate links automatically
          await handleGenerateLinks(venmoHandle, billDetailsResponse.data)
        }
      } catch (err) {
        setError('Failed to load bill details.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [billId])

  const handleGenerateLinks = async (venmo, currentBillDetails) => {
    setIsLoading(true)
    setError('')
    try {
      localStorage.setItem('organizerVenmo', venmo)
      const response = await api.get(`/bills/${billId}/payment-links`, {
        params: { organizer_venmo: venmo, organizer_name: 'Me' }
      })
      setPaymentInfo(response.data)
      setLinksGenerated(true)

      // Add to history
      const history = JSON.parse(localStorage.getItem('billHistory') || '[]')
      if (!history.find(item => item.billId === billId)) {
        history.unshift({ 
          billId, 
          restaurant: currentBillDetails?.restaurant_name, 
          date: new Date().toISOString(),
          fullyPaid: response.data.outstanding_amount === 0
        })
        localStorage.setItem('billHistory', JSON.stringify(history.slice(0, 20))) // Keep last 20
      }

    } catch (err) {
      setError('Failed to generate payment links. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePaidStatus = async (person) => {
    const originalPaymentInfo = { ...paymentInfo };
    try {
      // Optimistically update UI
      const updatedLinks = paymentInfo.payment_links.map(link =>
        link.person === person ? { ...link, paid: !link.paid } : link
      )
      const updatedOutstanding = updatedLinks.reduce((acc, link) => {
        return !link.paid ? acc + link.amount : acc
      }, 0)
      setPaymentInfo(prevInfo => ({ ...prevInfo, payment_links: updatedLinks, outstanding_amount: updatedOutstanding }))

      // Make API call
      await api.post(`/bills/${billId}/toggle-paid`, { person })

      // Update history with paid status
      const history = JSON.parse(localStorage.getItem('billHistory') || '[]')
      const billIndex = history.findIndex(item => item.billId === billId)
      if (billIndex > -1) {
        history[billIndex].fullyPaid = updatedOutstanding === 0;
        localStorage.setItem('billHistory', JSON.stringify(history));
      }
    } catch (err) {
      setError(`Failed to update status for ${person}. Please refresh and try again.`)
      console.error(err)
      // Revert optimistic update on failure
      setPaymentInfo(originalPaymentInfo);
    }
  }

  const handleSendReminder = (person, amount, venmo_link) => {
    const restaurantName = billDetails?.restaurant_name || 'the bill';
    const message = `Hey ${person}, just a reminder for the bill from ${restaurantName}. You owe $${amount.toFixed(2)}. You can use this link to pay: ${venmo_link}`;
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `sms:?&body=${encodedMessage}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {!linksGenerated && !isLoading && <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Generate Payment Links</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={organizerVenmo}
            onChange={(e) => setOrganizerVenmo(e.target.value)}
            placeholder="Your Venmo Handle"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleGenerateLinks(organizerVenmo, billDetails)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Links
          </button>
        </div>
      </div>}

      {isLoading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {linksGenerated && (
        <div className="text-center mb-4">
            <button onClick={() => navigate('/')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
                Start a New Bill
            </button>
        </div>
      )}

      {paymentInfo.payment_links.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <div className="text-lg font-bold">${paymentInfo.my_total.toFixed(2)}</div>
              <div className="text-sm text-gray-500">My Total</div>
            </div>
            <h3 className="text-xl font-semibold">Payment Status</h3>
            <div className="text-right">
              <div className="text-lg font-bold">${paymentInfo.outstanding_amount.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Outstanding</div>
            </div>
          </div>
          <div className="space-y-4">
            {paymentInfo.payment_links.map(({ person, amount, venmo_link, qr_code, paid }) => (
              <div key={person} className={`p-4 rounded-lg border ${paid ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paid}
                      onChange={() => togglePaidStatus(person)}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <div className={`font-semibold ${paid ? 'line-through text-gray-500' : ''}`}>{person}</div>
                      <div className={`text-lg font-bold ${paid ? 'line-through text-gray-500' : 'text-gray-800'}`}>${amount.toFixed(2)}</div>
                    </div>
                  </div>
                  {!paid && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleSendReminder(person, amount, venmo_link)}
                        className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                        title="Send Reminder Text"
                      >
                        <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                      </button>
                      <a href={venmo_link} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Pay with Venmo</a>
                      <img src={qr_code} alt={`QR code for ${person}`} className="w-20 h-20" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentLinks