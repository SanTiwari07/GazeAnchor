# GazeAnchor — System & Hackathon Requirements (`requirement.md`)

**Project:** GazeAnchor — Adaptive Spatial Accessibility Engine (ASAE)\
**Target Environment:** Lens Studio `5.23.2` (`targetPlatform: Spectacles`) + `SpectaclesInteractionKit` + `SpectaclesUIKit`\
**Verified APIs (`Support/StudioLib.d.ts`):** `Camera`, `Transform`, `ScriptComponent`, `UpdateEvent`, `RenderMeshVisual`, `AudioComponent`, `Text`, `Text3D`, `TouchStartEvent`, `rayCast`. *(Note: `KeyEvent`/`KeyDownEvent` are NOT in `StudioLib.d.ts`; use SIK `Interactable` / UI Kit buttons for all discrete triggers for Preview input and compatible LEAF runs.)*

---

## 1. Functional Requirements (FR)

### A. Personal Mobility Calibration (`MobilityCalibrator`)
- **FR-01 (Guided 4-Point Calibration):** Provide a calibration mode that samples the user's comfortable head movement bounds (`yawMin`, `yawMax`, `pitchMin`, `pitchMax` in degrees relative to neutral forward) via a brief guided sweep without forcing extreme neck strain.
- **FR-02 (Tremor / Jitter Estimation):** Sample camera forward angular variance during a 2-second steady-hold window (`sigmaDeg`) to parameterize jitter smoothing.
- **FR-03 (Illustrative Profile Presets for Reproducible Demo & Testing):** Support one-click switching between three calibrated profiles in Preview:
  - `PROFILE_WIDE` (`±45°` yaw, `±25°` pitch, `dwellMs: 650`)
  - `PROFILE_MODERATE` (`±25°` yaw, `±15°` pitch, `dwellMs: 800`)
  - `PROFILE_RESTRICTED` (`±12°` yaw, `±8°` pitch, `dwellMs: 950`)
- **FR-04 (Baseline Comparison Mode):** Provide a toggle between **`FIXED_AR`** (legacy fixed world anchors on physical appliances, no proxies) and **`ASAE_ADAPTIVE`** (calibrated reachability + proxies + EMA smoothing) for live side-by-side benchmarking.

### B. Adaptive Spatial Accessibility Engine (`ASAEPlacementSolver`)
- **FR-05 (Reachability Evaluation):** Every registered room target (`Lamp`, `Fan`, `CareBeacon`) must be continuously or on-calibration evaluated against the active mobility envelope `[yawMin..yawMax, pitchMin..pitchMax]`.
- **FR-06 (On-Object Anchoring When Reachable):** If a target lies inside the measured calibrated envelope, its minimal interaction dot remains anchored directly on the corresponding room object (`0.9 m – 1.4 m` comfort depth).
- **FR-07 (Automatic Tethered Spatial Proxy When Out-of-Range):** If a target lies *outside* the calibrated envelope, ASAE must automatically spawn a **Spatial Proxy** clamped inside `85%` of the calibrated cone boundary (rim placement, keeping the center `±4°` sightline unobstructed) and draw a visible, thin luminous tether line connecting the proxy to the source room object.
- **FR-08 (Non-Overlap & Deterministic Resolution):** Multiple proxies spawned on the same cone edge must separate cleanly (minimum `12 cm` center-to-center spacing at `1.0 m` depth) and resolve overlapping target rays deterministically by smallest angular distance (`dot` product priority).

### C. Adaptive Dwell & Accessible Fallback (`AdaptiveDwellEngine`)
- **FR-09 (Head-Gaze Cone Raycasting):** Track camera forward direction every frame and detect target entry within an adaptive hit cone (`2.5°–5.0°`, scaled with `sigmaDeg`).
- **FR-10 (EMA Jitter Smoothing):** Apply Exponential Moving Average filtering (`alpha` derived from `sigmaDeg`) to gaze direction so involuntary micro-tremors do not break a valid dwell.
- **FR-11 (Configurable Dwell Timing):** Dwell activation duration (`dwellMs`) must be configurable (`500 ms` – `1400 ms`), never hardcoded globally to `800 ms`.
- **FR-12 (Visual Progress & Sub-Action Halo):** Resting inside a target fills a thin luminous radial ring (`0 → 100%`). On completion, expand **2–3 large UI Kit action targets** (`≥ 8 cm` wide at `1 m`) around the anchor/proxy—never a dense menu grid.
- **FR-13 (Glance-Abort & Cancel):** Exiting the target cone before `100%` immediately resets progress to `0` (`IDLE`) with zero command emission. Leaving an open halo (`>18°` away for `500 ms` or selecting `Cancel`) closes it cleanly.
- **FR-14 (Cooldown & Duplicate Prevention):** After any command executes, lock that target in `COOLDOWN` (`400 ms`+) so head wobble cannot double-toggle a device.
- **FR-15 (Accessible Non-Pinch Fallback):** Provide a persistent, reachable **SIK `Interactable` "Switch / Select"** control (simulating a single external accessibility binary switch in Preview and enabling LEAF assertions) alongside dwell—do **not** require hand-pinching gestures as the primary fallback.

### D. Closed-Loop Room & Caregiver Experience (`DeterministicCommandEngine`, `RoomDeviceController`, `CaregiverCommBridge`)
- **FR-16 (Room Appliance Control):** Support deterministic state changes on at least two virtual room objects at real cm scale:
  - **Lamp** (`On` / `Dim` / `Off` — drives 3D point light & emissive shade + spatial audio chime)
  - **Fan** (`Low` / `High` / `Off` — drives fan blade angular velocity + subtle chime)
- **FR-17 (Two-Way Closed-Loop Caregiver Comfort Communication):** Support non-emergency comfort requests (`Water`, `Reposition`, `Temperature`, `Assistance`) with an explicit simulated lifecycle:
  - `IDLE` → `PENDING` → `DELIVERED` → `ACKNOWLEDGED` → `COMPLETED` (and `DELIVERY_FAILED` on simulated disconnect).
- **FR-18 (Zero Fake Auto-Acknowledgment):** Comfort requests must remain `PENDING` or `DELIVERED` indefinitely until explicitly acknowledged by an operator/companion input from the labeled `Operator Ack` control. Never auto-ack on a timer.
- **FR-19 (Off-View Spatial Notification):** When `ACKNOWLEDGED` arrives while the active acknowledgment anchor is outside the current camera FOV, play a spatial chime and show a small directional edge arrow (`OffViewIndicator`) guiding gaze back to the confirmation badge at the active anchor.

### E. Live Benchmarking & Fault Recovery (`AccessibilityBenchmark`)
- **FR-20 (Measured Telemetry Logging):** Track and display real measured Preview metrics comparing `FIXED_AR` vs `ASAE_ADAPTIVE`:
  - `reachableTargetsCount` (e.g., `1/3` vs `3/3`)
  - `cumulativeHeadRotationDeg` (integrated frame-to-frame camera angle delta)
  - `taskCompletionTimeSec`, `successfulSelections`, `accidentalAborts`
- **FR-21 (Tracking Interruption Recovery):** If raycast/tracking updates pause or return invalid frames, freeze dwell safely without triggering commands and resume cleanly when valid tracking returns.

- **FR-22 (Reset):** Reset Calibration clears measured bounds and returns to fixed placements. Reset Demo restores baseline appliance and caregiver state, dwell, cues, and telemetry in the same Preview session.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-01 (Additive Waveguide Legibility):** On SPECS additive displays, black renders transparent. All UI strokes, rings, tethers, and text must use high-luminance colors (`#F8FAFC` white, `#38BDF8` cyan, `#F59E0B` amber, `#34D399` mint) with subtle dark translucent backing scrims where needed.
- **NFR-02 (Anti-HUD Calm Aesthetics):** In `IDLE`, at least `90%+` of the central FOV must remain completely unobstructed. Benchmark/Operator debug panels must stay peripheral or toggleable—never blocking the room scene during user control.
- **NFR-03 (Real-World Scale):** Room scene and UI targets must use true **centimeter** scale (`0.9 m – 1.4 m` interaction distance).
- **NFR-04 (Deterministic Critical Path):** Zero LLM / generative AI calls inside targeting, dwell, calibration, or command execution.
- **NFR-05 (Honest Simulation Disclosure):** Any simulated companion/IoT endpoint must be visibly labeled `[SIMULATED PREVIEW BRIDGE]` or `[OPERATOR PANEL]`.
- **NFR-06 (Privacy Compliance):** Zero video recording, face recognition, or bystander tracking.
- **NFR-07 (Performance):** Maintain smooth frame rate in Lens Studio Preview with minimal allocations inside `UpdateEvent`.

---

## 3. Explicit Non-Goals (Out of Scope for v1)

1. Replacing hardwired **UL 1069** hospital ICU emergency nurse-call systems.
2. Webcam pupil/iris eye-tracking (unavailable in SPECS Preview).
3. Floating "Jarvis" multi-widget dashboards or AI chatbots.
4. Mandatory voice commands (`ASRModule` is omitted from P0 MVP to guarantee Preview reliability).
5. Automated motorized hospital bed movement.
6. Multi-room SLAM / persistent anchors across restarts (`preview-limits.md` prohibits from Done Criteria).
7. Unverified regulatory claims (do not claim FDA clearance/exemption without legal review) or fabricated clinical fatigue percentages.

## Extremely narrow calibrated ranges

When all three independent controls cannot fit, maximize safe independent placements within the signed calibrated envelope, preserve separation and the central sightline, and keep any safely placed controls actionable. Report the computed 0/3–3/3 count and explain any shortfall in accessible text. Offer optional recalibration within comfortable limits. Sequential selection across room controls is a future enhancement with a separate accessibility measure. The existing simulated switch for the currently highlighted control or action remains in scope.
