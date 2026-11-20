# Slice 8 — Demo video pipeline (Kiro assembles the video with the owner's tools)

Prepared by Claude AI (orchestrator) on 2026-11-20. Executed by Kiro (Kiro IDE) in a NEW session.

Goal: an English demo video under 3 minutes (target 2:40, hard limit 2:50) for YouTube,
assembled by Kiro on this Windows machine with the owner's tools. The owner records the screen
and makes the voice in ElevenLabs (paid site, manual). Kiro prepares, checks and assembles.
Big media files never go into git.

## Rules

- One agent, no subagents. Work only in this repository. No global installs, no new npm
  dependencies, no paid services, no API keys.
- Do not change engine or app code (`src/**`, `cli/**`, `mcp/**`) or tests.
- Media files live only in `video-work/` (add it to `.gitignore` first). Never commit media.
- Push only branch `slice-8`; never push `main`. Never invent evidence.
- Stop and report if blocked. Watch RAM: stop if free RAM is under 1.5 GiB during encoding.

## Step 0 — prep

Clean tree (else stop) → `git checkout main` → `git pull --ff-only` → `npm test` exits 0
→ `git checkout -b slice-8` → add `video-work/` to `.gitignore` → create the folder.

## Step 1 — final narration

Update `docs/video/narration.txt` and `docs/video/script.md` so spoken numbers match what the
screen shows: the UI shows dollars, so say "ninety-eight dollars" (not "nine thousand eight
hundred") and "forty-nine dollars" (not "forty-nine hundred"). Read the whole narration once
for clarity: short sentences, plain English, at most 330 words, no claim the repo cannot back.
Commit `kiro: final narration`. Then show the owner the final narration text in chat.

## Step 2 — find the owner's video tools

Record versions in the log; do not install anything:
- `ffmpeg -version` and `ffprobe -version` (ffmpeg was found in Slice 6).
- Faster-Whisper: try `py -0p` to list Python installs, then for each try
  `<python> -c "import faster_whisper; print(faster_whisper.__version__)"`; also check the
  paths the owner gives you. If it is not found, say so — the fallback in Step 4 needs no
  Whisper.
- Remotion is not needed.

## Step 3 — owner records (stop and wait)

Tell the owner exactly, in short numbered steps:
1. Paste `docs/video/narration.txt` into ElevenLabs, generate an English voice, download it as
   MP3 and save it as `video-work/voice.mp3`.
2. Record the screen (Win+Alt+R or any recorder), without sound, following
   `docs/video/recording-checklist.md`, while listening to `voice.mp3` in headphones so the
   clicks follow the voice. Save it as `video-work/screen.mp4`. Several takes are fine
   (`screen-1.mp4`, `screen-2.mp4`, …) — say which parts they cover.
Wait until the owner says the files are there.

## Step 4 — subtitles

- If Faster-Whisper is available: transcribe `video-work/voice.mp3` (model `small` or smaller,
  CPU, English) to `video-work/voice.srt`, then fix the subtitle words against
  `docs/video/narration.txt` (keep Whisper's timings, use the script's exact words).
- Fallback: build `video-work/voice.srt` from `narration.txt` with sentence timings from
  `ffmpeg -af silencedetect` on `voice.mp3`.
- Copy the final subtitles to `docs/video/subtitles.srt` (text file, may be committed).

## Step 5 — assemble with FFmpeg

- Check durations with `ffprobe`. If the screen part is shorter than the voice, ask the owner to
  re-record that part; do not freeze-frame more than 3 seconds.
- Join takes if needed, scale/pad to 1920x1080, 30 fps, H.264 (`-preset veryfast -crf 20`),
  AAC audio from `voice.mp3`, burn in `voice.srt` (readable size, bottom, white with outline).
  Optional: a 2-second title card at the start ("GhostTrace — Kiroween 2026, Frankenstein")
  and a 4-second end card with the live link and repo link, made with ffmpeg `drawtext`.
- Output `video-work/ghosttrace-demo.mp4`. It must be under 2:55. Report its duration, size
  and resolution.
- Save the exact ffmpeg commands to `docs/video/build-commands.md` (no personal paths outside
  the repo).

## Step 6 — log, push

- `docs/KIRO_LOG.md`: "Slice 8 run entry" (session ID, tools and versions, commands and exit
  codes, final video duration). Update the feature table (video assembled by Kiro with ffmpeg).
- `npm test`, `npm run typecheck`, `npm run build` exit 0.
- Commit `kiro: Slice 8 video pipeline` (no media), then `git push -u origin slice-8`.
  No PR, no merge. Tell the owner where the final MP4 is so he can watch it and upload it.

## Final report (in chat)

Branch, commit SHAs, push result, tools found, subtitle method, final video path, duration,
size, NOT DONE, open questions.
