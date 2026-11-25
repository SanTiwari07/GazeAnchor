# GazeAnchor — Devpost & CLAD Submission Guide (`devpost_submission_guide.md`)

**Hackathon:** Learn AR with SPECS — Round 2 (`https://learn-specs.devpost.com/`)\
**Deadline:** December 7, 2026 at 5:00 PM EST\
**Required Project Folder:** the repository root containing `GazeAnchor.esproj`

---

## 1. Mandatory Toolchain & Skill-Pack Workflow

Run these steps inside the repository root with **Lens Studio 5.23.2** open on `GazeAnchor.esproj`:

1. **Install the Devpost Learn Skill Pack:**
   ```bash
   npx skills add challengepost/learn-specs --all -y
   ```
2. **Verify CLAD + Lens Studio MCP Connection:**
   - Confirm Snap's CLAD plugin (`ls-clad@ls-extensions`) is installed per `https://developers.specs.com/docs/clad`.
   - Start a coding agent from the Lens project directory and confirm its Lens Studio-managed configuration loads the `lens-studio` server.
3. **Run `/plan-lens`:**
   - Use the existing approved `devpost/design-brief.md`.
4. **Build via CLAD in a Fresh Session:**
   > *"Read `docs/planning/README.md`, `docs/planning/requirement.md`, `docs/planning/detail_implementation.md`, and `devpost/design-brief.md`. Build GazeAnchor for SPECS in Lens Studio 5.23.2. Follow `ar-design-rules.md` and `preview-limits.md` strictly: keep center vision clear, use SIK and UI Kit for all interactions, keep proxies at the cone rim with tethers, never auto-acknowledge caregiver requests, run the acceptance matrix and report observed results. Run LEAF where the installed toolchain supports it."*

---

## 2. Approved design brief

Use [the approved design brief](../../devpost/design-brief.md) as the source for the Lens and its demonstration.

## 3. `<3 Minute` YouTube Video Shot List (`2:55` Total)

- **0:00–0:20 — Problem:** Explain why fixed smart-home apps, tablets, and fixed AR fail people with varying head mobility and impaired speech.
- **0:20–0:45 — Conventional AR Failure:** Turn on `FIXED_AR` under `Profile C (12°)`. Show `Lamp` reachable (`1/3`), while `Fan` (`+35°`) and `CareBeacon` (`+23°`) sit outside comfortable neck range.
- **0:45–1:10 — ASAE Breakthrough:** Run calibration / switch to `ASAE_ADAPTIVE`. Watch tethered rim proxies smoothly appear inside the `12°` edge (`3/3 reachable`) while center sightline remains clean.
- **1:10–1:40 — Independent Control & Safety:** Toggle Lamp (`On`), spin up Fan (`High`) via its tethered proxy, and intentionally perform a quick glance + head wobble to prove zero accidental triggers.
- **1:40–2:10 — Closed-Loop Caregiver Comfort Flow:** Send `Water` request → show `DELIVERED` waiting honestly → look away toward window → manually click `Operator Ack` → hear spatial chime & follow edge arrow back to `ACKNOWLEDGED`.
- **2:10–2:40 — Engineering Proof:** Show live `Fixed` vs `ASAE` measured Preview telemetry (`1/3 -> 3/3`, per-attempt angular travel and completed tasks). Include only observed test results.
- **2:40–2:55 — Honest Disclosures:** State clearly that Preview uses mouse-simulated kinematics and a manual Operator Ack panel, and physical wear comfort is *"feel unproven."*

---

## 4. Final Devpost Submission Checklist

- [ ] **Brand-new repo** built inside `GazeAnchor\GazeAnchor\` with `.esproj` and `devpost/design-brief.md` at repo root.
- [ ] **GitHub/GitLab/Bitbucket visibility:** Public on GitHub, GitLab or Bitbucket, or private on GitHub or GitLab and explicitly shared with `testing@devpost.com` and `jholmes@devpost.com` before deadline.
- [ ] **Public YouTube video** under **3 minutes**, showing the working Lens in Lens Studio Interactive Preview.
- [ ] **Transparent README:** Explicitly lists *"logic proven"* (observed Preview results and any LEAF results that were actually run) vs *"feel unproven"* (multi-hour hardware ergonomics, clinical patient validation), and cites prior-art inspirations (*Ability-Based Design*, *Reality Proxy*).
- [ ] **Submitted before Dec 7, 2026 at 5:00 PM EST.**

## Interview scope for submission

The Restricted profile demonstrates the measured 1/3 to 3/3 independent reachability change. If sequential selection across room controls is mentioned, describe it as proposed future work and keep it separate from the independent reachability count. Report narrower-range handling only to the extent verified in Preview.
