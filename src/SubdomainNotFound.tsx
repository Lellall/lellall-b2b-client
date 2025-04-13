import { StyledButton } from '@/components/button/button-lellall';
import { ArrowLeft } from 'iconsax-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, setSubdomain } from '@/redux/api/auth/auth.slice';
import App from './App';

// SubdomainNotFound Component
const SubdomainNotFound = () => {
  const { subdomain } = useSelector(selectAuth);
  const dispatch = useDispatch();

  // Function to extract subdomain from URL as fallback
  const extractSubdomain = () => {
    const host = window.location.href;
    const extractedSubdomain = host.split('.')[0].split('//')[1];
    if (extractedSubdomain) {
      dispatch(setSubdomain(extractedSubdomain));
    }
    return extractedSubdomain;
  };

  const displaySubdomain = subdomain || extractSubdomain() || 'unknown';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Decorative Element */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#05431E] opacity-10 rounded-full w-32 h-32 mx-auto blur-xl"></div>
          <div className="bg-white p-6 rounded-full inline-block relative z-10 shadow-md">
            <svg
              className="w-16 h-16 text-[#05431E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Subdomain Not Found</h1>
          <p className="text-gray-600">
            Oops! We couldn't find a restaurant associated with the subdomain{' '}
            <span className="font-medium text-[#05431E]">{displaySubdomain}</span>.
          </p>
          <p className="text-sm text-gray-500">
            This could be due to a typo in the URL or the restaurant might not be registered yet.
            Please check the URL or return to the main page.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <StyledButton
            onClick={() => window.location.href = '/'}
            background="#05431E"
            color="#fff"
            width="200px"
            style={{ padding: '12px 24px' }}
            variant="solid"
            className="inline-flex items-center justify-center"
          >
            <ArrowLeft size="20" className="mr-2" />
            Back to Home
          </StyledButton>
          <p className="text-xs text-gray-400">
            Need help? Contact support at{' '}
            <a href="mailto:support@example.com" className="text-[#05431E] hover:underline">
              support@lellall.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Example usage in a parent component
const SubdomainChecker = () => {
  const { subdomain } = useSelector(selectAuth);
  const dispatch = useDispatch();

  // Check subdomain from URL if not in Redux
  const host = window.location.href;
  const extractedSubdomain = host.split('.')[0].split('//')[1];
  
  // Here you would typically check if the subdomain exists in your system
  // For this example, we'll assume 'restaurant' check failed
  const restaurant = null; // This would come from your API/data check

  if (restaurant) {
    dispatch(setSubdomain(extractedSubdomain));
    return <App />; // Or your main app component
  }

  return <SubdomainNotFound />;
};

export default SubdomainNotFound;