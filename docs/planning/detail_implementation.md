# GazeAnchor — Detailed Engineering & Implementation Guide (`detail_implementation.md`)

**Target Project:** `GazeAnchor.esproj` (Lens Studio `5.23.2.26081320`, `targetPlatform: Spectacles`)\
**Installed Packages:** `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg`\
**Important API Note (Verified in `Support/StudioLib.d.ts`):**
- Use TypeScript components (`@component`) compatible with `SpectaclesInteractionKit` (`BaseScriptComponent` / `ScriptComponent`).
- **Do NOT use `KeyDownEvent` or `KeyEvent`** (not present in `StudioLib.d.ts`). All clickable triggers (Accessibility Switch fallback, Operator Ack, Profile Switcher, Fixed/ASAE Toggle) MUST use **SIK `Interactable` / `SpectaclesUIKit` buttons** so Interactive Preview mouse-clicks and **LEAF** automation tests interact reliably.
- Use `Camera`, `Transform`, `AudioComponent`, `Text` / `Text3D`, `RenderMeshVisual`, and `UpdateEvent` (`this.createEvent("UpdateEvent")`).

---

## 1. Proposed Folder & Scene Hierarchy (`Assets/`)

```text
Assets/
├── Scene.scene
├── Scripts/
│   ├── core/
│   │   ├── Types.ts                      # Shared enums, interfaces, profiles, telemetry types
│   │   ├── MobilityCalibrator.ts         # 4-point comfort sweep + jitter (sigmaDeg) + presets
│   │   ├── ASAEPlacementSolver.ts        # Reachability check + cone-rim proxy solver + tethers
│   │   ├── AdaptiveDwellEngine.ts        # EMA gaze smoothing + dwell FSM + switch fallback
│   │   ├── DeterministicCommandEngine.ts # Command validation, cooldown, duplicate guard
│   │   └── AccessibilityBenchmark.ts     # Fixed vs ASAE telemetry (degrees, reachability, time)
│   ├── room/
│   │   ├── RoomTargetAnchor.ts           # Per-object config (Lamp, Fan, CareBeacon) + 3-button halo
│   │   ├── RoomDeviceController.ts       # Drives 3D Lamp light, Fan spin, visual feedback + audio
│   │   ├── CaregiverCommBridge.ts        # Explicit local FSM and simulated operator panel
│   │   └── OffViewIndicator.ts           # Spatial chime + viewport-edge arrow on out-of-view Ack
│   └── tests/
│       └── asae_gaze_anchor.leaf.ts      # 12 LEAF automated verification scenarios
├── Materials/
│   ├── AdditiveCyan.mat                  # #38BDF8 high-luminance unlit additive material
│   ├── AdditiveAmber.mat                 # #F59E0B unlit additive material
│   ├── AdditiveMint.mat                  # #34D399 unlit additive material
│   └── ScrimDarkAlpha.mat                # Subtle dark translucent backing (alpha 0.35) for legibility
└── Audio/
    ├── chime_confirm.wav
    ├── chime_ack_offview.wav
    └── chime_error_fail.wav
```

### Scene Object Layout (Real Centimeter Scale, Seated User at `(0, 120, 0)` looking `-Z`)

| Scene Object | World Position (cm) | Approx. Angular Offset from `(0, 120, 0)` | Notes |
|---|---|---|---|
| `Camera` (SPECS Rig) | `(0, 120, 0)` | `(0°, 0°)` | Neutral seated eye height |
| `LampTarget` (`LAMP_MAIN`) | `(-20, 112, -110)` | `Yaw ≈ -10.3°, Pitch ≈ -4.1°` | Inside even `12°` profile (baseline reachable `1/3`) |
| `CareBeacon` (`CARE_BEACON`) | `(+44, 108, -105)` | `Yaw ≈ +22.7°, Pitch ≈ -6.0°` | Reachable in `45°/25°`, **out-of-range in `12°`** |
| `FanTarget` (`FAN_ROOM`) | `(+78, 114, -112)` | `Yaw ≈ +34.8°, Pitch ≈ -2.6°` | Reachable in `45°`, **out-of-range in `25° & 12°`** |
| `ComfortConeVisualizer` | Child/relative to seated neutral frame | Dynamic border | Subtle thin additive boundary ring toggled during Calibration/Demo |
| `OperatorAckPanel` *(Debug/Demo)* | `(-75, 92, -135)` | Peripheral left-low | Clearly labeled `[OPERATOR / CAREGIVER PANEL]` — manually triggers `Ack` or `Simulate Offline` |
| `BenchmarkHud` *(Toggleable)* | `(+72, 148, -135)` | Peripheral top-right | Toggleable telemetry card (`Fixed` vs `ASAE`), hidden during calm immersion shots |

---

## 2. Core Data Structures (`Scripts/core/Types.ts`)

```ts
export enum SystemMode {
  FIXED_AR = "FIXED_AR",
  ASAE_ADAPTIVE = "ASAE_ADAPTIVE",
}

export enum DwellState {
  IDLE = "IDLE",
  DWELLING = "DWELLING",
  HALO_OPEN = "HALO_OPEN",
  COOLDOWN = "COOLDOWN",
}

export enum CareRequestState {
  IDLE = "IDLE",
  PENDING = "PENDING",
  DELIVERED = "DELIVERED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  COMPLETED = "COMPLETED",
  DELIVERY_FAILED = "DELIVERY_FAILED",
}

export interface MobilityProfile {
  name: string;
  yawMinDeg: number;    // negative left (e.g. -12)
  yawMaxDeg: number;    // positive right (e.g. +12)
  pitchMinDeg: number;  // negative down (e.g. -8)
  pitchMaxDeg: number;  // positive up (e.g. +8)
  sigmaDeg: number;     // estimated head tremor std dev
  dwellMs: number;      // 500..1400 ms
  emaAlpha: number;     // 0.12..0.40
  hitConeDeg: number;   // 2.5..5.0 deg
}

export interface TargetPlacementResult {
  targetId: string;
  physicalPos: vec3;
  activePos: vec3;      // physicalPos if reachable, else rim-clamped proxyPos
  isReachableDirectly: boolean;
  isProxy: boolean;
  yawDeg: number;
  pitchDeg: number;
}
```

---

## 3. Mathematical Algorithms & Module Specifications

### A. `MobilityCalibrator.ts`
**Purpose:** Captures the user's comfortable head-movement bounds and tremor variance (`sigmaDeg`), or loads reproducible demo profiles (`45°`, `25°`, `12°`).

1. **Neutral Reference Frame:** When calibration starts, store `neutralForward` and `neutralPos` from the SPECS `Camera` transform.
2. **Angular Coordinates (`worldPos -> (yawDeg, pitchDeg)`):**
   - Let `dir = normalize(worldPos - neutralPos)`.
   - Express `dir` in neutral local basis `(right, up, forward)` (where `forward` points toward `-Z` in neutral frame):
     - `yawDeg = atan2(dot(dir, right), dot(dir, forward)) * (180 / Math.PI)`
     - `pitchDeg = asin(clamp(dot(dir, up), -1, 1)) * (180 / Math.PI)`
3. **Guided Sweep Sampling (`15s` routine):**
   - Step 1–4 (`Left`, `Right`, `Up`, `Down`): Sample peak comfortable angles (`yawMinDeg`, `yawMaxDeg`, `pitchMinDeg`, `pitchMaxDeg`), using measured signed bounds. If samples are missing or too narrow for separated placements, offer retry or a labeled demo preset. Keep the reported limits equal to what was measured.
   - Step 5 (`2s` Steady Hold): Record angular deviations `Δθ_i` between consecutive smoothed/raw samples; compute `sigmaDeg = stddev(Δθ)`.
   - Derive `emaAlpha = clamp(0.38 - 0.10 * sigmaDeg, 0.12, 0.38)` and `hitConeDeg = clamp(3.0 + 0.6 * sigmaDeg, 2.8, 5.0)`.

### B. `ASAEPlacementSolver.ts`
**Purpose:** Evaluates reachability for every room target and computes non-overlapping cone-rim proxies with luminous tethers.

1. **Direct reachability uses the measured bounds. Proxy placement uses an inward margin.**
   - `safeYawMin = profile.yawMinDeg * 0.85`, `safeYawMax = profile.yawMaxDeg * 0.85`
   - `safePitchMin = profile.pitchMinDeg * 0.85`, `safePitchMax = profile.pitchMaxDeg * 0.85`
   - Target is **directly reachable** iff:
     `yawDeg >= profile.yawMinDeg && yawDeg <= profile.yawMaxDeg && pitchDeg >= profile.pitchMinDeg && pitchDeg <= profile.pitchMaxDeg`.
   - The restricted fixture places Lamp at about −10.3° yaw. It fits its measured ±12° envelope and stays on its object. The 85% inset applies to generated proxies.
2. **Proxy Placement (`SystemMode.ASAE_ADAPTIVE` when out-of-range):**
   - Clamp `(yawDeg, pitchDeg)` onto the `85%` elliptical/rectangular comfort boundary:
     - `clampedYaw = clamp(yawDeg, safeYawMin, safeYawMax)`
     - `clampedPitch = clamp(pitchDeg, safePitchMin, safePitchMax)`
   - **Anti-Center Rule (Never block center FOV):** If both `|clampedYaw| < 4.5°` and `|clampedPitch| < 4.5°`, push outward radially along `(clampedYaw, clampedPitch)` to the rim so center sightline stays open.
   - **Collision Separation Pass:** For all spawned proxies, run 4 iterations of angular repulsion if angular distance `hypot(y1 - y2, p1 - p2) < 6.5°` (`~11.5 cm` at `1 m`), clamping back inside the inset after each pass. At an edge, try distributing candidates along the free axis. If spacing is still infeasible, expose the actual reachable count and make recalibration available.
   - Convert `(clampedYaw, clampedPitch)` at `proxyDepthCm = 105` back into 3D `proxyPos` in the neutral frame.
3. **Luminous Tether Rendering:**
   - Position a thin `0.35 cm`-diameter unlit cylinder (`AdditiveCyan.mat`, low alpha `0.45`) midway between `proxyPos` and `physicalPos`, scaled in Z/Y to `distance(proxyPos, physicalPos)` and oriented via `quat.lookAt(physicalPos - proxyPos, vec3.up())`.
   - Hide the tether when `isProxy === false` or `mode === FIXED_AR`.

### C. `AdaptiveDwellEngine.ts`
**Purpose:** Smooths head-gaze noise, runs the deterministic dwell timer, resolves overlapping rays, and wires the accessible binary switch fallback.

1. **EMA Gaze Filter (runs every `UpdateEvent`):**
   - If camera tracking reports invalid/paused frame (`dt <= 0` or `dt > 0.25` tracking jump): pause dwell timer cleanly without advancing or resetting; resume when stable.
   - Otherwise: `smoothedForward = normalize(lerp(smoothedForward, rawCamForward, profile.emaAlpha))`.
2. **Deterministic Target Resolution:**
   - For each active target collider (on-object dot in `FIXED_AR` or `activePos` in `ASAE_ADAPTIVE`):
     - Compute angle `θ = acos(clamp(dot(smoothedForward, normalize(targetPos - camPos)), -1, 1)) * RAD2DEG`.
     - Candidate hit if `θ <= profile.hitConeDeg`.
   - If multiple targets hit simultaneously, pick the **minimum `θ`** (tie-break by closest world distance).
3. **Dwell State Transitions:**
   - `IDLE → DWELLING`: On hit, record `activeTargetId`, start `elapsedMs = 0`.
   - `DWELLING`: Increment `elapsedMs += dt * 1000`. Update radial shader/ring fill `progress = clamp(elapsedMs / profile.dwellMs, 0, 1)`.
   - **Glance-Abort:** If `θ > profile.hitConeDeg * 1.25` (hysteresis margin prevents edge flicker) before `elapsedMs >= profile.dwellMs`, immediately reset `elapsedMs = 0` → `IDLE` (emit zero commands; increment `benchmark.accidentalAborts` if exited after `>200 ms`).
   - `DWELLING → HALO_OPEN`: When `elapsedMs >= profile.dwellMs`, expand the target's 3-button `UI Kit` halo (`≥ 8 cm` button width).
   - **Action Selection inside `HALO_OPEN`:**
     - Dwell on sub-button for `profile.dwellMs * 0.75`, **OR**
     - Click/activate the persistent **`SwitchSelectButton` (SIK `Interactable`)** while hovering the sub-button (or cycling hovered button).
   - `HALO_OPEN → COOLDOWN`: Execute via `DeterministicCommandEngine`, enter `COOLDOWN` (`450 ms`), play audio chime, then collapse halo back to `IDLE`.

### D. `DeterministicCommandEngine.ts` & `CaregiverCommBridge.ts`
- **Duplicate & Cooldown Guard:** Rejects any command on `targetId` if `nowMs - lastTriggerMs[targetId] < 450`.
- **Caregiver FSM (Zero Fake Auto-Ack):**
  - `sendCareRequest(category)` sets `PENDING`, attempts bridge send.
  - If `bridgeOnline === true`: transitions through the local simulation to `DELIVERED` and updates `OperatorAckPanel`.
  - If `bridgeOnline === false`: transitions to **`DELIVERY_FAILED`**, displays clear amber/red warning `"Delivery Failed — Retry"`, and plays `chime_error_fail.wav` (never fakes success).
  - **Only** an explicit press of `OperatorAckButton` moves `DELIVERED → ACKNOWLEDGED`, firing `OffViewIndicator`.
  - Pressing `MarkCompletedButton` resets `ACKNOWLEDGED → COMPLETED → IDLE`.

### E. `OffViewIndicator.ts`
- Checks if the visible acknowledgment anchor (active proxy or object marker) world position is within `±14°` yaw and `±16°` pitch of current `Camera.forward`.
- While `CareRequestState === ACKNOWLEDGED` and out-of-view:
  - Play `chime_ack_offview.wav` once on arrival.
  - Position a small (`4 cm`) directional arrow at `12 cm` radius around screen-center (`camPos + camForward * 100 cm`) rotated toward the 2D projection of `(ackAnchor.pos - camPos)` onto the camera plane.
  - Hide arrow automatically once user looks back inside `±10°` of the active acknowledgment anchor.

### F. `AccessibilityBenchmark.ts`
- **Strictly Measured Preview Metrics (No Fabricated Estimates):**
  - `reachableCount`: Recomputed whenever mode (`FIXED_AR` / `ASAE_ADAPTIVE`) or profile changes.
  - `cumulativeRotationDeg`: Every frame during an active benchmark trial, `cumulativeRotationDeg += angleBetween(prevCamForward, rawCamForward)`.
  - `trialDurationSec`, `successfulSelections`, `accidentalAborts`, `blockedByCooldownCount`.
- Exposes `getSnapshot()` for both the toggleable `BenchmarkHud` and **LEAF** test assertions.

---

## 4. Additive Waveguide Color & UI Specifications

| UI Element | Color (Hex) | Scale at `1 m` | Visibility Rule |
|---|---|---|---|
| Resting Anchor Dot (`IDLE`) | `#E2E8F0` (alpha `0.65`) | `3.0 cm` diameter | Always calm; never obscures object |
| Dwell Progress Ring | `#38BDF8` (Cyan) | `6.0 cm` ring | Visible only during `DWELLING` |
| Tethered Proxy Badge | `#38BDF8` + `#0F172A` scrim (`α=0.35`) | `5.0 cm` badge | Visible only when object is out-of-range in `ASAE` |
| Tether Line to Appliance | `#38BDF8` (`α=0.45`) | `0.35 cm` thickness | Links proxy directly to physical 3D object |
| Expanded Halo Action Buttons | `#F8FAFC` text on `#0284C7` / `#0F172A` (`α=0.6`) | `8.5 × 5.5 cm` each (3 max) | Shown only in `HALO_OPEN`; collapses on select/exit |
| Caregiver `DELIVERED` / `ACK` | `#F59E0B` (Amber) → `#34D399` (Mint) | `7.0 cm` badge | Clear state color shift; off-view arrow in `#34D399` |
| `DELIVERY_FAILED` Alert | `#F87171` (Coral Red) | `10 × 5 cm` | Explicit retry button; never hides failure |

---

## 5. Build order and validation

1. Start with the open SPECS Base Template in the Lens project directory. Verify the directory-scoped Lens Studio MCP and CLAD availability in the coding agent. Inspect the installed SIK and UIKit package interfaces against the existing IDE definitions. Record version and tool availability with the build evidence.
2. Integrate the seated rig and three target objects in a furnished virtual rehabilitation room. Use a chair-height eye line, bedside furniture, lamp shade and emissive state, fan blades, and a recognizable care beacon. Keep Preview helper controls switched off during the main wearer flow.
3. Build the Fixed flow, observed bounds, guided capture, Adaptive transition, and both reset actions. Validate 1/3 to 3/3 in the scene before styling. Use a short smooth interpolation for controls and tethers. Turn off activation for moving controls until they settle.
4. Integrate dwell, cancellation, action selection, fallback input, fan and lamp response, and simulated caregiver delivery. Then wire the explicit acknowledgment, visual direction cue, and one spatial chime. Preview-only actions should carry a readable simulation label.
5. Integrate comparison logging, finish scene and interface polish, run independent manual and automated checks, fix issues, and repeat from Reset Demo. Record an evidence matrix with input, expected result, observed result, test method, and remaining limitations.
6. Record the Preview walkthrough and supporting test evidence, then prepare the repository and Devpost submission from the observed results. The submission deadline is December 7, 2026 at 5:00 PM EST.

### Capability boundaries

| Capability | How this project uses it | Verification |
|---|---|---|
| Scene transforms, frame updates, rendering, audio | Runtime scene and input mechanics | Installed type definitions and integrated Lens Studio run |
| Head pointing, operator clicks, room devices, and caregiver transport | Mouse-look, Preview SIK interactions, local visual or state-machine simulation | Preview interactions and assertions |
| Personalized calibration and accessible reachability | GazeAnchor derives signed bounds from camera orientation and solves placements in a neutral frame | Deterministic math checks plus an observed Preview sweep |
| Wear-time comfort, assistive switch hardware, paired IoT devices, remote caregiver network and real-room anchors | Future evaluation or integration | Requires hardware, environment, or people beyond this build |

### Preview acceptance and reset

| Check | Evidence to capture |
|---|---|
| Restricted range before calibration | From neutral, the Fixed scene reports 1/3. Show Lamp as in range and Fan and CareBeacon outside the measured bounds. |
| Personalized calibration | Complete neutral, left, right, up, down, and steady capture. Compare captured signed bounds to the observed sweep. Repeat with an asymmetric range to check the same logic. |
| Adaptive reachability | Report 3/3 for the restricted fixture. Confirm that Lamp stays on the object, both proxies fit the bounds, the two proxies do not overlap, and each tether points to its source. |
| Dwell safety | Break aim before the threshold. Observe reset and verify no command or state change. Hold through selection and verify one command. Include jitter, tracking pause, and cooldown checks. |
| Fan and caregiver workflow | Confirm fan Low, High and Off are visibly distinct. Confirm Water stays delivered until explicit acknowledgment. Exercise the offline failure and retry. |
| Off-view acknowledgment | Look away before acknowledging from the labeled Preview operator control. Confirm one chime and the correct arrow direction, then verify acknowledgment and arrow dismissal on return. |
| Reset Calibration | Restore Fixed placements and clear captured calibration, pending selection, and transient cue state. Preserve appliances and caregiver records. Repeat equivalent calibration input to compare layout. |
| Reset Demo | Return to Fixed mode and a neutral demo state. Reset fan, lamp, caregiver, dwell, cues and telemetry. Run the entire story again in the same Preview session. |

Run the existing LEAF plan where the integrated project exposes equivalent input and state. Record manual mouse-look, visual, and audio checks independently. A deterministic check of a synthetic pose proves the underlying logic. A visible Preview run is needed to verify its wiring and presentation. Fixed-mode tasks outside the observed envelope are incomplete. Record per-attempt travel and completions without presenting incomplete and complete sequences as equivalent.

## Post-interview implementation priority

Preserve the measured Restricted 1/3 to 3/3 flow and add a readable state for Adaptive placement when fewer controls fit. Keep the real reachable count visible with safe controls and an optional recalibration action. Verify the placement solver maximizes safe independent placement for narrow and asymmetric bounds before making that claim. Sequential selection across room controls remains future work. Use the five judge-facing checks in the design brief for Preview acceptance.
