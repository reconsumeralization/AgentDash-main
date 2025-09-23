# Connector Platform SLOs

This document captures the current Service Level Objectives (SLOs) and corresponding monitoring expectations for the connector platform. It serves as a working baseline until the production monitoring stack is finalized.

## Scope & Ownership

- **Platform Components**: Connector Manager service plus platform-specific connectors (LinkedIn, Twitter/X, Facebook, Instagram, YouTube, Reddit).
- **Environments**: `us-east-1`, `eu-west-1` (extend list as regions are added).
- **Primary Owners**: Social Integrations Team (`#oncall-conn`).
- **Support Teams**: Platform SRE (`#platform-sre`), Data Infrastructure (`#data-infra`).

## Service-Level Objectives

| Service / Capability              | SLO Target | Measurement Window | Notes |
| --------------------------------- | ---------- | ------------------ | ----- |
| Connector Manager API availability| 99.9%      | Calendar month     | Apportion error budget equally per region. |
| Connector Manager p95 latency     | <= 100 ms  | Calendar month     | Measured intra-region, application edge to Connector Manager. |
| Cross-post end-to-end p95 latency | <= 5 s     | Calendar month     | API ingestion through final platform attempt (success or failure). |
| Token refresh success rate        | 99.9%      | Rolling 1 day      | Includes automatic refresh and manual re-auth flows. |
| Individual connector availability | 99.5%      | Calendar month     | Accounts for upstream API outages; track per platform. |
| Individual connector p95 latency  | <= 500 ms  | Calendar month     | Platform API call latency as observed by Connector Manager. |

### Error Budgets

- **99.9% SLO** => 43 min, 12 sec monthly error budget.
- **99.5% SLO** => 3 h, 39 min monthly error budget.
- Adopt multi-window burn alerts:
  - Fast burn: 2% budget consumed within 1 hour => page on-call.
  - Slow burn: 5% budget consumed within 6 hours => create incident ticket.

## Service-Level Indicators

| SLI | Source | Metric / Query | Cardinality Notes |
| --- | ------ | -------------- | ----------------- |
| API availability | Ingress / app metrics | `1 - rate(http_server_errors_total{service="conn-manager"}[5m]) / rate(http_requests_total{service="conn-manager"}[5m])` | Ensure `service`, `region`, `env` labels present. |
| API latency | OpenTelemetry traces + Prometheus histogram | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="conn-manager"}[5m])) by (le, region))` | Use OTEL `http.route` to segment endpoints. |
| Cross-post latency | OTEL span duration | `histogram_quantile(0.95, sum(rate(span_duration_seconds_bucket{span_kind="INTERNAL", span_name="crosspost.execute"}[5m])) by (le, region))` | Include `platform_count` attr. |
| Token refresh success | Auth service metrics | `rate(token_refresh_success_total[5m]) / rate(token_refresh_attempt_total[5m])` | Break out `platform_id`. |
| Connector availability | Synthetic checks + platform metrics | `1 - rate(connector_errors_total{severity="critical"}[5m]) / rate(connector_requests_total{severity!="synthetic"}[5m])` | Tag `platform_id`, `error_class`. |

## Monitoring & Tooling

- **Instrumentation**: OpenTelemetry (traces, metrics, logs) emitted via OTLP.
- **Collection**: OTEL Collector deployed per cluster/region.
- **Backends**:
  - Metrics: Prometheus (primary) with 30-day retention. Optional export to Datadog via remote_write if required.
  - Dashboards: Grafana (`Connector Platform` folder) for SLO visualisations and dependency health.
  - Logs: Loki (structured JSON); include `trace_id` correlating with OTEL spans.
  - Traces: Tempo or Jaeger (select one; default Tempo with Grafana data source).
- **Alerting**: Alertmanager routes to PagerDuty (`Social Integrations Primary`) for fast-burn pages, Jira automation for slow-burn breaches. Slack notifications to `#alerts-conn-platform`.

## Dashboards & Runbooks

| Artifact | Location | Owner |
| -------- | -------- | ----- |
| Connector Platform Overview | Grafana: `Connector / Overview` | Social Integrations Team |
| Upstream Platform Health | Grafana: `Connector / Providers` | Social Integrations Team |
| Error Budget Tracker | Grafana: `Connector / SLO` | Platform SRE |
| PagerDuty Runbook | `https://runbooks.internal/connector-oncall` | Social Integrations Team |
| Token Refresh Hotfix SOP | `https://runbooks.internal/token-refresh` | Platform SRE |

_Add links once internal URLs are available._

## Dependency Map

| Dependency | Criticality | Notes |
| ---------- | ----------- | ----- |
| Postgres (connector-state) | High | Stores cross-post jobs, per-platform status, idempotency records. |
| Redis (connector-cache) | High | Holds rate-limit metadata, idempotency locks, connector health cache. |
| Platform APIs (LinkedIn, etc.) | High | External SLAs vary; track vendor status pages. |
| Message queue (optional) | Medium | Only if async job ingestion is enabled. |
| Secret manager | High | OAuth client secrets, signing keys. |

Ensure health probes monitor these dependencies explicitly (for example, Redis ping latency, Postgres replication lag).

## Operational Policies

- **Partial Failures**: mark cross-post job `partial_success` when at least one platform succeeds and at least one fails. Trigger compensating actions via retry queue.
- **Idempotency**: default dedupe window 24 hours per user per content hash. Scope per region unless cross-region dedupe is required; revisit once global routing is defined.
- **Maintenance Windows**: schedule connector upgrades outside platform peak hours (02:00-05:00 region-local) with at least 48-hour notice.
- **Incident Communication**: follow standard incident template; include impacted platforms, percentage of failed posts, and estimated blast radius.

## Open Items

1. Confirm final monitoring backend (Prometheus/Grafana vs Datadog) and update tooling section accordingly.
2. Define authoritative source for connector instantiation (service name, config path) and document startup sequence.
3. Finalise idempotency policy (window length, regional scoping) and document in Connector Manager design doc.
4. Add deep links to dashboards and runbooks once URLs are provisioned.
5. Extend SLO coverage to ancillary services (analytics pipeline, reporting exports) as they become productionised.

_Last updated: 2025-09-22._
