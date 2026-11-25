# GazeAnchor — Product Requirements Document (`prd.md`)

> *"A world that adapts to you."*\
> **Product:** GazeAnchor with **ASAE (Adaptive Spatial Accessibility Engine)**\
> **Hackathon:** Learn AR with SPECS (Round 2) — Deadline **December 7, 2026 (5:00 PM EST)**

---

## 1. Product Vision & Strategic Positioning

Traditional smart-home apps, bedside tablets, and even conventional AR interfaces share a hidden **ability assumption**: they assume the user can tap small targets, speak clearly, or turn their head freely across a wide room.

**GazeAnchor** shifts the paradigm from *"adapt the patient to the interface"* to *"adapt the spatial environment to the wearer."* Powered by the **Adaptive Spatial Accessibility Engine (ASAE)**, the system calibrates to a user's comfortable head-movement envelope, evaluates which targets fall within it, automatically pulls unreachable targets into tethered cone-rim proxies, and pairs adaptive dwell filtering with closed-loop caregiver comfort communication.

Smart-home room control and caregiver comfort pings serve as the **concrete, human-centered proof** of ASAE's spatial adaptability.

---

## 2. Target Users & Illustrative Mobility Profiles

### Primary User Segments (Exploratory Prototype Scope)
- Seated individuals with upper-limb motor impairment and weak/absent speech (e.g., mid-to-high spinal cord injury, progressive neuromuscular conditions, post-stroke hemiplegia with dysarthria) in **home care or step-down rehabilitation**. The Lens explores how someone can make everyday choices and request comfort independently, even when reaching for a control or speaking is difficult.
- **Explicit Exclusion:** Supine, heavily sedated, or ventilated ICU patients (rigid `132–136 g` glasses and emergency UL-1069 life-safety alarms are inappropriate for acute ICU).

### Secondary Stakeholder
- **Family Caregivers / Rehab Attendants:** Receive clear, categorized non-emergency comfort requests (`Water`, `Reposition`, `Temp`, `Assist`) with explicit delivery and acknowledgment tracking.

### Illustrative Calibration Profiles (Engineering Simulation Configs)
*Note: These profiles are engineering test configurations demonstrating ASAE adaptability—not clinically validated medical prescriptions.*

| Profile | Yaw Range | Pitch Range | Dwell Time | EMA Smoothing | Resulting Spatial Layout |
|---|---|---|---|---|---|
| **Profile A — Wide (`45°`)** | `±45°` | `±25°` | `650 ms` | Light (`α = 0.35`) | All room targets stay anchored directly on the corresponding room objects (`Lamp`, `Fan`, `CareBeacon`). |
| **Profile B — Moderate (`25°`)** | `±25°` | `±15°` | `800 ms` | Medium (`α = 0.22`) | Peripheral appliances cross the comfort boundary and pull inward as tethered rim proxies. |
| **Profile C — Severe (`12°`)** | `±12°` | `±8°` | `950 ms` | Strong (`α = 0.14`) | Out-of-range objects automatically reposition to tethered rim beacons near the `12°` edge, inside the proxy inset (`1/3` → `3/3` reachable) without blocking center view. |

---

## 3. Core User Journeys

### Journey 1: The Calibration & "World Adapts to You" Breakthrough
1. User enters the furnished virtual bedroom/rehab room (`Lamp` at `-10°`, `Fan` at `+34°`, `CareBeacon` at `+22°`).
2. In **`FIXED_AR` mode** under `Profile C (12°)`, the user can comfortably reach **only 1 of 3** targets (`Lamp`); `Fan` and `CareBeacon` sit beyond their measured comfortable range (`Reachable: 1/3`).
3. User runs **ASAE Calibration** (or activates `Profile C` calibration): ASAE measures the `±12°` envelope and `σ_deg` stability.
4. **ASAE Solves Reachability:** `Lamp` stays on the lamp; `Fan` and `CareBeacon` smoothly spawn **tethered rim proxies** inside the `12°` comfort boundary (`Reachable: 3/3`), with thin glowing threads connecting each proxy to its real appliance so spatial awareness remains intact.

### Journey 2: Zero-Hand, Zero-Speech Environmental Control
1. User rests their head-gaze on the `Fan` proxy for `950 ms` (smoothed against head jitter).
2. A quiet radial cyan progress ring fills; if they glance away early, it cancels cleanly (**zero accidental activation**).
3. On dwell completion, a clean 3-button halo (`Low` | `High` | `Off`) blooms around the proxy. User dwells (or triggers the accessible binary switch) on `High` → virtual fan blades spin faster + spatial audio cue plays + `400 ms` cooldown prevents double-triggers → halo collapses back to a calm indicator.

### Journey 3: Closed-Loop Caregiver Comfort Request
1. User dwells on `CareBeacon` proxy and selects `Water`.
2. State transitions `IDLE → PENDING → DELIVERED` (or `DELIVERY_FAILED` if companion bridge is toggled offline).
3. On the **Operator / Caregiver Panel** labeled as a simulation, the request appears with timestamp and category.
4. Caregiver explicitly clicks **`Acknowledge ("On My Way")`** → state transitions to `ACKNOWLEDGED`. If the user is looking away toward the window, an **off-view chime + subtle edge arrow** guides them back to the confirmation badge, then caregiver/user marks `COMPLETED`.

---

## 4. Judging Alignment (`Learn AR with SPECS`)

| Official Pillar | How GazeAnchor Maximizes Score |
|---|---|
| **Design** | Strictly follows `ar-design-rules.md`: world-anchored objects, tethered rim proxies (never blocking center FOV), luminous additive colors, minimal clutter when idle, off-view chime + arrow. |
| **Technical Implementation** | Uses Lens Studio `5.23.2`, `SIK`, `UI Kit`, Snap CLAD + Lens Studio MCP, deterministic ASAE reachability solver, EMA jitter filter, and recorded acceptance evidence from the available test tools. |
| **Innovation & Idea** | Moves beyond generic smart-home AR by building **ASAE**—live personalized mobility calibration + tethered out-of-range proxies + Fixed-vs-Adaptive telemetry benchmarking. |
| **Presentation (`<3 min` Video)** | Unforgettable 20-second visual contrast: `Fixed AR` fails (`1/3 reachable`) → `ASAE Calibration` unlocks `3/3 reachable` live → closed-loop caregiver ack → measured Preview results and verified test results. |

---

## 5. Success Metrics (Measured Only in Preview — Never Fabricated)

- **Reachability Improvement:** `1/3` (`33%`) in `FIXED_AR` → `3/3` (`100%`) in `ASAE_ADAPTIVE` under `Profile C (12°)`.
- **Measured Camera Rotation Reduction:** Record angular travel and completed tasks per attempt in both modes. Mark unreachable Fixed tasks as incomplete.
- **False-Trigger Rate:** `0` accidental activations during rapid `<500 ms` glances and simulated `±1.5°` head jitter.
- **Acceptance Verification:** Capture results with deterministic tests, integrated Preview checks, and LEAF when the toolchain supports it.

---

## 6. Risk Matrix & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Proxies look like a floating 2D menu under `10°–12°` profile** | Medium | High | Place proxies along the **cone rim** (`85%` boundary), keep center `±4°` empty, and draw crisp 3D luminous tethers to physical appliances. |
| **Scope creep in 12-day window (WebSockets / ESP32)** | High | High | Lock P0 to Preview + manual Operator Panel + LEAF tests first; Resolve calibration and proxy integration first, then add polish and capture evidence. |
| **Preview mouse-look differs from real neck movement** | Certain | Medium | Explicitly disclose mouse simulation in video/README; mark physical fatigue & comfort *"feel unproven."* |
| **Bridge disconnect / failed delivery** | Low | Medium | Explicit `DELIVERY_FAILED` state + retry button; never fake success. |
