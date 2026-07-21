import { useState, useEffect } from 'react';

export default function OnboardingBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('governais_onboarding_dismissed');
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('governais_onboarding_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden animate-[fadeInUp_400ms_ease-out]">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
      
      <div className="bg-emerald-100 p-2 rounded-full shrink-0">
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </div>

      <div className="flex-1 pr-8">
        <h3 className="text-[14px] font-bold text-emerald-900 mb-1">Welcome to GovernAIs</h3>
        <p className="text-[13px] text-emerald-800/80 leading-relaxed">
          <strong>How this works:</strong> Request a tool → Compliance reviews it → Approved tools appear in the registry → Usage is monitored → Risky content gets flagged for review.
        </p>
      </div>

      <button
        onClick={dismiss}
        className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 rounded-md hover:bg-emerald-100 absolute top-3 right-3"
        aria-label="Dismiss banner"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
