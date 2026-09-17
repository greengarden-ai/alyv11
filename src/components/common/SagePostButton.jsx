import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { POST_INVOICE } from '../../context/actions.js'
import { genId, formatDateTime } from '../../utils.js'
import Button from './Button.jsx'

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

export default function SagePostButton({ invoice, disabled, disabledReason }) {
  const { dispatch } = useAppState()
  const [loading, setLoading] = useState(false)

  if (invoice?.status === 'POSTED') {
    return (
      <div style={{
        background: 'var(--status-approved-bg)',
        border: '1px solid var(--status-approved-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', color: 'var(--status-approved-text)' }}>
          <CheckCircleIcon />
          <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
            Posted to Sage Intacct
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--status-approved)' }}>
          <div>Invoice ID: <strong>{invoice.intacctPostId}</strong></div>
          <div>Posted: {formatDateTime(invoice.intacctPostedAt)}</div>
        </div>
      </div>
    )
  }

  function handlePost() {
    setLoading(true)
    setTimeout(() => {
      const intacctPostId = `SI-${genId('INV')}`
      dispatch({
        type: POST_INVOICE,
        payload: {
          invoiceId: invoice.id,
          intacctPostId,
          postedAt: new Date().toISOString(),
        },
      })
      setLoading(false)
    }, 1200)
  }

  return (
    <div>
      <Button
        variant="navy"
        disabled={disabled || loading || !invoice}
        onClick={handlePost}
        title={disabledReason}
        size="lg"
      >
        <SendIcon />
        {loading ? 'Posting…' : 'Post to Sage Intacct'}
      </Button>
      {disabledReason && (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {disabledReason}
        </div>
      )}
    </div>
  )
}
