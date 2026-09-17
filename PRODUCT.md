# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Field Workers (truck drivers and onsite crew):** Highest daily usage cohort. Submit rig move and rental tickets from the field, typically on tablets in active oilfield environments (South Texas and West Texas). Speed, legibility, and touch reliability are critical.

**Secondary — CFO (Alya Hidayatallah):** Second highest user. Owns exception review, pricing approvals, fleet oversight, and cross-region visibility. Uses dashboard, exception queue, and CFO approval screens.

**Supporting roles:** CS Reps (order intake and job booking), Billers (ticket assembly and completeness review), Regional Approvers (STX: Jaime Reyes → Lindsey Tran → Customer; WTX: Aaron Griffith → Customer), Super Admin (user and config management).

## Product Purpose

Aly Energy Services currently tracks operational data across paper, whiteboards, JobUTracks, and KPA — four separate, fragmented systems with no shared truth. This platform replaces all of them with a single integrated oilfield services management system covering the full lifecycle from customer order intake through field ticketing, regional approval, CFO sign-off, digital signature, invoice generation, and Sage Intacct posting.

## Positioning

The only system Aly Energy needs: one workflow from well order to posted invoice, replacing paper and four legacy tools with a single source of truth that enforces regional approval chains and surfaces exceptions automatically before they become billing errors.

## Operating Context

- Two operating regions: **STX (South Texas)** and **WTX (West Texas)** — each with distinct approval chains that must be enforced by the system, not managed manually
- Field workers submit tickets on-site, likely on mobile/tablet devices in field conditions
- Billers and approvers work in office environments reviewing completed tickets
- CFO monitors exceptions, approves pricing variances, and manages fleet across both regions
- Sage Intacct is the ERP system of record; invoice posting closes the workflow loop
- Current state: data on paper, whiteboards, JobUTracks, and KPA — all manual, all siloed

## Capabilities and Constraints

**In scope:**
- 10-stage lifecycle: customer order → job creation → rig move ticket → rental ticket → ticket assembly → biller review → regional approval → CFO approval → digital signature → invoice → Sage Intacct posting
- Six roles with enforced permissions: CS Rep, Field Worker, Biller, Regional Approver (STX/WTX), CFO/Alya, Super Admin
- STX / WTX regional approval routing is non-negotiable — a structural product constraint, not a configuration
- Real role-based authentication required for V1 (prototype uses role-selection only; no real auth)
- Exception detection: double-booking, rig self-moves, SLA aging (30-day), region-specific routing anomalies
- Fleet and equipment tracking (400-unit fleet, 50 tracked items in prototype)
- Digital signature capture on tickets
- Price books reference for billing

**Out of scope (prototype non-goals carried forward):**
- EHS (environment, health, safety) integration
- ADP payroll integration
- Real-time GPS or telematics
- Multi-company or multi-tenant architecture (single company)

**V1 requirements beyond prototype:**
- Persistent database (prototype is in-memory only)
- Real Sage Intacct API integration (currently mocked)
- Real authentication and role enforcement

**Terminology:**
- STX = South Texas region; WTX = West Texas region
- Rig move ticket = record of equipment relocation between sites
- Rental ticket = record of equipment rental period for a job
- SLA = 30-day rental ticket completion window
- Easter eggs in prototype = demonstrable business logic scenarios for review (double-booking, rig self-move, past SLA, routing comparison)

## Brand Commitments

- Company name: **Aly Energy Services**
- Color system: Navy (#0D2B4E primary, #1A3F6F mid, #2A5596 light) + Orange accent (#F5A623, dark #C8841A)
- Typography: Inter (400, 500, 600, 700)
- No static logo file exists; logo is text-based ("Aly Energy Services") in accent orange on navy
- Status semantics established: Pending = orange, Approved = green, Flagged = red, Draft = gray

## Evidence on Hand

- Navigable React prototype (`/`) with 5 seed customers, 5 seed jobs, 10 field workers across STX/WTX
- 4 demonstrable business logic scenarios: double-booking (JOB-002), rig self-move (JOB-004), past SLA, regional routing comparison (STX vs. WTX)
- Full workflow documentation: `Aly_Energy_Prototype_Workflow_Map.md` at repo root
- No real customer data, financial data, or testimonials exist; none should be fabricated

## Product Principles

1. **Field-first:** Truck drivers and onsite crew are the highest-volume users. Their ticket submission flow must be the fastest, most reliable, and most legible surface in the system — optimized for tablets and field conditions before anything else.
2. **One source of truth:** This system exists to eliminate the paper/whiteboard/JobUTracks/KPA split. Every decision made in design and engineering should reduce the reasons to go outside the system.
3. **Regional precision:** STX and WTX are operationally distinct. The system enforces their separate approval chains — it does not offer a workaround or a unified queue that papers over the difference.
4. **Exception-forward:** Anomalies (double-bookings, rig self-moves, SLA overruns) surface automatically to the CFO rather than hiding in ticket queues. Visibility is a feature, not a side effect.
5. **Audit-closed:** Every ticket, approval, and exception is captured and traceable. Sage Intacct posting is the close of the loop, not an afterthought.

## Accessibility & Inclusion

Field workers use the system on tablets in active oilfield environments — high ambient light, gloved hands, and time pressure are realistic usage conditions. Large touch targets, high contrast (navy/white/orange WCAG AA baseline established), and minimal cognitive load on ticket submission screens are design requirements, not enhancements.
