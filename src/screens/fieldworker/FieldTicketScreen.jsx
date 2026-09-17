import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_TICKET } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { TICKET_STATUSES, OWNERSHIP_TYPES, CONTAINMENT_TYPES, EQUIPMENT_STATUSES } from '../../data/constants.js'
import { getPriceBookDetails } from '../../data/priceBooks.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input, Select } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import TruckingTicketTab from './TruckingTicketTab.jsx'

const DRAFT_KEY = 'aly_field_ticket_draft'

const BLANK_ITEM = () => ({
  _key: Math.random(),
  equipmentId: '',
  description: '',
  ownership: 'DMP',
  serialNumber: '',
  quantity: 1,
  containmentType: 'Steel',
  containmentSize: '',
  hasTruckingForm: false,
})

const BLANK_FORM = { crewSource: '', managerApproval: '', rigUpDate: '', rigDownDate: '' }

const TabBar = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 1, label: 'Rig-up / Rig-down', disabled: false },
    { id: 2, label: 'Trucking Ticket', disabled: false },
    { id: 3, label: 'Service', disabled: true },
    { id: 4, label: 'Mud Transfer', disabled: true },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-2)',
      borderBottom: '1px solid var(--border)',
      marginBottom: 'var(--space-4)',
      overflow: 'auto',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          title={tab.disabled ? 'Coming in V1' : undefined}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            cursor: tab.disabled ? 'not-allowed' : 'pointer',
            fontWeight: activeTab === tab.id ? 600 : 500,
            fontSize: 'var(--text-sm)',
            color: activeTab === tab.id ? 'var(--navy)' : tab.disabled ? 'var(--text-muted)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.id ? '3px solid var(--navy)' : 'none',
            opacity: tab.disabled ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default function FieldTicketScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [jobId, setJobId] = useState('')
  const [activeTab, setActiveTab] = useState(1)
  const [form, setForm] = useState(BLANK_FORM)
  const [items, setItems] = useState([BLANK_ITEM()])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const isDirty = Boolean(jobId || form.crewSource || form.rigUpDate || form.rigDownDate || form.managerApproval)
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
          jobId, form, items, activeTab,
          savedAt: new Date().toISOString(),
        }))
      } catch {}
    }, 500)
    return () => clearTimeout(autosaveTimerRef.current)
  }, [jobId, form, items, activeTab, isDirty])

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
      setForm(parsed.form ?? BLANK_FORM)
      setItems(parsed.items ?? [BLANK_ITEM()])
      setActiveTab(parsed.activeTab ?? 1)
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
    setForm(BLANK_FORM)
    setItems([BLANK_ITEM()])
    setActiveTab(1)
    setSubmitted(null)
    setHasDraft(false)
  }

  const job = state.jobs.find(j => j.id === jobId)
  const yardEquipment = state.equipment.filter(e => e.status === EQUIPMENT_STATUSES.IN_YARD)

  const activePriceBook = job ? state.activePriceBooks?.[job.id] : null
  const priceBookDisplay = activePriceBook ? getPriceBookDetails(job?.customerId, activePriceBook) : null

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  function updateItem(idx, field, val) {
    setItems(items => items.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      if (field === 'equipmentId' && val) {
        const eq = state.equipment.find(e => e.id === val)
        if (eq) {
          updated.description = eq.name
          updated.serialNumber = eq.serialNumber
        }
      }
      return updated
    }))
  }

  function addItem() { setItems(items => [...items, BLANK_ITEM()]) }
  function removeItem(idx) { setItems(items => items.filter((_, i) => i !== idx)) }

  function validate() {
    const e = {}
    if (!jobId) e.jobId = 'Select a job'
    if (!form.crewSource.trim()) e.crewSource = 'Required'
    if (!form.rigUpDate) e.rigUpDate = 'Required'
    if (!form.rigDownDate) e.rigDownDate = 'Required'
    else if (form.rigUpDate && form.rigDownDate < form.rigUpDate) e.rigDownDate = 'Rig-down must be after rig-up'
    if (!form.managerApproval.trim()) e.managerApproval = 'Required'
    if (!items.length) e.items = 'Add at least one equipment item'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const ticket = {
      id: genId('TKT-RM'),
      type: 'RIG_MOVE',
      jobId,
      region: job.region,
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'current-user',
      submittedAt: new Date().toISOString(),
      rigUpDate: form.rigUpDate,
      rigDownDate: form.rigDownDate,
      crewSource: form.crewSource.trim(),
      managerApproval: form.managerApproval.trim(),
      equipmentItems: items.map(({ _key, ...rest }) => rest),
      hasTruckingFormForAll: items.every(i => i.hasTruckingForm),
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      selfMove: false,
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
          <h1 className="page-title">Field Ticket</h1>
        </div>
        <Card style={{ maxWidth: 560 }}>
          <StatusBanner type="success">
            Ticket <strong>{submitted.id}</strong> submitted — pending Biller review.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="navy" onClick={() => navigate('/biller/tickets')}>
              → Go to Biller Queue
            </Button>
            <Button variant="ghost" onClick={clearDraftAndReset}>
              + New Ticket
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Field Ticket</h1>
        <p className="page-subtitle">Capture rig-up / rig-down, trucking, and service events</p>
      </div>

      {hasDraft && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <StatusBanner type="warning">
            You have an unsaved rig move ticket{savedAt ? ` from ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}.{' '}
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
        {/* Job Selection */}
        <Card>
          <CardHeader title="Job Lookup" />
          <FormField label="Job Number" required error={errors.jobId}>
            <Select value={jobId} onChange={e => setJobId(e.target.value)}>
              <option value="">Select job…</option>
              {state.jobs.map(j => {
                const cust = state.customers.find(c => c.id === j.customerId)
                return <option key={j.id} value={j.id}>{j.id} — {cust?.name} ({j.region})</option>
              })}
            </Select>
          </FormField>
          {job && <div style={{ marginTop: 'var(--space-3)' }}><JobSummaryCard job={job} compact /></div>}

          {priceBookDisplay && (
            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Active Price Book (v1.1)</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--navy)' }}>
                {priceBookDisplay.name} {priceBookDisplay.rig && `- ${priceBookDisplay.rig}`}
              </div>
            </div>
          )}
        </Card>

        {/* Tab Navigation */}
        <Card>
          <TabBar activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Visit Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>Visit Details</div>
                <div className="grid-2">
                  <FormField label="Rig-Up Date" required error={errors.rigUpDate}>
                    <Input type="date" value={form.rigUpDate} onChange={e => setF('rigUpDate', e.target.value)} />
                  </FormField>
                  <FormField label="Rig-Down Date" required error={errors.rigDownDate}>
                    <Input type="date" value={form.rigDownDate} onChange={e => setF('rigDownDate', e.target.value)} />
                  </FormField>
                </div>
                <div className="grid-2">
                  <FormField label="Crew Source" required error={errors.crewSource}>
                    <Input value={form.crewSource} onChange={e => setF('crewSource', e.target.value)} placeholder="e.g. Aly Energy — STX Crew 1" />
                  </FormField>
                  <FormField label="Manager Approval (Name)" required error={errors.managerApproval}>
                    <Input value={form.managerApproval} onChange={e => setF('managerApproval', e.target.value)} placeholder="e.g. Kyle Odom" />
                  </FormField>
                </div>
              </div>

              {/* Equipment Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>
                    Equipment Items ({items.length})
                  </span>
                  <Button variant="secondary" size="sm" type="button" onClick={addItem}>+ Add Item</Button>
                </div>
                {errors.items && <StatusBanner type="error">{errors.items}</StatusBanner>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {items.map((item, idx) => (
                    <div key={item._key} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      background: 'var(--bg)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>Item {idx + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            aria-label={`Remove item ${idx + 1}`}
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
                        <FormField label="Select from Fleet (optional)">
                          <Select value={item.equipmentId} onChange={e => updateItem(idx, 'equipmentId', e.target.value)}>
                            <option value="">Manual entry…</option>
                            {yardEquipment.map(eq => (
                              <option key={eq.id} value={eq.id}>{eq.id} — {eq.name}</option>
                            ))}
                          </Select>
                        </FormField>
                        <div className="grid-2">
                          <FormField label="Description / Name">
                            <Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="e.g. BOP Stack" />
                          </FormField>
                          <FormField label="Serial Number">
                            <Input value={item.serialNumber} onChange={e => updateItem(idx, 'serialNumber', e.target.value)} placeholder="SN-XXX-0000" />
                          </FormField>
                        </div>
                        <div className="grid-2">
                          <FormField label="Ownership">
                            <Select value={item.ownership} onChange={e => updateItem(idx, 'ownership', e.target.value)}>
                              {Object.values(OWNERSHIP_TYPES).map(o => <option key={o} value={o}>{o}</option>)}
                            </Select>
                          </FormField>
                          <FormField label="Qty">
                            <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} />
                          </FormField>
                        </div>
                        <div className="grid-2">
                          <FormField label="Containment Type">
                            <Select value={item.containmentType} onChange={e => updateItem(idx, 'containmentType', e.target.value)}>
                              {CONTAINMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                          </FormField>
                          <FormField label="Containment Size">
                            <Input value={item.containmentSize} onChange={e => updateItem(idx, 'containmentSize', e.target.value)} placeholder="e.g. 20 BBL" />
                          </FormField>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)', minHeight: 44 }}>
                          <input
                            type="checkbox"
                            checked={item.hasTruckingForm}
                            onChange={e => updateItem(idx, 'hasTruckingForm', e.target.checked)}
                            style={{ width: 20, height: 20, accentColor: 'var(--navy)', cursor: 'pointer', flexShrink: 0 }}
                          />
                          Trucking form received for this item
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && jobId && (
            <TruckingTicketTab jobId={jobId} job={job} />
          )}

          {activeTab === 2 && !jobId && (
            <StatusBanner type="warning">
              Please select a job first to create a trucking ticket.
            </StatusBanner>
          )}
        </Card>

        {/* Submit always visible — submits the rig move ticket */}
        <div>
          <Button type="submit" variant="primary" size="lg">Submit Rig-up / Rig-down Ticket</Button>
        </div>
      </form>
    </div>
  )
}
