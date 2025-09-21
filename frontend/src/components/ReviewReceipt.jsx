import React, { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

function ReviewReceipt({ bill, onContinue }) {
  const [editableBill, setEditableBill] = useState(bill)
  const [selectedTip, setSelectedTip] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingSummary, setIsEditingSummary] = useState(false)

  // Recalculate subtotal from items when item list is being edited
  useEffect(() => {
    if (isEditing) {
      const newSubtotal = editableBill.items.reduce((acc, item) => acc + (item.price || 0), 0)
      setEditableBill(prev => ({ ...prev, subtotal: newSubtotal }))
    }
  }, [editableBill.items, isEditing])
  
  // Recalculate total whenever subtotal, tax, or tip change
  useEffect(() => {
    const newTotal = (editableBill.subtotal || 0) + (editableBill.tax || 0) + (editableBill.tip || 0)
    if (newTotal !== editableBill.total) {
      setEditableBill(prev => ({ ...prev, total: newTotal }))
    }
  }, [editableBill.subtotal, editableBill.tax, editableBill.tip])

  const handleTipChange = (newTip) => {
    const tipAmount = parseFloat(newTip)
    if (!isNaN(tipAmount) && tipAmount >= 0) {
      setEditableBill(prevBill => ({
        ...prevBill,
        tip: tipAmount,
        total: prevBill.subtotal + prevBill.tax + tipAmount
      }))
      setSelectedTip('custom')
    } else if (newTip === '') {
        setEditableBill(prevBill => ({ ...prevBill, tip: 0 }))
    }
  }

  const addPercentageTip = (percentage) => {
    const tipAmount = editableBill.subtotal * percentage
    handleTipChange(tipAmount.toFixed(2))
    setSelectedTip(percentage)
  }

  const tipButtonClass = (value) => 
    `px-4 py-2 rounded-full transition-colors ${
      selectedTip === value
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`

  const handleItemChange = (index, field, value) => {
    const newItems = [...editableBill.items]
    const parsedValue = field === 'price' ? parseFloat(value) || 0 : value
    newItems[index] = { ...newItems[index], [field]: parsedValue }
    setEditableBill(prev => ({ ...prev, items: newItems }))
  }

  const handleSummaryChange = (field, value) => {
    const parsedValue = parseFloat(value) || 0
    setEditableBill(prev => ({ ...prev, [field]: parsedValue }))
  }

  const handleAddItem = () => {
    const newItems = [...editableBill.items, { name: 'New Item', price: 0.0 }]
    setEditableBill(prev => ({ ...prev, items: newItems }))
  }

  const handleRemoveItem = (index) => {
    const newItems = editableBill.items.filter((_, i) => i !== index)
    setEditableBill(prev => ({ ...prev, items: newItems }))
  }
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">{editableBill.restaurant_name}</h2>

        {/* Item list section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Items</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <PencilIcon className="h-4 w-4" />
              {isEditing ? 'Done Editing' : 'Edit Items'}
            </button>
          </div>
          <div className="space-y-2 border-t pt-2">
            {editableBill.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                {isEditing ? (
                  <>
                    <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="flex-grow p-1 border rounded-md" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-24 pl-5 p-1 border rounded-md" />
                    </div>
                    <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <button onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                + Add Item
              </button>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Summary</h3>
            <button onClick={() => setIsEditingSummary(!isEditingSummary)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <PencilIcon className="h-4 w-4" />
              {isEditingSummary ? 'Done Editing' : 'Edit Summary'}
            </button>
          </div>
          <div className="space-y-2 text-lg">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              {isEditingSummary ? (
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" value={editableBill.subtotal} onChange={(e) => handleSummaryChange('subtotal', e.target.value)} className="w-28 text-right pl-5 p-1 border rounded-md" />
                </div>
              ) : (
                <span>${editableBill.subtotal.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span>Tax:</span>
              {isEditingSummary ? (
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" value={editableBill.tax} onChange={(e) => handleSummaryChange('tax', e.target.value)} className="w-28 text-right pl-5 p-1 border rounded-md" />
                </div>
              ) : (
                <span>${editableBill.tax.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between font-semibold">
              <span>Tip:</span>
              <span>${editableBill.tip.toFixed(2)}</span>
            </div>
          </div>
          <hr className="my-2"/>
          <div className="flex justify-between font-bold text-xl"><span>Total:</span> <span>${editableBill.total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Tip Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Adjust Tip</h3>
        <div className="flex flex-wrap gap-4 items-center">
          {bill.tip === 0 && (
            <>
              <button onClick={() => addPercentageTip(0.15)} className={tipButtonClass(0.15)}>15%</button>
              <button onClick={() => addPercentageTip(0.18)} className={tipButtonClass(0.18)}>18%</button>
              <button onClick={() => addPercentageTip(0.20)} className={tipButtonClass(0.20)}>20%</button>
            </>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="custom-tip" className="text-gray-600">{bill.tip > 0 ? "Adjust Amount:" : "Custom:"}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                    id="custom-tip"
                    type="number"
                    value={editableBill.tip > 0 ? editableBill.tip : ''}
                    placeholder="Amount"
                    onChange={(e) => handleTipChange(e.target.value)}
                    className={`w-32 pl-7 pr-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedTip === 'custom' ? 'border-blue-500' : 'border-gray-300'}`}
                />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onContinue(editableBill)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Continue to Assign Items
      </button>
    </div>
  )
}

export default ReviewReceipt