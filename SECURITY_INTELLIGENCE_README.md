# Security Intelligence System

## 🎯 Overview

The Security Intelligence stack ingests Microsoft Security Response Center (MSRC) Common Vulnerability Reporting Framework (CVRF) feeds, enriches them with in-house telemetry, and orchestrates automated fuzzing campaigns aimed at the riskiest surfaces we own. The goal is to convert raw security bulletins into prioritized, actionable engineering work within minutes of disclosure.

### Primary Outcomes
- **Continuous awareness** of Microsoft security bulletins, CVEs, and product advisories.
- **Automated triage** of vulnerability metadata into severity-weighted backlogs.
- **Targeted fuzzing playbooks** that launch as soon as matching patterns are detected.
- **Closed-loop reporting** that feeds fuzzing results, mitigations, and tracking metrics back to stakeholders.

## 🧭 Scope & Use Cases
| Persona | Objective | Typical Activities |
|---------|-----------|--------------------|
| Security Operations (SecOps) | Maintain real-time view of MSRC advisories | Monitor dashboards, configure alerts, escalate critical CVEs |
| Offensive Research | Generate fuzzing campaigns tailored to newly discovered bug classes | Consume campaign manifests, extend harnesses, analyze crash dumps |
| Engineering Management | Understand product exposure and remediation velocity | Review risk summaries, track mitigation SLAs, approve campaign budgets |

## 🏗️ Architecture
```
            ┌────────────────────────────┐
            │  MSRC CVRF API (v3.0)     │
            └────────────┬──────────────┘
                         │ ingest
                 ┌───────▼────────┐
                 │ MSRCCVRFClient │  lib/msrc-cvrf-client.ts
                 └───────┬────────┘
                         │ normalized updates
                 ┌───────▼────────────────────────┐
                 │ SecurityIntelligenceService    │
                 │ • Enrichment & scoring         │
                 │ • Pattern recognition          │
                 │ • Campaign synthesis           │
                 └───────┬───────────────┬────────┘
                         │               │
          ┌──────────────▼────┐   ┌──────▼────────────────────┐
          │ API Layer         │   │ SecurityIntelligence UI   │
          │ app/api/...       │   │ components/security-…tsx  │
          └──────────────┬────┘   └──────────┬────────────────┘
                         │                  │
                 ┌───────▼────────┐   ┌──────▼──────────────┐
                 │ Campaign Queue │   │ Monitoring Pipeline │
                 │ (Redis/Queue)  │   │ (Alerts, Metrics)   │
                 └────────────────┘   └────────────────────┘
```

### Data Flow Highlights
1. **Collector** pulls CVRF documents on cadence (default 15 minutes) with resilient retry and ETag caching.
2. **Normalizer** converts raw MSRC structures into internal `SecurityUpdate` models.
3. **Enrichment** tags updates with severity buckets, exploit hints, product ownership mapping, and pattern fingerprints.
4. **Campaign Synthesizer** emits `FuzzingCampaign` manifests when matching vulnerability classes (e.g., RCE, IO kit, scripting engines) are detected.
5. **Monitoring Pipeline** pushes metrics to the dashboard and triggers notifications via PagerDuty/MS Teams/Email depending on severity policies.

## 🔌 Data Sources & Enrichment
| Source | Purpose | Notes |
|--------|---------|-------|
| MSRC CVRF v3.0 | Primary vulnerability data (CVE, KB links, product tree) | Requires API key & `Accept: application/json` |
| Internal Product Registry | Maps Microsoft product names to internal owners/services | Populated via `lib/product-registry.ts` |
| Exploit Prediction Heuristics | Flags whether a CVE is likely to be exploited (based on keywords, CVSS vectors) | Configurable thresholds |
| Historical Fuzzing Results | Avoids duplicate campaigns and guides regression focus | Stored in `fuzzing_results` table |

## ⚙️ Deployment & Configuration
### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MSRC_API_KEY` | Authentication token for MSRC API | _required_ |
| `MSRC_BASE_URL` | Override base URL (for staging mocks) | `https://api.msrc.microsoft.com/cvrf/v3.0` |
| `MSRC_POLL_INTERVAL_MIN` | Minutes between background ingestion runs | `15` |
| `MSRC_CACHE_TTL_SEC` | Seconds to retain API responses | `300` |
| `FUZZING_QUEUE_URL` | Target queue for campaign manifests | _required_ |
| `ALERT_WEBHOOK_URL` | Notification endpoint (Teams/Slack/MS Sentinel) | optional |

Deploy the service using the standard application stack (Next.js + Node workers). For production, run the background ingestion worker (`npm run security:worker`) alongside the API/UI container.

## 🧠 Operational Workflow
### Daily Checklist
- Review **Critical/Important** CVEs surfaced in the dashboard.
- Confirm that auto-generated fuzzing campaigns reached the queue; re-run if blocked.
- Audit alert noise and adjust thresholds if false positives occur.

### Weekly Tasks
- Validate owner mappings against the product registry (spot-check 10 CVEs).
- Export trend reports (7d/30d) for leadership syncs.
- Reconcile fuzzing outcomes vs campaigns triggered (success rate, crashes found).

### Incident Handling Playbook
1. **Receive Critical CVE alert** (P0/P1). On-call acknowledges within SLA.
2. **Trace Ownership** via dashboard (Product → Team mapping) and open tracking ticket.
3. **Ensure Campaign Execution**; escalate to fuzzing team if backlog > 2 hours.
4. **Capture Mitigation Evidence** (patch release, feature flag, or risk acceptance).
5. **Log Postmortem Notes** in `_security_incident_log.md`.

## 🧩 API Endpoints
| Endpoint | Method | Description | Query Params / Body |
|----------|--------|-------------|----------------------|
| `/api/security-intelligence?action=updates` | GET | List security updates | `severity`, `timeframe` (`7d`, `30d`), `product` |
| `/api/security-intelligence?action=analysis` | GET | Aggregate metrics | `timeframe`, `groupBy` (product, severity) |
| `/api/security-intelligence?action=campaigns` | GET | View generated campaigns | `status` |
| `/api/security-intelligence` | POST | Advanced actions | `action`: `generate-campaigns` 
 |  |  | `config`: priority, durations, vulnerability types |
| `/api/security-intelligence` | POST | Pattern analysis | `action`: `analyze-patterns`, `config`: timeframe, severity, products |

### Example: Custom Campaign Request
```bash
curl -X POST /api/security-intelligence \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "generate-campaigns",
    "config": {
      "priority": "critical",
      "timeframe": "14d",
      "vulnerabilityTypes": ["Remote Code Execution", "Privilege Escalation"],
      "minDuration": 90,
      "maxDuration": 240
    }
  }'
```

## 🧪 Automated Fuzzing Campaign Lifecycle
1. **Campaign Creation** – manifest includes vulnerability references, harness templates, target binaries, success criteria.
2. **Execution** – automation pipeline launches distributed fuzzing jobs (via OSS-Fuzz/Azure Batch/custom infra).
3. **Telemetry Collection** – crash triage, deduplication, and symbolization.
4. **Result Feedback** – campaign status updated (`running` → `completed`), crash artifacts linked to tickets.
5. **Retrospective** – success metrics (unique crashes, coverage gained) logged in `campaign_results` store.

## 📊 Monitoring & Metrics
- **Dashboards** (Grafana/Looker):
  - CVE volume per product/severity.
  - Campaign throughput & success rate.
  - API health (latency, cache hit rate, error codes).
- **Alerts**: configurable via `config/alert-policies.yaml`.
  - P0: New CVE with severity = Critical and product owned by us.
  - P1: Fuzzing queue backlog > 5 campaigns for > 30 minutes.
  - P2: API ingestion failures > 3 consecutive attempts.

## 🔐 Security & Compliance Controls
- **Transport**: HTTPS w/ TLS 1.2+, strict certificate validation.
- **Secrets**: Store in Azure Key Vault or GCP Secret Manager; never commit API keys.
- **Access**: RBAC enforced via platform auth; only security engineers can trigger campaigns.
- **Auditing**: All POST/DELETE calls logged with requestor ID, timestamp, payload hash.
- **Data Handling**: No long-term storage of CVRF payloads; cached data purged on TTL.

## 🧰 Testing & QA
| Command | Purpose |
|---------|---------|
| `npm test` | Unit tests for clients, utilities |
| `npm run test:integration` | End-to-end ingestion + API assertions |
| `npm run test:api` | Contract tests for REST endpoints |
| `npm run security:demo` | Runs scripted dataset with mock responses |

### Mocking MSRC
- Use `scripts/msrc-mock-server.ts` to simulate API limits and error conditions.
- Add fixtures under `fixtures/msrc/*.json` for deterministic testing.

## 🆘 Troubleshooting
| Symptom | Likely Cause | Resolution |
|---------|--------------|-----------|
| Dashboard empty | API key invalid or rate-limited | Check `logs/msrc-client.log`, rotate key |
| Campaigns not queuing | `FUZZING_QUEUE_URL` misconfigured | Validate connectivity, check queue permissions |
| Duplicate alerts | Cache invalidation mis-tuned | Adjust `MSRC_CACHE_TTL_SEC`, inspect cache hit ratio |
| MSRC 403 errors | Missing `api-key` header | Ensure secret injected into runtime |

## 📚 Glossary
- **CVRF** – Common Vulnerability Reporting Framework (MSRC format).
- **Campaign** – A fuzzing job bundle targeting specific vulnerability signatures.
- **Pattern Fingerprint** – Hash combining CVE keywords, affected components, exploit traits.

## 🚀 Roadmap
- Multi-vendor ingestion (CISA KEV, NVD).
- Machine-learning based exploit prediction (EPSS integration).
- Bidirectional integration with ticketing (Jira/ADO).
- Real-time push notifications via SignalR/WebSockets.

---
**Responsible Use Reminder:** Only deploy the fuzzing campaigns against assets you own or have written authorization to test. Coordinate disclosure with MSRC or the appropriate vendor when novel vulnerabilities are identified.
