import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function HistoryPage() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('billHistory') || '[]')
    setHistory(savedHistory)
  }, [])

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Bill History</h2>
        <p>You have no saved bills yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Bill History</h2>
      <ul className="space-y-3">
        {history.map(({ billId, restaurant, date }) => (
          <li key={billId} className="border p-4 rounded-lg hover:bg-gray-50">
            <Link to={`/bill/${billId}/payment-links`} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{restaurant || 'Unnamed Bill'}</p>
                <p className="text-sm text-gray-500">{new Date(date).toLocaleString()}</p>
              </div>
              <span className="text-blue-500">View &rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryPage