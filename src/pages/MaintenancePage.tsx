import { Wrench, Clock, Mail } from 'lucide-react';

/**
 * Maintenance Page
 * 
 * Shown when VITE_MAINTENANCE_MODE=true in .env
 * Allows you to put the website down for maintenance
 */
export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-full p-6 shadow-lg">
            <Wrench className="w-16 h-16 text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          We'll Be Back Soon!
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8">
          PinoyPantry is currently undergoing maintenance
        </p>

        {/* Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Clock className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                What's happening?
              </h2>
              <p className="text-gray-600">
                We're making some improvements to serve you better. Our team is working hard to get everything back up and running smoothly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Need to reach us?
              </h2>
              <p className="text-gray-600">
                If you have any urgent questions or concerns, please contact us at{' '}
                <a 
                  href="mailto:support@pinoypantry.com" 
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  support@pinoypantry.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Estimated downtime:</span> We expect to be back online shortly. 
            Thank you for your patience!
          </p>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500">
          PinoyPantry - Authentic Filipino Products
        </p>
      </div>
    </div>
  );
}
