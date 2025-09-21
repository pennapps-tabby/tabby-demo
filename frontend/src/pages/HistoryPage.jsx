import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrashIcon } from '@heroicons/react/24/outline'

function HistoryPage() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('billHistory') || '[]')
    setHistory(savedHistory)
  }, [])

  const handleRemove = (billIdToRemove) => {
    const newHistory = history.filter(item => item.billId !== billIdToRemove)
    setHistory(newHistory)
    localStorage.setItem('billHistory', JSON.stringify(newHistory))
  }

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
          <li key={billId} className={`border p-4 rounded-lg flex justify-between items-center transition-colors ${history.find(h => h.billId === billId)?.fullyPaid ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}`}>
            <Link to={`/bill/${billId}/payment-links`} className="flex-grow">
                <div>
                    <p className={`font-semibold ${history.find(h => h.billId === billId)?.fullyPaid ? 'text-gray-500' : ''}`}>{restaurant || 'Unnamed Bill'}</p>
                    <p className="text-sm">{new Date(date).toLocaleString()}</p>
                </div>
            </Link>
            <button
              onClick={() => handleRemove(billId)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full flex-shrink-0"
              title="Remove from history"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryPage