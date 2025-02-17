import { useState } from "react"

const PaymentMethodDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  const paymentMethods = [
    {
      name: "Credit Card",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v2h16V6H4zm16 3H4v7h16v-7z" />
        </svg>
      ),
    },
    {
      name: "PayPal",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-5.611a1.8 1.8 0 0 1 1.788-1.539h.5c2.84 0 4.526-.783 5.108-3.548.303-1.558.159-2.8-.622-3.824zM9.768 1.5A4.5 4.5 0 0 1 14.254 6H9.768a4.5 4.5 0 0 1 0-4.5z" />
        </svg>
      ),
    },
    {
      name: "Bitcoin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.532-6h1.528v2.217h1.443V16h1.465v-1.42h1.49v-1.4h-1.49v-3.621h-1.117l-2.347 6.621H10.47zm2.903-4.552h1.032v1.4h-1.032v-1.4zm0-2.8h1.032v1.4h-1.032v-1.4z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 outline-none  rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-3">
          <span className="bg-green-900 p-2 rounded-full text-white">
            {selectedOption ? (
              selectedOption.icon
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v2h16V6H4zm16 3H4v7h16v-7z" />
              </svg>
            )}
          </span>

          <span className="text-gray-700">{selectedOption ? selectedOption.name : "Select Payment Method"}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              onClick={() => {
                setSelectedOption(method)
                setIsOpen(false)
              }}
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 cursor-pointer"
            >
              {method.icon}
              <span className="text-gray-700">{method.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentMethodDropdown
