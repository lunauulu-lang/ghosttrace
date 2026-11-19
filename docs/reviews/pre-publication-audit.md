# Pre-publication audit
Date: 2026-11-19. Branch `slice-5`, checked at the commit after `aa60dff`. Scope: every tracked file (`git ls-files`, 90-odd files). Method: `git grep` over tracked content; `package-lock.json` was excluded from word searches (it holds only package names and integrity hashes) and checked separately for local paths.

## Result
No secret, token, email, phone number or local path was found. One metadata gap was fixed (`license` in `package.json`). Three items need the owner's decision.

## Checks
| Check | Command (summary) | Result |
|---|---|---|
| Key-shaped strings: `sk-...`, `ghp_`, `gho_`, `github_pat_`, `AKIA...`, `xox[bp]-`, `AIza...`, PEM private key headers | `git grep -n -i -E` with those patterns, whole tree except lockfile | Only hit: `docs/prompts/SLICE_5_PROMPT.md` line 54, which names the patterns in prose. No real keys. |
| Words `password`, `secret`, `token`, `api_key`, `bearer` | `git grep -n -i -E` outside `tests/` | Hits are spec and doc text about redaction, and the CI permission `id-token: write`. No values. |
| Secret-like keys in the fixture | `git grep` for secret, token, api_key, authorization, signature, cookie, card in `fixtures/` | No match. |
| Test sentinels | `tests/**` | `SENTINEL_SECRET_VALUE_12345` and similar placeholders only; they exist to prove redaction. |
| Local paths (`C:\Users`, `/Users/`, `/home/`) and the machine user name | `git grep -n -E` | No match in tracked files (lockfile also clean). |
| Email addresses | `git grep -n -E` for address pattern | No match. Commit author is a GitHub no-reply address (`227181558+lunauulu-lang@users.noreply.github.com`). |
| Phone numbers | `git grep -n -E` for phone patterns | No match. |
| License | `LICENSE` is the MIT License ("Copyright (c) 2026 lunauulu-lang"); MIT is OSI-approved | OK. `package.json` had no `license` field; added `"license": "MIT"` (this slice). |
| `/.kiro` at root, not ignored | `git ls-files .kiro` and `git check-ignore -v .kiro` | 21 tracked files under `.kiro/`; `check-ignore` exit 1 (not ignored). `.gitignore` ends with a comment saying not to ignore `.kiro/`. |
| `.gitignore` coverage | file read | `node_modules/`, `dist/`, `.env`, `.env.*` (except `.env.example`), `coverage/`, reports ignored. |
| `npm audit --omit=dev` | run locally | `found 0 vulnerabilities`, exit 0. |

## Fixed in this slice
- `package.json`: added `"license": "MIT"` to match `LICENSE`.

## Owner decisions
1. **Copyright holder name.** `LICENSE` and the commit author name show the GitHub handle `lunauulu-lang`. If you want a real name or a different holder, change `LICENSE` before publishing. The handle also appears in the README link in item 2 and in the Live demo URL.
2. **README line 11 links to a private repository** (`https://github.com/lunauulu-lang/ai-software-factory/issues/8`, "Preparation background"). Judges will see a 404, and `AGENTS.md` says private factory history stays out of the contest repo. Recommended: delete that line before going public. It was not changed here because it is your call.
3. **Stale wording in README and `CREW_TASK.md`.** The README STATUS paragraph says the repository is private and nothing is deployed. `CREW_TASK.md` says "DO NOT RUN until private contest repo...". Both become inaccurate once the repository is public. Slice 5 adds a judge-facing block at the top of the README but does not remove the old text.
4. **Git history.** Not rewritten. Early commits and `docs/prompts/*` show how the work was orchestrated; this is intended to be disclosed (see `docs/KIRO_USAGE.md`). Say so if you want any prompt file removed from the public repo.

## Not checked
- Content of GitHub settings, secrets, Actions history or issues (outside the tracked files).
- Binary files: none are tracked.
