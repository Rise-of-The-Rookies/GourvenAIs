import { useLocation } from 'react-router-dom';
import { useAppData, mockUsers } from '../context/AppDataContext';

const PAGE_NAMES = {
  '/': 'Dashboard',
  '/registry': 'AI Registry',
  '/approvals': 'Approvals',
  '/usage': 'Usage',
  '/flags': 'Flags',
};

const ROLE_LABELS = {
  employee: 'Employee',
  compliance_admin: 'Compliance Admin',
};

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAppData();
  const location = useLocation();
  const pageName = PAGE_NAMES[location.pathname] || 'Page';

  return (
    <header className="fixed top-0 left-60 right-0 z-20 h-14 flex items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="text-slate-400">GovernAIs</li>
          <li aria-hidden="true" className="text-slate-300">/</li>
          <li className="font-medium text-slate-700">{pageName}</li>
        </ol>
      </nav>

      {/* User switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full bg-midnight flex items-center justify-center text-white text-[11px] font-bold"
            aria-hidden="true"
          >
            {currentUser.name.charAt(0)}
          </div>

          <div className="hidden sm:flex flex-col">
            <select
              id="user-switcher"
              value={currentUser.id}
              onChange={(e) => {
                const user = mockUsers.find((u) => u.id === e.target.value);
                if (user) setCurrentUser(user);
              }}
              className="text-[13px] font-medium text-slate-700 bg-transparent border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded pr-5 -mr-1"
              aria-label="Switch user"
            >
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
              {ROLE_LABELS[currentUser.role] || currentUser.role}
              {' · '}
              {currentUser.department}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
