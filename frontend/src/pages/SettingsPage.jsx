import React, { useState, useEffect } from 'react'

function SettingsPage() {
  const [venmoHandle, setVenmoHandle] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedVenmo = localStorage.getItem('organizerVenmo')
    if (savedVenmo) {
      setVenmoHandle(savedVenmo)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('organizerVenmo', venmoHandle)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000) // Hide message after 2s
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="space-y-2">
        <label htmlFor="venmo" className="block font-medium text-gray-700">Your Venmo Handle</label>
        <input
          id="venmo"
          type="text"
          value={venmoHandle}
          onChange={(e) => setVenmoHandle(e.target.value)}
          placeholder="e.g., your-name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
      {saved && <span className="ml-4 text-green-600">Saved!</span>}
    </div>
  )
}

export default SettingsPage