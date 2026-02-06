import Link from 'next/link';

export const metadata = {
  title: 'Sign In | Atlas',
  description: 'Sign in to your Atlas account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Atlas</h1>
            <p className="text-gray-600 mt-2">Your personal AI assistant</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Sign In Button with Tooltip */}
            <div className="relative">
              <button
                type="button"
                disabled
                className="w-full bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg cursor-not-allowed opacity-70"
              >
                Sign in with Magic Link
              </button>
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <span className="text-xs text-gray-600">
                  Coming soon — Supabase auth
                </span>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="relative mt-12 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">or</span>
            </div>
          </div>

          {/* Continue Without Login */}
          <Link
            href="/"
            className="block w-full text-center text-blue-600 hover:text-blue-700 font-semibold py-3 px-4 transition-colors duration-200"
          >
            Continue without login
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Atlas is currently in beta. Features are being actively developed.
        </p>
      </div>
    </div>
  );
}
