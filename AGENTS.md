# GhostTrace coding instructions — staging, not agent execution evidence

Treat .kiro/specs/ghosttrace/{requirements,design,tasks}.md as the contract.
Never reuse EvidencePulse source or include private factory history in the contest repo.
Do not expand scope beyond the guest incident demo until its end-to-end tests pass.
Keep the event-processing engine pure and immutable; no network calls inside replay.
Handle malformed imports and conflicting duplicate IDs as explicit errors.
No speculative "production repaired" claims: passing means only that this synthetic replay passed.
Do not log real uploaded event bodies or put secrets in Git.
Write tests before claiming a feature is done; report failing commands without hiding them.
Do not deploy, publish, buy subscriptions, enable overage or submit to Devpost without owner authorization.
Kiro execution must be documented with real logs/IDs; these preparatory documents were generated outside Kiro.
