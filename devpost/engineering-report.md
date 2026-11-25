# GazeAnchor engineering report

## A. Executive summary

GazeAnchor is a working SPECS Preview Lens for room control and local simulated comfort requests. The guided sweep measured asymmetric yaw and pitch limits. In the same profile, Fixed showed **1/3 reachable** and Adaptive showed **3/3 reachable**. The lamp stayed at its source while the fan and care controls moved to distinct tethered proxies. The final regression recorded **12 of 12 LEAF passes** and **11 of 11 standalone passes**. The 2:55 local demonstration uses recorded Preview footage.

## B. Environment and recovery

The active and saved project is `GazeAnchor.esproj`, targeting Spectacles on Lens Studio **5.23.2.26081320**. Project-root Codex connected to the registered Lens Studio MCP. The editor ran SPECS 27 in Interactive mode and compiled successfully. The approved Devpost planning brief and skill sources are included. The current CLAD router targets a newer baseline, so the project uses the verified 5.22-compatible workflow and installed 5.23.2 APIs.

The initial synchronization timeout had no conclusive root cause. Subsequent logs isolated the stale GazeAnchor counter reference and incompatible Preview and LEAF package imports. The unsupported helper and LEAF 4.0.0 were backed up and isolated. Legacy Leaf 2.0.0 compiled with the existing Spectacles Interaction Kit 2.0.0 and registered the twelve scenarios. A normal save, close and reopen reproduced the Fixed baseline and the scenario list. [Detailed recovery and retest record](build-verification.md)

## C. Architecture

The authored scene binds the tracked camera, room controls, native materials and audio. `Reach.ts` solves deterministic placements in the seated neutral frame. `GazeAnchorMain.ts` owns calibration, dwell, tethers, simulated devices, the switch scan, the operator UI, cue presentation and benchmark lifecycle. `GazeAnchorUI.ts` constructs UI Kit elements. `CaregiverCommBridge.ts` owns delivery, retry, acknowledgment and completion transitions. A separate scene-bound `LeafIndex` registers tests against the production interaction path.

## D. Files delivered

| Files | Role and verification |
| --- | --- |
| `GazeAnchor.esproj`, `Assets/Scene.scene` | GazeAnchor Lens metadata, Spectacles target, authored room and script bindings. Saved and reopened in Lens Studio. |
| `Assets/Scripts/GazeAnchorMain.ts`, `Assets/Scripts/Reach.ts` | Placement, calibration, dwell, switch, devices, cue, and benchmarks. Compiled and exercised in Preview and LEAF. |
| `Assets/Scripts/GazeAnchorUI.ts`, `Assets/Scripts/room/CaregiverCommBridge.ts` | SIK/UI Kit controls and the simulated caregiver state machine. Exercised in Preview and tests. |
| `Assets/Scripts/tests/`, `tests/` | Twelve registered Preview scenarios and eleven standalone cases. |
| `Packages/Leaf.lspkg` and its metadata | Legacy Leaf 2.0.0 runner dependency. Verified with the existing editor and SIK. |
| `README.md`, `devpost/` | Run instructions, approved brief, recovery record, requirement matrix, test and benchmark reports, evidence and submission outline. |
| `Delivery/GazeAnchor-demo.mp4` in the parent workspace | Local H.264/AAC demo, 1920 × 1080, under three minutes. Outside the Lens repository. |

## E. Scene

The authored roots include `Camera Object` with World DeviceTracking, `Lighting`, `SpectaclesInteractionKit`, `GazeAnchor Rehabilitation Room`, `GazeAnchor Controls`, the inspection helper, `LeafIndex`, and the legacy LEAF bridge. `GazeAnchor Controls` binds the camera, furnished room, Lamp/Fan/Care object anchors, Fan rotor, Lamp shade, two shade materials, cube mesh, cyan material and acknowledgment audio. The Lens creates the UI, target markers, proxy tethers, focus ring and three-stroke arrow at startup. [Scene file](../Assets/Scene.scene)

## F. Requirements

FR-01–22 and NFR-01–07 are mapped individually to implementation, components, evidence, and remaining limitations. [Requirement traceability](requirement-traceability.md)

## G. LEAF results

T01–T12 registered and passed on the final serial run. The report lists the exact scenario method, expected behavior, observation, and evidence for each ID. [Testing report](testing-report.md) · [Lens-side pass records](evidence/preview-results.txt)

## H. Measured benchmark

| Metric | Fixed | Adaptive |
| --- | ---: | ---: |
| Reachable targets | 1/3 | 3/3 |
| Completed tasks | 1/3 | 3/3 |
| Camera travel | 48.94° | 77.28° |
| Elapsed trial time | 4.69 s | 7.48 s |
| Task completion time | Incomplete | 7.48 s |
| Successful selections | 1 | 3 |
| Accidental aborts | 0 | 0 |
| Duplicate commands observed | 0 | 0 |

The runs used synthetic camera poses and the same illustrative restricted envelope in Lens Studio Interactive Preview. They completed different numbers of tasks. [Protocol and source values](benchmark-results.md)

## I. Defects and retests

The compiler error was corrected by reading the successful selection count. Package isolation and a version-matched LEAF install restored compilation and native tests. An unexpected helper auto-install reproduced the original import errors during a test attempt and was isolated again. Source comparison identified a stale editor import before the final test. Menu navigation was removed from the command cooldown and the repeated SIK press test now gives each press a release interval. Benchmark assertions wait for the observed action outcome. The off-view decision uses the tracked pose update, and the rendered cue uses a mesh after the text glyph failed visual inspection. [Recovery chronology](build-verification.md)

## J. Logic proven and feel unproven

**Logic proven in Preview.** Guided calibration, preset reachability, tether alignment, dwell, switch scan, offline recovery, explicit acknowledgment, cue direction and return clearance, device state changes, tracking interruption, resets, and the benchmark were observed in native Preview, LEAF, or both. The solver and bridge have standalone regression coverage.

**Feel unproven.** Physical Specs ergonomics, display comfort, sustained use, involuntary movement under real wear, physical switch hardware, clinical effectiveness, paired appliances and remote caregiver delivery require separate evaluation. Speaker audibility and runtime frame-time profiling remain open.

## K. Git and submission

The Lens project and evidence are committed on the existing local `main` branch. The project snapshot is `f705476` (`Restore and verify the GazeAnchor Lens`). No Git remote is configured. The approved brief, short description, submission checklist and local demonstration are ready for team review. Reviewer repository access, public YouTube upload and Devpost submission require the team's account access and authorization. [Submission checklist](submission-checklist.md)

## L. Decisions and remaining deviations

- Direct anchors use the full measured envelope. The 85% inset applies to proxies. This preserves the approved lamp behavior at approximately −10.3° yaw. Moderate directly reaches Lamp and Care beacon at 2/3.
- The recovered controller keeps related runtime behavior together. The proposed per-feature file tree was consolidated into the existing controller, placement and UI files plus a separate caregiver bridge.
- Action menus close after 1.2 seconds away from choices. The plan specified 500 ms past an 18° boundary. Trial progress appears in benchmark results and logs. The approved brief also proposed a task progress label at the active room control.
- Preview uses the existing stylized furnished room. The formal 90% idle occupancy target and the narrowest expanded-menu legibility remain unmeasured. When no safely spaced placement exists, ASAE reports the computed reachable count and leaves recalibration available.
- The video uses local synthesized narration and recorded Preview excerpts. Audio recording and hardware playback were outside the verified scope.

## M. Readiness verdict

**Ready for demo recording.** The primary and regression workflows ran in the saved, recovered project, and a local demo is available. Submission awaits repository hosting, YouTube publication and the authorized Devpost entry.
