# Recording checklist (screen only, no sound)

Windows: Win+Alt+R (Xbox Game Bar) or any screen recorder. Record without a microphone. Add the narration from `narration.txt` afterwards. Target 2:40, limit 2:50.

## Before you record
1. Close other apps and notifications. Turn on Do Not Disturb. Hide the taskbar if possible.
2. Use a clean browser window with no personal bookmarks and no extensions visible. Zoom 100%.
3. Open the Kiro IDE on the repository, branch `main` (after merge) or `slice-6`. Check `.kiro/settings/mcp.json`: the `ghosttrace` server shows Connected with 3 tools in the MCP panel.
4. Open a terminal in the repository folder and run `npm ci` once if `node_modules` is missing.
5. Hide credit balances, account names and any token. Do not open secret files.
6. Do a dry run of the whole script once.

## Record, in script order
1. 0:00 Title card, then open https://lunauulu-lang.github.io/ghosttrace/ . Hold 3 seconds.
2. 0:15 Hold on the FAIL at load. Let the "synthetic" wording be visible.
3. 0:25 Press the preset "G000 Broken". Click `d1`, then `d4`.
4. 0:40 Turn on "Schema mapping (v2 amount)". Then "Causal ordering".
5. 1:00 Press the preset "G110 Over-capture". Click `d3`. Show captured 9800.
6. 1:15 Press the preset "G111 Repaired", or turn on "Deduplicate applied deliveries". Show PASS and 4900.
7. 1:30 Point at the "First divergence" tag on the timeline.
8. 1:40 Press "Preview export". Scroll both previews. Press "Download export JSON". Import the downloaded file with the import field.
9. 2:00 In the terminal run `npm run ghosttrace -- replay fixtures/haunted-checkout.json --repairs M,O,D`. Show PASS.
10. 2:12 In Kiro, show the MCP panel, then ask: call `replay_incident` for `fixtures/haunted-checkout.json` with repairs `M,O,D`. Wait for the real tool result.
11. 2:24 Show, about 2 seconds each: specs panel, steering folder, hooks panel, `docs/reviews/final-review.md`, `docs/KIRO_LOG.md`.
12. 2:36 End card with the repo and live links.

## After you record
1. Check the length is under 2:50.
2. Check no private data is visible (credits, email, tokens, file paths outside the repo).
3. Add the narration track from `narration.txt`. No music.
4. Upload as a public YouTube video and put the link in `docs/DEVPOST.md` (placeholder `YOUTUBE_LINK_TODO`).
5. Say in the video only what the repo shows: hooks were NOT OBSERVED, CI results are reported by the orchestrator.
