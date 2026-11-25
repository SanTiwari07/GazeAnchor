# GazeAnchor verification

## Setup evidence from November 25, 2026

From the Lens project folder:

```text
npx skills add challengepost/learn-specs --all -y
Source: https://github.com/challengepost/learn-specs.git
Found 1 skill
Skill: plan-lens
Installed 1 skill
✓ .\.agents\skills\plan-lens
  universal: Amp, Antigravity, Antigravity CLI, Cline, Codex +19 more
```

The project lockfile and upstream HEAD matched at commit `5d8bc0800346d38e468c29b15afcb7ca92280005`. Codex discovered `plan-lens` in the trusted project folder. The original brief was filled directly from the template. After the exact install, the official `$plan-lens` was invoked in a fresh Codex CLI session. It read the installed skill, both AR design and Preview references, and the brief template, then reconciled the approved brief.

The following is the redacted listing from `codex mcp list`:

```text
lens-studio  http://localhost:50040/mcp  -  enabled  Bearer token
```

The live CLAD diagnostic returned:

```json
{"ok":true,"projectPath":"C:/Projects/02_Hackathons_and_Flagship_Apps/GazeAnchor/GazeAnchor/GazeAnchor.esproj","targetPlatform":"Spectacles","intendedPlatforms":null,"lensStudioVersion":"5.23.2.26081320","isAuthorized":true}
```

`ListAllPanels` returned eight panels, including Preview. `ListInstalledPackagesTool` returned five packages including Spectacles Interaction Kit, Spectacles UI Kit, and LEAF. The current CLAD 1.1.0 router requires Lens Studio 5.25+. The official Snap `release/5.22` CLAD workflow passed its live preflight on this authorized Lens Studio 5.23.2 setup. The first integrated preview rendered room geometry. Control readability and spatial-audio warnings still needed fixes at the setup verification pause.

## Validation status

A Preview capture is evidence of rendering only. Reachability, dwell cancellation, fan control, simulated comfort requests, off-view cues, repeatability and resets each need scenario evidence. Record actual LEAF runner and hardware results separately.

## Resume and live diagnosis

- Live MCP listed eight Lens Studio panels. Preview reported SPECS 27, Interactive, Plane. A wearer-view screenshot showed room geometry, the comfort boundary, and the lamp marker. The HUD and operator controls were outside the view.
- The runtime scene query placed the neutral camera at y = 0 cm, the reachability label at y = −94.5 cm, and the Guided sweep label at y = −141 cm. The script now positions the control group at the tracked seated origin and increases label sizes.
- Historical logs contained an audio-listener warning before the partial build's latest recorded reset. The existing script creates a listener on the tracked camera before creating the spatial chime. A live off-view acknowledgment is needed to verify the audio path.
- The supplied Node test passed against the integrated project copy of Reach.ts. Fixed reachability was 1/3. Both the demo preset and the asymmetric profile (yaw −12° to +9°, pitch −6° to +4°) reached 3/3, preserved the lamp, and produced deterministic proxy positions at least 9° apart. The infeasible test returned 0/3 within the original bounds.
- Earlier editor logs warned that the installed LEAF package was authored in a newer Lens Studio version. No LEAF scenario result or hardware result was obtained.
- With the prior build still running, MCP wearer-view look-at to the lamp at (−20, −8, −110) cm produced the runtime log '[GazeAnchor] Actions opened | Lamp'. The camera returned to neutral afterward.
- Forced TypeScript recompilation remained pending. The editor logged 'Synchronization is already in progress' at 14:16:52, and the generated JavaScript still had its 14:11:31 timestamp and previous code. The live evidence above therefore applies to the prior build. Updated rendering, the measured sweep and adaptive placement, narrow-menu selection, the simulated request with offline retry and off-view cue, and Reset Demo remain unverified.
- RecompileTypeScriptTool ultimately timed out after 300 seconds. The project instructions require stopping on the MCP failure. Preview refresh and verification of the edited build were blocked at recompilation.

## Recovery and Preview retest on November 25, 2026

- A Codex session started from the Lens project directory reached the registered Lens Studio MCP. The editor confirmed `GazeAnchor.esproj`, Lens Studio `5.23.2.26081320`, and the Spectacles target. Preview 1 was running SPECS 27 in Interactive mode. The approved Devpost brief and planning skill references are present.
- The editor initially logged a pending file synchronization. Later logs showed that synchronization reached the compiler and exposed three independent failures. GazeAnchor referenced the removed `completed` counter (TS2339). Leaf 4.0.0 and AiPreviewAgentInteract 4.0.0 referenced package names from the modern Interaction Kit and UI Kit; Leaf also emitted TS2352. The original 300-second timeout's exact cause remains undetermined.
- Corrected GazeAnchor's successful selection count and the invalid byte in the sweep log. Backed up the two incompatible package archives and metadata, the scene, manifest, and original controller, then isolated those packages via Lens Studio's Editor API. The removal left an empty script component on the optional AI Preview handler. The regular native Preview input and runtime scene inspection tools continued to work. The backup directory is `%TEMP%/GazeAnchor-recovery-719f382bdd8d4d3aa4c024172a5ef773`.
- Lens Studio logged `TypeScript compilation succeeded!` at 14:31:58 IST and initialized the current Lens at 14:31:59. The startup log showed the restricted Fixed baseline of **1/3 reachable**.
- Native Preview input switched Fixed to Adaptive at 14:32:52. The visible count changed to **3/3 reachable**. The lamp stayed on its object. The fan and care proxies appeared separately at about `(10.2°, 3.4°)` and `(10.2°, −5.67°)`, with visible tether lines toward their source objects. Reset Demo returned to Fixed at 14:33:08.
- A subsequent Interactive Preview run aimed the camera at the Lamp marker and dwelled to open its menu, then dwelled on On. The runtime logged the selection and one successful action. After switching to Adaptive, dwell on Fan and High produced the **Fan high** status. Care dwell followed by Water produced **Water · Delivered** on the second attempt after one cancelled glance. Explicit operator input produced **Water · Acknowledged**. The runtime logged `chime=true` and later cue clearance. Audio audibility and the arrow's visual direction were not verified.
- The same run reset to Fixed **1/3**, Fan off, the initial Care beacon caption, and zero action, travel, and cancellation counters at the reset moment. Re-aiming at neutral added another 17° to the existing live counter, which accumulates even outside task attempts. This run did not provide comparable fixed/adaptive timing or rotation totals.
- The tests in `tests/reach.test.mjs` passed with `node --test tests/reach.test.mjs`. These replay the authored room angles through the placement function, exercising the restricted profile, an asymmetric profile, and an infeasible envelope. Direct anchors use the full measured envelope, per the detailed plan. The 85% inset applies to proxies, whose endpoint coordinates now stay within the bounds without floating-point overshoot.

### Guided asymmetric calibration

Preview 1 captured neutral at `(0, 0, −3)` cm with a forward look toward `(0, 0, −110)`. Native camera moves and off-center Capture / Next touches preserved the sampled directions. The four sweep logs recorded **−12° left, +11° right, +8° up, −7° down**. A 2.2-second hold at neutral completed the sweep. The log sampled at 14:37:19 IST identified the profile as measured and reported **Fixed · 1/3 reachable**. The mode button then produced **Adaptive · 3/3 reachable** with the same bounds.

| Marker | Fixed position (cm) | Adaptive position (cm) |
| --- | --- | --- |
| Lamp | (−20, −8, −113) | (−20, −8, −113) |
| Fan | (78, −6, −115) | (16.70, 6.49, −104.43) |
| Care beacon | (44, −12, −108) | (16.64, −10.68, −104.08) |

Reset Demo at 14:37:32 restored Fixed **1/3** and the restricted preset. These measurements come from simulated head motion in Lens Studio Interactive Preview.

### Legacy LEAF recovery

Snap's 5.22 Preview interaction package declares Leaf 2.0.0 and Spectacles Interaction Kit 2.0.0 together. The Asset Library returned a version-specific Leaf 2.0.0 archive. Installing that exact release restored the testing dependency without changing the existing Interaction Kit. On Lens Studio 5.23.2, the package compiled at 14:38:45 IST and Preview started. The LEAF panel opened and initially returned an empty scenario list for the Preview target.

The newer Leaf 4.0.0 release and its current published setup guide apply to Lens Studio 5.25 or later. The GazeAnchor build retains the 5.23.2 baseline and uses the legacy package's installed declarations and source for scenario authoring.

### Acceptance suite and cue recovery

The initial complete LEAF run at 17:45–17:47 IST registered and executed T01 through T12. T01–T11 passed. T12 confirmed the switch and acknowledgment path, then failed because the direction arrow stayed hidden. The acknowledgment callback had evaluated the camera view during the input event. The change deferred that evaluation to the same LateUpdate pass that consumes the live pose. T12 passed on retest at 17:49:09 IST. The Lens logged a single chime request, showed the rightward arrow, and cleared it on return to the care marker. The run did not establish the audibility of the chime.

T11 was expanded to run both trials using the live dwell and operator controls. The first expanded run at 17:49:30–17:49:39 IST completed **1/3** tasks in Fixed and **3/3** in Adaptive under the same restricted preset. The runtime recorded the incomplete Fixed attempt at 48.94° of travel and 4.85 s elapsed, and the complete Adaptive attempt at 77.28° and 7.47 s. The two paths completed different tasks, so these travel and elapsed readings do not establish a reduction in effort or a speedup.

The angle calculation now uses the cross-product magnitude and dot product. Identical camera vectors contribute exactly zero travel even when the vectors have floating-point normalization error. An invalid target offset supplies neither an active target nor a proxy. Both cases are covered by standalone regression tests.

### Cold start

Saved the project in Lens Studio and closed it normally. The new Lens Studio process opened `GazeAnchor.esproj` at 17:51 IST. The scene hierarchy showed the tracked camera, room, GazeAnchor controls and bound LeafIndex. TypeScript Status showed successful compilation. Preview started Fixed at **1/3**, and its fresh Lens log registered all twelve LEAF scenario IDs. A follow-up run exercised the final saved project.

### Final regression and visual proof

- The cold session exposed a second-page switch selection that inherited the 450 ms command cooldown. Menu navigation now skips command cooldown, and the test leaves a short released interval between successive presses of the same switch. A trial test also replaced its fixed post-aim delay with a deadline that waits for the action to close.
- A synthetic interaction tool call automatically reinstalled the newer AI Preview interaction helper and briefly reproduced the package import errors. The helper was isolated again. A subsequent comparison found an older compiler-cache copy of two edited script assets. Rewriting the authored files triggered normal synchronization. The current source and imported copies were compared before retesting.
- Review of the recording showed the original text-glyph arrow was not visibly rendered during its enabled window. A camera-relative mesh replaced the glyph, and T12 was rerun with enough hold time to inspect the cue. At 18:05:56 IST, the rendered arrow was visible to the right and then cleared on return. [Off-view arrow frame](evidence/off-view-cue.png)
- The final serial run on the checked sources passed **T01 through T12**. T08 completed Water, Temperature and Assistance with explicit acknowledgment. T09 proved Reposition failure, reconnect, explicit retry and reset. T11 measured fan rotation at **11.88 rad/s High**, **3.93 rad/s Low**, and stationary Off. The benchmark and test logs provide the run data. [Final Lens log excerpts](evidence/preview-results.txt)
- The local demonstration is a 1920 × 1080 H.264 MP4, 2:55, with captions and local synthesized narration. It uses excerpts of the actual SPECS 27 Interactive Preview, including the final mesh cue. Timing overlays cite observed benchmark values. Device audio remains unverified.
