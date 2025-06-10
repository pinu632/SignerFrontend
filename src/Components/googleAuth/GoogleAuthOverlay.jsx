import React, { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';

const GoogleSignInOverlay = ({onClose}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Simulate Google sign-in process
    window.location.href = 'https://signerbackendrepo.onrender.com/api/auth/google';
    setTimeout(() => {
      setIsLoading(false);
      setIsVisible(false);
      alert('Signed in successfully!');
    }, 2000);
  };

  

  const handleEmailSignIn = () => {
    alert('Email sign-in clicked');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sign in to DocSign</h2>
            <p className="text-sm text-gray-600 mt-1">Continue to your account</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X

            onClick={()=>{
                onClose(false)
            }}
            
            className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Sign-In Button */}
          <button
            onClick={handleEmailSignIn}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span className="font-medium">Continue with Email</span>
          </button>

          {/* Security Note */}
          <div className="flex items-start space-x-2 text-xs text-gray-500">
            <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Your information is protected by industry-standard encryption and will never be shared with third parties.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-rose-600 hover:text-rose-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-rose-600 hover:text-rose-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Show Sign-In
        </button>
      </div>
    </div>
  );
};

export default GoogleSignInOverlay;