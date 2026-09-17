import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_TICKET } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { TICKET_STATUSES } from '../../data/constants.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input, Select } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import RentalStintRow from '../../components/domain/RentalStintRow.jsx'

const DRAFT_KEY = 'aly_rental_ticket_draft'

const BLANK_STINT = () => ({
  _key: Math.random(),
  startDate: '',
  endDate: '',
  dailyRate: 475,
  notes: '',
})

export default function RentalTicketScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [jobId, setJobId] = useState('')
  const [wellName, setWellName] = useState('')
  const [stints, setStints] = useState([BLANK_STINT()])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const isDirty = Boolean(jobId || wellName || stints.some(s => s.startDate))
  const autosaveTimerRef = useRef(null)

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setHasDraft(true)
        setSavedAt(parsed.savedAt ?? null)
      }
    } catch {}
  }, [])

  // Autosave with 500ms debounce
  useEffect(() => {
    if (!isDirty) return
    clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          jobId, wellName, stints,
          savedAt: new Date().toISOString(),
        }))
      } catch {}
    }, 500)
    return () => clearTimeout(autosaveTimerRef.current)
  }, [jobId, wellName, stints, isDirty])

  // Warn on browser close/reload when dirty
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setJobId(parsed.jobId ?? '')
      setWellName(parsed.wellName ?? '')
      setStints(parsed.stints ?? [BLANK_STINT()])
    } catch {}
    setHasDraft(false)
    localStorage.removeItem(DRAFT_KEY)
  }

  function dismissDraft() {
    setHasDraft(false)
    localStorage.removeItem(DRAFT_KEY)
  }

  function clearDraftAndReset() {
    localStorage.removeItem(DRAFT_KEY)
    setJobId('')
    setWellName('')
    setStints([BLANK_STINT()])
    setSubmitted(null)
    setHasDraft(false)
  }

  const job = state.jobs.find(j => j.id === jobId)

  function updateStint(idx, field, val) {
    setStints(s => s.map((st, i) => i === idx ? { ...st, [field]: val } : st))
  }
  function addStint() { setStints(s => [...s, BLANK_STINT()]) }
  function removeStint(idx) { setStints(s => s.filter((_, i) => i !== idx)) }

  function validate() {
    const e = {}
    if (!jobId) e.jobId = 'Select a job'
    if (!wellName.trim()) e.wellName = 'Well name is required'
    stints.forEach((s, i) => {
      if (!s.startDate) e[`stint_${i}_start`] = 'Required'
      if (!s.dailyRate || s.dailyRate <= 0) e[`stint_${i}_rate`] = 'Required'
    })
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const ticket = {
      id: genId('TKT-RT'),
      type: 'RENTAL',
      jobId,
      region: job.region,
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'current-user',
      submittedAt: new Date().toISOString(),
      wellName: wellName.trim(),
      stints: stints.map(({ _key, ...rest }) => ({ ...rest, id: genId('STINT') })),
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      daysOpen: 0,
      signatureId: null,
      invoiceId: null,
    }
    dispatch({ type: CREATE_TICKET, payload: ticket })
    localStorage.removeItem(DRAFT_KEY)
    setSubmitted(ticket)
  }

  if (submitted) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Rental Ticket</h1>
        </div>
        <Card style={{ maxWidth: 560 }}>
          <StatusBanner type="success">
            Ticket <strong>{submitted.id}</strong> submitted — pending Biller review.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="navy" onClick={() => navigate('/biller/tickets')}>→ Go to Biller Queue</Button>
            <Button variant="ghost" onClick={clearDraftAndReset}>+ New Ticket</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rental Ticket</h1>
        <p className="page-subtitle">Capture rental periods for a well</p>
      </div>

      {hasDraft && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <StatusBanner type="warning">
            You have an unsaved rental ticket{savedAt ? ` from ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}.{' '}
            <button
              onClick={restoreDraft}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#7a4f00', textDecoration: 'underline', padding: 0 }}
            >
              Restore draft
            </button>
            {' · '}
            <button
              onClick={dismissDraft}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a4f00', textDecoration: 'underline', padding: 0 }}
            >
              Dismiss
            </button>
          </StatusBanner>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card>
          <CardHeader title="Job & Well" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Job Number" required error={errors.jobId}>
              <Select value={jobId} onChange={e => {
                setJobId(e.target.value)
                const j = state.jobs.find(j => j.id === e.target.value)
                if (j) setWellName(j.wellName)
              }}>
                <option value="">Select job…</option>
                {state.jobs.map(j => {
                  const cust = state.customers.find(c => c.id === j.customerId)
                  return <option key={j.id} value={j.id}>{j.id} — {cust?.name} ({j.region})</option>
                })}
              </Select>
            </FormField>
            {job && <JobSummaryCard job={job} compact />}
            <FormField label="Well Name" required error={errors.wellName}>
              <Input value={wellName} onChange={e => setWellName(e.target.value)} placeholder="e.g. Well A-1" />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={`Rental Stints (${stints.length})`}
            action={stints.length < 5 && <Button variant="secondary" size="sm" type="button" onClick={addStint}>+ Add Stint</Button>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {stints.map((stint, idx) => (
              <div key={stint._key} style={{
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)', background: 'var(--bg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>Stint {idx + 1}</span>
                  {stints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStint(idx)}
                      aria-label={`Remove stint ${idx + 1}`}
                      style={{
                        width: 44, height: 44,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--status-flagged)',
                        background: 'rgba(198,40,40,0.08)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div className="grid-2">
                    <FormField label="Start Date" required error={errors[`stint_${idx}_start`]}>
                      <Input type="date" value={stint.startDate} onChange={e => updateStint(idx, 'startDate', e.target.value)} />
                    </FormField>
                    <FormField label="End Date" hint="Leave blank if still open">
                      <Input type="date" value={stint.endDate} onChange={e => updateStint(idx, 'endDate', e.target.value)} />
                    </FormField>
                  </div>
                  <FormField label="Daily Rate ($/day)" required error={errors[`stint_${idx}_rate`]}>
                    <Input type="number" min="0" step="0.01" value={stint.dailyRate}
                      onChange={e => updateStint(idx, 'dailyRate', parseFloat(e.target.value) || 0)} />
                  </FormField>
                  <FormField label="Notes">
                    <Input value={stint.notes} onChange={e => updateStint(idx, 'notes', e.target.value)} placeholder="Optional notes for this period" />
                  </FormField>
                  {stint.startDate && stint.endDate && (
                    <div style={{ paddingTop: 'var(--space-2)' }}>
                      <RentalStintRow stint={stint} index={idx} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <Button type="submit" variant="primary" size="lg">Submit Rental Ticket</Button>
        </div>
      </form>
    </div>
  )
}
