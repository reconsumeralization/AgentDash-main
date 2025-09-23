import { TestClientImport } from '@/components/test-client-import'

export default function TestImportPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AgentDash Test Import Page
          </h1>
          <p className="text-gray-600">
            Testing client-side imports and theme system integration
          </p>
        </div>
        
        <div className="flex justify-center">
          <TestClientImport />
        </div>
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Test System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">Client Import</h3>
                <p className="text-green-600 text-sm">✅ Working</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">Theme System</h3>
                <p className="text-blue-600 text-sm">✅ Active</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800">Component Rendering</h3>
                <p className="text-purple-600 text-sm">✅ Rendering</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800">Test Loop</h3>
                <p className="text-orange-600 text-sm">🔄 Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
