# User-initiated video audio audit — 2026-09-30

## Convention and repeatable checks

Autoplaying presentation/360 loops stay muted and inline. Controlled films require user playback, retain their posters/controls/preload/fullscreen behavior, and use `muted={media.hasAudio === false}`. A genuinely silent source stays silent. Do not infer an audible soundtrack solely from the existence of an audio stream.

Run `npm run test:media-audio` (requires ffprobe on PATH and local registered private-media derivatives). It renders the actual WorkVideo component with stubbed visibility/image imports, tests loop and controlled audio policies, verifies both known media records, and probes their physical MP4 streams. Run alongside lint, TypeScript, content tests and `npm run verify:assets`.

## Reported videos

Source base: `W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/`.

| Item | Master relative to source base | Registered derivative | Before this task |
| --- | --- | --- | --- |
| Five Below hero | `pakit_displays/five_below/selects/PAK-IT_SIZZLE_REEL_30_V04.mp4` | `private-media/7f6bdd42c357f519e48e.mp4` | controls; hasAudio true |
| Cable Snake BTS | `cable_snake/process/Twist_CableSnake_BTS_Edit_003.mp4` | `private-media/190c338103121d919ced.mp4` | controls; base hasAudio unspecified, rendered case override true |

Both masters and both derivatives contain H.264 video and stereo AAC audio at 48,000 Hz. The derivatives are non-silent: Five Below mean/max -12.3/-0.1 dB; Cable Snake BTS -17.7/-0.2 dB (ffmpeg volumedetect). Both rendered players already started paused, unmuted, with controls and volume 1, and without autoplay. Native Play clicks produced advancing playback, decoded audio bytes and nonzero Web Audio RMS output routed to the audio destination (approximately 0.335/0.337 peak sampled RMS). This verifies browser signal output, not the user's physical speakers or OS mixer.

No missing-audio fault was reproduced in this checkout. Neither a stripped derivative nor forced mute was found for the reported files. No media was regenerated, gain-adjusted or replaced. Cable Snake BTS now explicitly declares hasAudio true in its canonical record as well as its existing case override. Shared players and all layouts remain unchanged.

## Scoped audit

Inspected 11 current public/preview case routes and their 11 rendered controlled videos, plus registry media records. Audible sources for Five Below, Cable Snake campaign/BTS, WHAXE, Wawa and Uncommon Goods 30 retain audio in the derivatives and render unmuted. Uncommon Goods 15 also has AAC and renders unmuted; its recorded F: master was unavailable, so source comparison could not be completed for that asset.

GEICO's registered supplied pre-color file and Capri Sun BOX_OPEN have no audio streams, matching their derivatives. DESMI's registered chocolate-pump source is itself a silent prepared loop, not an original master; its derivative is also silent. The separately available DESMI sizzle MOV is silent too, but is not asserted to be the original source of that chocolate-pump loop. No soundtrack was invented or substituted.

AMSOIL comparison has AAC in both master and derivative, but both measure digital silence (-91 dB throughout); leave its hasAudio false unchanged. No additional confirmed affected controlled videos were found. This is not a claim that every historical master is available.

The homepage hero, Five Below noSound stocked-products loop and 360 wheelbarrow loop were observed playing with muted true and loop true. No new runtime/autoplay errors were found; only the known local Vercel analytics endpoint issue was excluded from console checks.

Local detailed browser/probe evidence is in ignored `scripts/runtime/audio_fix/`. No masters, derivatives, publication metadata, case-study layout, About/FAQ content or interactive logos were changed. No push or deployment.
