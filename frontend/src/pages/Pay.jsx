import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PaymentSummary from '../components/PaymentSummary'
import api from '../services/api'

function Pay() {
  const { billId } = useParams()
  const [bill, setBill] = useState(null)
  const [splits, setSplits] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await api.get(`/bills/${billId}`)
        setBill(response.data)
        setSplits(response.data.splits || {})
      } catch (error) {
        console.error('Failed to fetch bill:', error)
        alert('Failed to load bill. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (billId) {
      fetchBill()
    }
  }, [billId])

  if (loading) {
    return (
      <div className="text-center">
        <div className="text-gray-500">Loading payment data...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h1>
      <PaymentSummary billId={billId} splits={splits} />
    </div>
  )
}

export default Pay
