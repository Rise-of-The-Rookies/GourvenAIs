import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex page-enter">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-midnight flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-signal/90">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">GovernAIs</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            AI governance,{' '}
            <span className="text-emerald-400">simplified.</span>
          </h1>
          <p className="mt-4 text-slate-400 text-[15px] leading-relaxed">
            Register, approve, monitor, and flag AI tools across your
            organisation — from a single control plane.
          </p>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center gap-6">
            {[
              { value: '100%', label: 'Audit trail' },
              { value: 'SOC 2', label: 'Compliant' },
              { value: '< 1 min', label: 'Avg. approval' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold text-white tabular-nums">{stat.value}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-600">
          © 2026 GovernAIs. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-signal/90">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-midnight tracking-tight">GovernAIs</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your credentials to access the governance dashboard.
          </p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@company.com…"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-150 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-8">
            Demo mode — use the role switcher in the top bar
          </p>
        </div>
      </div>
    </div>
  );
}
