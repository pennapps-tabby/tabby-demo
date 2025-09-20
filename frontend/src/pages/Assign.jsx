import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ItemAssignment from '../components/ItemAssignment'
import api from '../services/api'

function Assign() {
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

  const handleComplete = (splits) => {
    navigate(`/pay/${billId}`)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assign Items</h1>
      <ItemAssignment bill={bill} onComplete={handleComplete} />
    </div>
  )
}

export default Assign
