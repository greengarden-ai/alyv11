import { useNavigate } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
import { SET_ROLE } from '../context/actions.js'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_DEFAULT_ROUTES } from '../data/constants.js'

const ROLE_ICONS = {
  CS_REP: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  ),
  FIELD_WORKER: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  BILLER: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  APPROVER_STX: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  APPROVER_WTX: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  ALYA: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
}

const ROLE_ACCENT = {
  CS_REP:       'var(--navy-light)',
  FIELD_WORKER: 'var(--navy)',
  BILLER:       'var(--navy-mid)',
  APPROVER_STX: 'var(--status-approved)',
  APPROVER_WTX: 'var(--status-signed)',
  ALYA:         'var(--accent-dark)',
}

export default function LoginScreen() {
  const { dispatch } = useAppState()
  const navigate = useNavigate()

  function selectRole(role) {
    dispatch({ type: SET_ROLE, payload: role })
    navigate(ROLE_DEFAULT_ROUTES[role])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-5)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
        <div style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-2)',
        }}>
          Aly Energy Services
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-base)' }}>
          Select your role to continue
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)',
        width: '100%',
        maxWidth: 900,
      }}>
        {Object.values(ROLES).map(role => (
          <button
            key={role}
            onClick={() => selectRole(role)}
            style={{
              background: 'var(--card)',
              border: '2px solid transparent',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
              boxShadow: 'var(--shadow-md)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = ROLE_ACCENT[role]
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: ROLE_ACCENT[role],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-inverse)',
              marginBottom: 'var(--space-3)',
            }}>
              {ROLE_ICONS[role]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: 'var(--space-1)' }}>
              {ROLE_LABELS[role]}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {ROLE_DESCRIPTIONS[role]}
            </div>
          </button>
        ))}
      </div>

      <p style={{
        marginTop: 'var(--space-6)',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 'var(--text-xs)',
      }}>
        Prototype — session only, no data is saved
      </p>
    </div>
  )
}
