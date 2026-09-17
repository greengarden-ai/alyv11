import { NavLink } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { ROLES } from '../../data/constants.js'

const ICONS = {
  intake: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  fieldticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  rental: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  assembly: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>
  ),
  approvals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1"/>
      <rect x="10" y="7" width="4" height="14" rx="1"/>
      <rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  ),
  exceptions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  ),
  cfo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  ),
  fleet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v4h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  pricebooks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  refresh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  ),
}

const NAV_CONFIG = {
  [ROLES.CS_REP]: [
    { label: 'Order Intake', path: '/cs/intake', icon: 'intake' },
  ],
  [ROLES.FIELD_WORKER]: [
    { label: 'Field Ticket',  path: '/fieldworker/field-ticket', icon: 'fieldticket' },
    { label: 'Rental Ticket', path: '/fieldworker/rental',       icon: 'rental' },
  ],
  [ROLES.BILLER]: [
    { label: 'Ticket Assembly', path: '/biller/tickets', icon: 'assembly' },
  ],
  [ROLES.APPROVER_STX]: [
    { label: 'Approval Queue', path: '/approver/routing', icon: 'approvals' },
  ],
  [ROLES.APPROVER_WTX]: [
    { label: 'Approval Queue', path: '/approver/routing', icon: 'approvals' },
  ],
  [ROLES.ALYA]: [
    { label: 'Dashboard',             path: '/alya/dashboard',    icon: 'dashboard' },
    { label: 'Exception Queue',       path: '/alya/exceptions',   icon: 'exceptions' },
    { label: 'CFO Approval',          path: '/alya/cfo-approval', icon: 'cfo' },
    { label: 'Fleet & Equipment',     path: '/alya/fleet',        icon: 'fleet' },
    { label: 'Price Books Reference', path: '/alya/price-books',  icon: 'pricebooks' },
    { label: 'Super Admin',           path: '/alya/admin',        icon: 'admin' },
    { divider: true },
    { label: 'Order Intake',    path: '/cs/intake',                icon: 'intake' },
    { label: 'Field Ticket',    path: '/fieldworker/field-ticket', icon: 'fieldticket' },
    { label: 'Rental Ticket',   path: '/fieldworker/rental',       icon: 'rental' },
    { label: 'Ticket Assembly', path: '/biller/tickets',           icon: 'assembly' },
    { label: 'Approval Queue',  path: '/approver/routing',         icon: 'refresh' },
    { divider: true },
    { label: 'Help & Guide', path: '/alya/help', icon: 'help' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { state } = useAppState()
  const role = state.currentRole
  const links = NAV_CONFIG[role] ?? []

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 'calc(var(--z-sidebar) - 1)',
          }}
        />
      )}

      <nav
        style={{
          position: 'fixed',
          top: 'var(--topbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          background: 'var(--navy-mid)',
          overflowY: 'auto',
          zIndex: 'var(--z-sidebar)',
          padding: 'var(--space-4) 0',
          transform: open ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-base)',
        }}
        className={open ? '' : 'hide-mobile'}
      >
        <ul style={{ listStyle: 'none' }}>
          {links.map((item, i) => {
            if (item.divider) {
              return (
                <li key={`div-${i}`} style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.1)',
                  margin: 'var(--space-2) var(--space-4)',
                }} />
              )
            }
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '10px var(--space-5)',
                    color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.8)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(245,166,35,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {ICONS[item.icon]}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
