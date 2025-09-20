import React from 'react'

function BillPreview({ bill, onNext }) {
  if (!bill) {
    return <div className="text-center text-gray-500">Loading bill data...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {bill.restaurant_name || 'Restaurant'}
      </h2>
      
      <div className="space-y-3 mb-6">
        {bill.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">{item.name}</span>
            <span className="font-medium">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-2 text-right">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${bill.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${bill.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>${bill.total.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="w-full mt-6 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
      >
        Assign Items to People
      </button>
    </div>
  )
}

export default BillPreview
