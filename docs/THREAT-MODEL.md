# Threat Model

## Protected assets

- User-supplied provider API keys.
- Planner task text and weekly structure.
- User control over task movement and priority state.

## Trust boundaries

1. Browser UI and in-memory credential state.
2. Same-origin loopback request to the local gateway.
3. Allowlisted outbound request to Anthropic, OpenAI, or OpenRouter.
4. Untrusted model output returning through the gateway.
5. Existing browser-local planner persistence.

## Primary threats and controls

| Threat | Control | Residual limit |
| --- | --- | --- |
| Credential committed or persisted | No env requirement, storage call, cookie, URL field, or credential log; password input uses React state only | Browser extensions and local malware remain outside scope |
| Credential exfiltration to arbitrary host | Provider enum maps to three fixed HTTPS origins; user cannot supply a base URL | DNS, TLS, provider, and local-machine compromise remain outside scope |
| Cross-origin request to gateway | Loopback bind, same-origin requests, JSON content type, origin/host checks, bounded body | Local processes can still reach loopback |
| Prompt or response logged | Gateway avoids request/response bodies and reduces upstream errors | Providers receive live-request content under their policies |
| Model creates unauthorized changes | Output schema permits only existing-task move/priority proposals; independent parser rejects extra fields | Semantic quality can still be poor |
| Partial or stale application | Snapshot fingerprint, complete preflight, and one atomic reducer action | Another tab remains last-write-wins in browser storage |
| Capacity violation | Deterministic simulation checks task and priority limits before approval and inside reducer | Existing accepted over-capacity legacy state remains possible |
| Denial of service or cost amplification | Request and provider-response size limits, timeout, locked single in-flight UI request, bounded tasks, bounded output | Provider rate limits and billing remain user-owned |

## Explicit non-claims

This local reference is not a hardened multi-user service, secret manager, privacy guarantee, security certification, or production deployment.
