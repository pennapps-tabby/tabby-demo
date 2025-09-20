import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BillPreview from '../components/BillPreview'
import api from '../services/api'

function Review() {
  const { billId } = useParams()
  const navigate = useNavigate()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await api.get(`/bills/${billId}`)
        setBill(response.data)
      } catch (error) {
        console.error('Failed to fetch bill:', error)
        alert('Failed to load bill. Please try again.')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    if (billId) {
      fetchBill()
    }
  }, [billId, navigate])

  const handleNext = () => {
    navigate(`/assign/${billId}`)
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="text-gray-500">Loading bill data...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Receipt</h1>
      <BillPreview bill={bill} onNext={handleNext} />
    </div>
  )
}

export default Review
