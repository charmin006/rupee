export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner w-12 h-12 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Rupee</h2>
        <p className="text-gray-600">Setting up your finance tracker...</p>
      </div>
    </div>
  )
} 