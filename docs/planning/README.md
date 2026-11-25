# GazeAnchor — Planning & Build Suite

**Target Hackathon:** Learn AR with SPECS — Round 2 (`https://learn-specs.devpost.com/`)\
**Deadline:** December 7, 2026 (5:00 PM EST)\
**Lens Studio Project Root:** `GazeAnchor.esproj` (Lens Studio `5.23.2`, `targetPlatform: Spectacles`)\
**Packages Installed:** `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg`\

---

## How an AI Coding Agent Should Read & Execute This Folder

Read these files **in order** before editing anything in the repository:

1. **[requirement.md](./requirement.md)** — Hard functional/non-functional requirements, explicit cuts (what **not** to build), and verified Lens Studio `5.23.2` constraints.
2. **[prd.md](./prd.md)** — Product vision, user personas, mobility profiles (`45° Wide` / `25° Moderate` / `12° Restricted`), spatial UX rules, and `<3 min` demo narrative.
3. **[detail_implementation.md](./detail_implementation.md)** — Exact TypeScript module architecture, ASAE math (calibration, reachability, cone-edge tethered proxies, EMA dwell filter), SIK/UI Kit wiring, and scene setup.
4. **[testing_and_leaf_plan.md](./testing_and_leaf_plan.md)** — acceptance scenarios, LEAF prerequisites, and the evidence matrix.
5. **[devpost_submission_guide.md](./devpost_submission_guide.md)** — Approved `devpost/design-brief.md` workflow, CLAD prompts, YouTube `<3 min` recording script, and submission checklist.

---

## Non-Negotiable Engineering Guardrails

1. **ASAE is the Core Product:** The innovation is the **Adaptive Spatial Accessibility Engine** (personalized head-range calibration → reachability check → tethered rim proxies + adaptive EMA dwell), **not** a generic AR smart-home remote.
2. **Never Block Center Vision:** Proxies for out-of-range objects must sit at the **calibrated cone boundary (`85%` radius)** with a thin luminous tether pointing back to the physical appliance—never a stacked 2D menu floating in front of the user's face.
3. **Preview-First Discipline:** Judges evaluate a `<3 min` video showing **Lens Studio Interactive Preview** and require the Lens project and planning files in the repo. Use head-pointing and dwell for wearer inputs and SIK/UI Kit for discrete Preview controls and compatible LEAF scenarios.
4. **No Fake Auto-Ack & No Fabricated Metrics:** Caregiver requests (`PENDING -> DELIVERED -> ACKNOWLEDGED`) must never auto-ack on a timer; acknowledgment requires explicit operator/companion input. Benchmark metrics report **only** measured Preview degrees/counts—never claim unmeasured clinical patient fatigue reductions.
5. **First integration milestone:** Verify calibration, two distinct tethered proxies, and dwell selection together in Interactive Preview before visual refinement.
