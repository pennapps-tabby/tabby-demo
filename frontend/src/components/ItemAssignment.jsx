import React, { useState, useEffect } from 'react'
import api from '../services/api'

function ItemAssignment({ bill, billId, onComplete }) {
  const [people, setPeople] = useState([''])
  const [assignments, setAssignments] = useState({})
  const [splits, setSplits] = useState({})

  useEffect(() => {
    // Initialize assignments for each item
    const initialAssignments = {}
    bill.items.forEach((_, index) => {
      initialAssignments[index] = []
    })
    setAssignments(initialAssignments)
  }, [bill])

  const addPerson = () => {
    setPeople([...people, ''])
  }

  const updatePerson = (index, value) => {
    const newPeople = [...people]
    newPeople[index] = value
    setPeople(newPeople)
  }

  const removePerson = (index) => {
    if (people.length > 1) {
      const newPeople = people.filter((_, i) => i !== index)
      setPeople(newPeople)
      
      // Remove this person from all assignments
      const newAssignments = { ...assignments }
      Object.keys(newAssignments).forEach(itemIndex => {
        newAssignments[itemIndex] = newAssignments[itemIndex].filter(i => i !== index)
      })
      setAssignments(newAssignments)
    }
  }

  const toggleAssignment = (itemIndex, personIndex) => {
    const newAssignments = { ...assignments }
    const currentAssignments = newAssignments[itemIndex] || []
    
    if (currentAssignments.includes(personIndex)) {
      newAssignments[itemIndex] = currentAssignments.filter(i => i !== personIndex)
    } else {
      newAssignments[itemIndex] = [...currentAssignments, personIndex]
    }
    
    setAssignments(newAssignments)
  }

  const calculateSplits = async () => {
    console.log(bill)
    const validPeople = people.filter(p => p.trim() !== '')
    if (validPeople.length === 0) {
      alert('Please add at least one person')
      return
    }

    const assignmentData = Object.keys(assignments).map(itemIndex => ({
      item_id: parseInt(itemIndex),
      assigned_to: assignments[itemIndex].map(i => validPeople[i])
    }))

    try {
      const response = await api.post(`/bills/${billId}/assign`, {
        assignments: assignmentData,
        people: validPeople
      })
      
      setSplits(response.data.splits)
    } catch (error) {
      console.error('Failed to calculate splits:', error)
      alert('Failed to calculate splits. Please try again.')
    }
  }

  const handleComplete = () => {
    if (Object.keys(splits).length === 0) {
      alert('Please calculate splits first')
      return
    }
    onComplete(splits)
  }

  return (
    <div className="space-y-6">
      {/* People Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add People</h3>
        {people.map((person, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={person}
              onChange={(e) => updatePerson(index, e.target.value)}
              placeholder="Person name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {people.length > 1 && (
              <button
                onClick={() => removePerson(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPerson}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Person
        </button>
      </div>

      {/* Item Assignment Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Assign Items</h3>
        <div className="space-y-3">
          {bill.items.map((item, itemIndex) => (
            <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {people.map((person, personIndex) => (
                  person.trim() && (
                    <button
                      key={personIndex}
                      onClick={() => toggleAssignment(itemIndex, personIndex)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        assignments[itemIndex]?.includes(personIndex)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {person}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculate and Complete */}
      <div className="flex gap-4">
        <button
          onClick={calculateSplits}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Calculate Splits
        </button>
        <button
          onClick={handleComplete}
          disabled={Object.keys(splits).length === 0}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Generate Payment Links
        </button>
      </div>

      {/* Show calculated splits */}
      {Object.keys(splits).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Calculated Splits</h3>
          <div className="space-y-2">
            {Object.entries(splits).map(([person, amount]) => (
              <div key={person} className="flex justify-between">
                <span>{person}</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemAssignment
