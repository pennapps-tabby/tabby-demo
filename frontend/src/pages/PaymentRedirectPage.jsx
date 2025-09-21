import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import qrcode from 'qrcode'

function PaymentRedirectPage() {
  const [searchParams] = useSearchParams()
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const recipient = searchParams.get('recipient')
  const amount = searchParams.get('amount')
  const note = searchParams.get('note')

  const venmoWebLink = `https://venmo.com/${recipient}?txn=pay&amount=${amount}&note=${note}`

  useEffect(() => {
    if (venmoWebLink) {
      qrcode.toDataURL(venmoWebLink, { width: 200 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err))
    }
  }, [venmoWebLink])

  if (!recipient || !amount) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600">Invalid Payment Link</h1>
        <p className="text-gray-600 mt-2">The payment information is missing or incorrect.</p>
      </div>
    )
  }

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-gray-800">Payment to {recipient}</h1>
      <p className="text-4xl font-light text-gray-900 my-4">${parseFloat(amount).toFixed(2)}</p>
      {note && <p className="text-gray-500 mb-6">For: "{note.replace(/\+/g, ' ')}"</p>}

      <a
        href={venmoWebLink}
        className="w-full inline-block px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Pay with Venmo
      </a>

      {qrCodeUrl && (
        <div className="mt-6">
          <p className="text-sm text-gray-500">Or scan this code</p>
          <img src={qrCodeUrl} alt="Venmo QR Code" className="mx-auto mt-2" />
        </div>
      )}
    </div>
  )
}

export default PaymentRedirectPage