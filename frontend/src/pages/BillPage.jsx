import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ReviewReceipt from '../components/ReviewReceipt'
import ItemAssignment from '../components/ItemAssignment'

function BillPage() {
  const { billId } = useParams()
  const navigate = useNavigate()
  const [bill, setBill] = useState(null)
  const [step, setStep] = useState('review') // review, assign
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await api.get(`/bills/${billId}`)
        setBill(response.data)
      } catch (err) {
        setError('Failed to load bill data. Please try again.')
        console.error(err)
      }
    }
    fetchBill()
  }, [billId])

  const handleReviewComplete = (updatedBill) => {
    setBill(updatedBill)
    setStep('assign')
  }

  const handleAssignmentComplete = () => {
    navigate(`/bill/${billId}/payment-links`)
  }

  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!bill) return <div className="text-center">Loading bill...</div>

  return (
    <div>
      {step === 'review' && <ReviewReceipt bill={bill} onContinue={handleReviewComplete} />}
      {step === 'assign' && <ItemAssignment bill={bill} billId={billId} onComplete={handleAssignmentComplete} />}
    </div>
  )
}

export default BillPage