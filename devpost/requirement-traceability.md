# GazeAnchor requirement traceability

This matrix follows FR-01–22 and NFR-01–07 in the workspace's adjacent `Planning/requirement.md`. Verification covers Lens Studio 5.23.2, SPECS 27 Interactive Preview, and standalone tests. The [build verification log](build-verification.md) records Preview observations and recovery.

**Implementation references**

- **Controller** — [GazeAnchorMain.ts](../Assets/Scripts/GazeAnchorMain.ts), attached to `GazeAnchor Controls`
- **Placement** — [Reach.ts](../Assets/Scripts/Reach.ts) and [standalone reachability tests](../tests/reach.test.mjs)
- **UI** — [GazeAnchorUI.ts](../Assets/Scripts/GazeAnchorUI.ts), which constructs Spectacles UI Kit controls and text at runtime
- **Bridge** — [CaregiverCommBridge.ts](../Assets/Scripts/room/CaregiverCommBridge.ts) and [standalone caregiver tests](../tests/caregiver.test.mjs)
- **Scene** — [Scene.scene](../Assets/Scene.scene), which holds the authored room, camera, and controller inputs
- **LEAF** — [registered scenarios](../Assets/Scripts/tests/LeafIndex.ts), run through Leaf 2.0.0 in Interactive Preview

## Functional requirements

| ID | Requirement | Implementation and scene | Evidence and remaining scope |
| --- | --- | --- | --- |
| FR-01 | Guided four-direction calibration | Controller and UI. `Guided sweep`, `Capture / Next`, `Calibration prompt`, `Camera Object`. | **Preview and LEAF verified** with a captured asymmetric sweep of −12°/+11° yaw and −7°/+8° pitch (T01). |
| FR-02 | Jitter estimation during steady hold | Controller steady step and camera pose sampling. | **Preview partially verified.** A 2.2-second neutral hold completed calibration. The estimator uses successive-frame angular differences. T04 established jitter tolerance. Quantitative estimator accuracy remains unmeasured. |
| FR-03 | Restricted, Moderate and Wide presets | Controller and UI. `Next profile` and `Calibration prompt`. | **Preview verified** for all three profile selections and fixed counts of 1/3, 2/3 and 3/3. T05 separately verified configurable timing. |
| FR-04 | Fixed and Adaptive comparison | Controller and Placement. `Fixed / Adaptive`, `Reachability`. | **Preview and LEAF verified** for restricted 1/3 → 3/3 → 1/3 via T11. |
| FR-05 | Evaluate reachable controls | Placement and Controller. `Lamp marker`, `Fan marker`, `Care beacon marker`. | **Standalone and Preview verified** for the restricted baseline, asymmetric bounds and adaptive count. Standalone infeasible case returns 0/3. T01/T02/T11. |
| FR-06 | Keep reachable markers on their object | Placement, Controller and Scene. `Lamp marker` and `Lamp object anchor`. | **Preview and LEAF verified** for the lamp in T02. Direct anchors use the full measured envelope. The restricted lamp sits near −10.3° yaw. |
| FR-07 | Place tethered proxies within the safe envelope | Placement and Controller. Fan/care markers and tethers. | **LEAF verified** for the restricted profile in T02, including clamp, 103 cm depth and tether endpoints. Live asymmetric Preview also relocated both markers. The 85% inset applies to proxies. |
| FR-08 | Separate proxies and resolve competing targets | Placement and Controller. Fan/care proxies, dwell focus. | **LEAF verified.** T02 measured proxy spacing and T06 verified nearest-angle selection with both test assignments. Standalone tests check repeatability and asymmetric separation. |
| FR-09 | Detect head-pointing entry | Controller. `Camera Object` and runtime markers. | **Preview and LEAF verified** via T03/T06. Targeting uses camera-forward vectors. The implemented cone spans 2.45°–4.2°. |
| FR-10 | Smooth head direction with EMA | Controller gaze update and steady samples. | **LEAF verified** that ±1.5° synthetic jitter allowed one successful command (T04). Real movement characteristics remain unverified. |
| FR-11 | Configurable dwell timing | Controller. `GazeAnchorMain.dwellSeconds` and preset timing. | **LEAF verified.** A 700 ms hold opened the 600 ms configuration only (T05). Base thresholds are clamped to 500–1,400 ms. |
| FR-12 | Dwell ring and sparse action choices | Controller and UI. `Dwell segment`, `Focused actions`. | **Preview and LEAF verified** for ring feedback, calibration-bound action positions, and device selections (T03/T05/T07/T11). Legibility across very small envelopes remains unverified. |
| FR-13 | Cancel incomplete dwell or actions | Controller. Dwell focus, `Focused actions`, `Cancel` and `Exit`. | **LEAF verified** that departing before full dwell clears progress without a command (T03/T07). The implemented menu closes after 1.2 seconds away from choices. |
| FR-14 | Cooldown and duplicate command prevention | Controller. Menu generation, 450 ms cooldown and gaze release gate. Bridge rejects a second request while one is active. | **Standalone and LEAF verified.** Caregiver duplicate requests are rejected. T04 verified a single appliance action under jitter and sustained gaze. |
| FR-15 | Single-switch fallback | Controller and UI. `Switch select` and `Switch focus`. | **LEAF verified** for production SIK scanning and selection in T08/T09/T12. Physical switch integration remains unverified. |
| FR-16 | Simulated lamp and fan commands | Scene and Controller. `Lamp shade`, `Lamp illumination`, `Fan rotor`, `Fan state`. | **Preview and LEAF verified** for Lamp On, Dim and Off, and measured Fan High and Low plus stationary Off (T04/T11). Appliance-chime audibility remains open. |
| FR-17 | Simulated caregiver lifecycle and recovery | Bridge, Controller and UI. `Care beacon marker`, `Caregiver simulation`, `Request timestamp`, `Online / Offline`, `Complete`. | **Standalone and LEAF verified** across all four categories. T08 completed Water, Temperature and Assistance. T09 verified Reposition offline failure, reconnect, retry, and reset. |
| FR-18 | Require explicit acknowledgment | Bridge and Controller. `Acknowledge` and care caption. | **LEAF verified** in T08. Water remained Delivered over 10 seconds before an operator triggered acknowledgment. T09 also verified a failed request rejects acknowledgment. |
| FR-19 | Off-view acknowledgment cue | Controller. `Ack direction` mesh, Care beacon marker and spatial audio. | **Preview and LEAF verified** for cue direction, return clearance and a single chime request in T12. Sound audibility remains unverified. |
| FR-20 | Record comparable Preview metrics | Controller and UI. `Benchmark`, `Reachability`, `Trial metrics`. | **LEAF verified.** T11 logged reach, travel, elapsed time and actions for both trial attempts. The fixed trial was incomplete. [Benchmark results](benchmark-results.md) |
| FR-21 | Recover after interrupted tracking | Controller and Scene. `Camera Object` DeviceTracking and input reset. | **LEAF verified.** T10 disabled native tracking during partial dwell and confirmed fresh reacquisition after recovery. Physical tracking remains unverified. |
| FR-22 | Reset calibration and demo | Controller and UI. `Reset Calibration`, `Reset Demo`. | **Preview and LEAF verified** for Demo reset after completed tasks, active fan motion and an outstanding delivery (T09/T11). Dedicated Reset Calibration during each active state remains open. |

## Non-functional requirements

| ID | Requirement | Implementation and scene | Evidence and remaining scope |
| --- | --- | --- | --- |
| NFR-01 | Additive-display legibility | UI, Controller and Scene materials. Text, dwell ring, tethers and cue. | **Preview partially verified** for visible room, HUD, markers and tethers. Text and cue readability on physical Specs remains unverified. |
| NFR-02 | Clear view at rest | Placement and Controller. Perimeter marker positions and toggleable `Benchmark` and `Caregiver simulation`. | **Partially verified.** T02 checked proxy centers clear of ±4.5° yaw. Central FOV occupancy and the 90% criterion have not been measured. |
| NFR-03 | Centimeter scale | Scene and Placement. Seated origin, object anchors and 103 cm proxies. | **LEAF verified** for proxy depth and minimum 12 cm separation in T02. Real-room fit and device comfort are unverified. |
| NFR-04 | Deterministic critical path | Controller, Placement and Bridge. | **Source reviewed.** Local calculations and state transitions drive calibration, input and commands. Standalone regressions and LEAF checks support the exercised paths. |
| NFR-05 | Identify simulations | UI, Controller and approved brief. `Simulated caregiver bridge`, `Sim online` and `Sim offline`. | **LEAF verified** for caregiver simulation labels and state in T08/T09. Fan and lamp are virtual room objects. Their wearer-facing labels omit an explicit simulation tag. |
| NFR-06 | Protect privacy | Scene and Controller. Camera pose supplies head direction. | **Source reviewed.** GazeAnchor application logic has no video recording, biometric recognition or bystander tracking. |
| NFR-07 | Preview performance | Controller's frame update and precreated markers, tethers and ring segments. | **Unmeasured.** Preview scenarios ran successfully, with no profiled frame-rate or allocation result. Dwell still creates temporary arrays and vectors. |

## LEAF evidence scope

The Lens-side `DefaultLeafScenarioManager` recorded **12 passes** in the final serial run. The observations above are limited to the assertions exercised. [Testing report](testing-report.md) · [Final Lens log excerpts](evidence/preview-results.txt)
