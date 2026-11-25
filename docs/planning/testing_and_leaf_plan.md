# GazeAnchor — LEAF Automated Testing & Benchmark Plan (`testing_and_leaf_plan.md`)

**Test Suite Target:** `Assets/Scripts/tests/LeafIndex.ts`\
**Framework:** Snap LEAF (Lens Evaluation & Automation Framework) inside Lens Studio Preview + deterministic TypeScript state assertions.

---

## 1. Planned verification scenarios

Run what the available environment supports and record the method and result in the evidence matrix. Synthetic inputs verify logic independently of the Lens Studio scene.

| ID | Test Scenario | Setup / Simulated Input | Expected State & Assertion |
|---|---|---|---|
| **T01** | **Calibration restricts interaction range** | Run `MobilityCalibrator` with sweep bounds `[-12°, +12°]` yaw, `[-8°, +8°]` pitch. | Assert active profile matches `±12° / ±8°` (within sampling tolerance) and updates `ASAEPlacementSolver`. |
| **T02** | **Out-of-range objects receive tethered proxies** | Set `ASAE_ADAPTIVE` + `Profile C (12°)`. `Lamp` is at `-10.3°`, `Fan` at `+34.8°`. | Assert `Lamp.isProxy === false`, `Fan.isProxy === true` and `CareBeacon.isProxy === true`, each proxy yaw magnitude `<= 10.2°` (`85%` of `12°`), and both tether visuals point to their respective room objects. |
| **T03** | **Quick glances do not trigger commands** | Aim camera cone at `Lamp` for `450 ms` (when `dwellMs = 950 ms`), then rotate away `20°`. | Assert `DwellState === IDLE`, `Lamp.state === OFF`, and `commandCount === 0`. |
| **T04** | **Unstable head movement prevents duplicate triggers** | Enable `±1.5°` sinusoidal jitter during dwell; complete selection on `Lamp`, then keep cone on `Lamp` for `250 ms` inside `450 ms` cooldown. | Assert `Lamp` toggles **exactly once** (`blockedByCooldownCount >= 1`). |
| **T05** | **Dwell timing is personalized & configurable** | Configure `dwellMs = 600` then `dwellMs = 1200`. Hold steady gaze for `700 ms` in both runs. | Assert `600 ms` config opens `HALO_OPEN` (`700 >= 600`), while `1200 ms` config remains `DWELLING` (`700 < 1200`). |
| **T06** | **Overlapping targets resolve deterministically** | Place two test targets `2°` apart along forward ray (`TargetA` at `0.5°`, `TargetB` at `2.1°`). | Assert `AdaptiveDwellEngine` locks strictly onto `TargetA` (minimum angular distance). |
| **T07** | **Unfinished commands can be cancelled** | Dwell to `75%` progress, then move outside `hitConeDeg * 1.25` (or click `Cancel` button). | Assert progress resets to `0`, `DwellState === IDLE`, `accidentalAborts` increments cleanly, and zero device change occurs. |
| **T08** | **Caregiver requests remain pending/delivered until explicitly acked** | Trigger `CareRequest("Water")` with `bridgeOnline = true`; advance simulation `10,000 ms` without pressing `OperatorAckButton`. | Assert `CareRequestState === DELIVERED` (never auto-advances to `ACKNOWLEDGED`). |
| **T09** | **Connection failure never fakes success** | Toggle `bridgeOnline = false`; trigger `CareRequest("Reposition")`. | Assert `CareRequestState === DELIVERY_FAILED`, error banner visible, and retry action available. |
| **T10** | **Interface recovers from tracking interruption** | Start dwell (`400 ms`), inject simulated tracking pause (`isTrackingValid = false` for `500 ms`), restore `isTrackingValid = true`. | Assert zero false activation during pause and clean dwell reset or resumption upon recovery. |
| **T11** | **Fixed vs. Adaptive benchmark runs live** | Attempt the same 3-target sequence (`Lamp`, `Fan`, `CareBeacon`) under `Profile C (12°)` in `FIXED_AR` vs `ASAE_ADAPTIVE`. | Assert `FIXED_AR` reports `reachable = 1/3`; `ASAE_ADAPTIVE` reports `reachable = 3/3` with logged `cumulativeHeadRotationDeg` for both. |
| **T12** | **SIK Switch fallback & Off-View Ack Arrow** | Use `SwitchSelectButton` (SIK `Interactable`) to send `Water`; rotate camera `35°` left; press `OperatorAckButton`. | Assert `CareRequestState === ACKNOWLEDGED` and `OffViewIndicator.isVisible === true` until camera turns back toward the active care marker. |

---

## 2. Benchmark Measurement Protocol (Anti-Fabrication Rule)

When recording the Fixed-vs-ASAE comparison for your demo video and README:
1. **Use identical intended tasks:** Attempt the same 3-step sequence (`Toggle Lamp → Set Fan High → Send Water Request`) under `Profile C (12°)`. Record tasks outside the Fixed envelope as incomplete.
2. **Record Only Measured Software Metrics:**
   - **Reachable Targets:** `1 / 3` (`FIXED_AR`) vs `3 / 3` (`ASAE_ADAPTIVE`)
   - **Measured Camera Angular Travel (`deg`):** Exact sum of frame-by-frame angle deltas printed by `AccessibilityBenchmark.ts`
   - **Measured Time (`s`) & False Triggers (`count`)**
3. **Prohibited Claims:** Never extrapolate mouse-look Preview runs into clinical claims like *"reduces patient neck fatigue by X%"* or *"improves clinical outcomes."* State clearly: *"Measured in Lens Studio Interactive Preview using simulated restricted-mobility bounds."*

## 3. Test evidence

Current installed editor baseline is Lens Studio 5.23.2. Snap's current LEAF guide requires Lens Studio 5.25+, Interaction Kit 4.0.0+, and SPECS 27 Preview. The documented LEAF panel is available with LEAF 4.0.0+. The verified project uses the legacy Leaf 2.0.0 and Spectacles Interaction Kit 2.0.0 pairing. See the [testing report](../../devpost/testing-report.md) for observed results. [Snap's LEAF guide](https://docs.lensstudio.com/build-with-ai/clad/tools/test-your-lens-with-leaf)

Record the editor build, Preview configuration, repository revision, input trace or steps, observed values, and artifact path for each run. Use one row per method when the same case runs in both a standalone harness and the integrated scene.

| ID | Scenario | Evidence to capture | Deterministic | Integrated Preview | LEAF |
|---|---|---|---|---|---|
| E01 | Restricted Fixed baseline | 1/3 count and signed limits. Only Lamp is actionable. | Pending | Pending | Pending |
| E02 | Live calibration | Signed neutral-relative limits after a left, right, up, and down sweep. Check asymmetric input. | Pending | Pending | Pending |
| E03 | Adaptive placement | 3/3 count, Lamp retained, two distinct rim proxies, tethers to source objects, clear center. | Pending | Pending | Pending |
| E04 | Dwell safety | Brief aim and look-away, zero commands, one valid command, and cooldown recovery. | Pending | Pending | Pending |
| E05 | Fan states | Low, High, and Off produce distinct blade speeds. | Pending | Pending | Pending |
| E06 | Comfort request | Water request stays delivered until explicit acknowledgment. Verify offline failure and retry. | Pending | Pending | Pending |
| E07 | Off-view acknowledgment | One spatial chime at acknowledgment, arrow points to active care control, arrow clears on return. | Pending | Pending | Pending |
| E08 | Reset calibration | Fixed mode and no captured bounds. Repeating equivalent poses yields equivalent placements. | Pending | Pending | Pending |
| E09 | Reset demo | Same Preview session. Appliance states, request state, cues, dwell, and telemetry come back to initial values. | Pending | Pending | Pending |
| E10 | Benchmark | Observed reach count, angular travel, and completed tasks. Fixed unreachable tasks are marked incomplete. | Pending | Pending | Pending |

Save a distinct status for each method. Record failures and the retest result. Audio direction, readable placement, visible animations, and behavior of the operator controls require integrated Preview evidence. Wear comfort, physical fit, real tracking under motion, and caregiver delivery outside the local simulation require separate evaluation.

## Interview acceptance and narrow-range verification

Use the five [judge-facing Preview checks](../../devpost/design-brief.md#interview-acceptance-checks) as the acceptance walkthrough. Retain the existing reset, calibration and evidence scenarios. Add a narrow-envelope verification with asymmetric and near-neutral bounds that cannot fit three controls. Inspect the placement and count, verify the safely placed controls remain usable, and verify the explanation and optional recalibration can be reached. Never award 3/3 for serial access or unsafe placement. Track this check separately from the Restricted-profile transformation. Sequential selection across room controls is future work.
