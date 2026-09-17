import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { ADD_APPROVAL } from '../../context/actions.js'
import { TICKET_STATUSES } from '../../data/constants.js'
import { getJob, getCustomer, formatCurrency, computeStintTotal, formatDate } from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import Badge from '../../components/common/Badge.jsx'
import TicketCard from '../../components/domain/TicketCard.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import ApprovalChainViz from '../../components/domain/ApprovalChainViz.jsx'
import RentalStintRow from '../../components/domain/RentalStintRow.jsx'

export default function CFOApprovalScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)
  const [notes, setNotes] = useState({})
  const [prices, setPrices] = useState({})

  const pending = state.tickets.filter(t => t.status === TICKET_STATUSES.PENDING_CFO)
  const awaitingSig = state.tickets.filter(t =>
    t.status === TICKET_STATUSES.PENDING_SIGNATURE || t.status === TICKET_STATUSES.CFO_APPROVED
  )

  function approveCFO(ticket) {
    dispatch({
      type: ADD_APPROVAL,
      payload: {
        ticketId: ticket.id,
        newStatus: TICKET_STATUSES.PENDING_SIGNATURE,
        entry: {
          step: 'CFO',
          approvedBy: 'alya',
          approvedAt: new Date().toISOString(),
          notes: notes[ticket.id] ?? '',
          ...(ticket.type === 'RIG_MOVE' ? { cfoPrice: parseFloat(prices[ticket.id] ?? 0) || 0 } : {}),
        },
      },
    })
    if (expanded === ticket.id) setExpanded(null)
  }

  function renderDetail(ticket) {
    const job = getJob(state.jobs, ticket.jobId)
    return (
      <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        {job && <JobSummaryCard job={job} compact />}
        <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--navy)' }}>Approval Chain</div>
          <ApprovalChainViz region={ticket.region} ticket={ticket} />
        </div>

        {ticket.type === 'RIG_MOVE' && (
          <div style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Rig-up: {formatDate(ticket.rigUpDate)} → Rig-down: {formatDate(ticket.rigDownDate)}
            {' · '}{ticket.equipmentItems?.length ?? 0} item(s)
          </div>
        )}
        {ticket.type === 'RENTAL' && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Well: {ticket.wellName}</div>
            {ticket.stints?.map((s, i) => <RentalStintRow key={s.id ?? i} stint={s} index={i} />)}
            <div style={{ marginTop: 'var(--space-2)', fontWeight: 700, textAlign: 'right', fontSize: 'var(--text-sm)' }}>
              Total: {formatCurrency(computeStintTotal(ticket.stints ?? []))}
            </div>
          </div>
        )}

        {ticket.approvalChain?.length > 0 && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>PRIOR APPROVALS</div>
            {ticket.approvalChain.map((entry, i) => (
              <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {entry.step}: {entry.approvedAt?.slice(0, 10)} {entry.notes && `· "${entry.notes}"`}
              </div>
            ))}
          </div>
        )}

        {ticket.type === 'RIG_MOVE' && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Total Billable Amount ($) <span style={{ color: 'var(--status-flagged)' }}>*</span>
            </label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              style={{ maxWidth: 200 }}
              placeholder="0.00"
              value={prices[ticket.id] ?? ''}
              onChange={e => setPrices(p => ({ ...p, [ticket.id]: e.target.value }))}
            />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
              Sets the invoice total for this rig move ticket.
            </div>
          </div>
        )}

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            CFO Notes (optional)
          </label>
          <textarea className="form-input" rows={2} value={notes[ticket.id] ?? ''}
            onChange={e => setNotes(n => ({ ...n, [ticket.id]: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" onClick={() => approveCFO(ticket)}>✓ Approve Pricing</Button>
          <Button variant="ghost" onClick={() => setExpanded(null)}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">CFO Approval</h1>
        <p className="page-subtitle">Pricing review and approval before signature and invoicing</p>
      </div>

      {/* Rental approval config — read-only; managed in Super Admin */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        marginBottom: 'var(--space-6)',
        fontSize: 'var(--text-sm)',
      }}>
        <span style={{
          padding: '2px 10px',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          background: state.config.requireCFOApprovalOnRentals ? '#e8f5e9' : 'var(--accent-light)',
          color: state.config.requireCFOApprovalOnRentals ? '#1b5e20' : '#7a4f00',
          flexShrink: 0,
        }}>
          {state.config.requireCFOApprovalOnRentals ? 'ON' : 'OFF'}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          CFO approval on rental tickets is{' '}
          <strong style={{ color: 'var(--text)' }}>
            {state.config.requireCFOApprovalOnRentals ? 'required' : 'not required'}
          </strong>.
          {' '}Manage this in{' '}
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/alya/admin')}
            style={{ padding: '0 4px', fontSize: 'inherit', minHeight: 'auto', display: 'inline', verticalAlign: 'baseline', color: 'var(--navy-light)', fontWeight: 600 }}
          >
            Super Admin
          </button>.
        </span>
      </div>

      {/* Pending CFO approval */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="section-title">Pending CFO Approval ({pending.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {pending.map(ticket => (
              <Card key={ticket.id}>
                <TicketCard
                  ticket={ticket}
                  action={
                    <Button
                      variant={expanded === ticket.id ? 'ghost' : 'secondary'}
                      size="sm"
                      onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                    >
                      {expanded === ticket.id ? 'Close' : 'Review'}
                    </Button>
                  }
                />
                {expanded === ticket.id && renderDetail(ticket)}
              </Card>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <StatusBanner type="info" className="mb-5">No tickets pending CFO approval.</StatusBanner>
      )}

      {/* Awaiting signature */}
      {awaitingSig.length > 0 && (
        <div>
          <h3 className="section-title">Approved — Awaiting Signature ({awaitingSig.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {awaitingSig.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </div>
      )}
    </div>
  )
}
