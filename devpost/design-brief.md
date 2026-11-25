---
status: approved
---

# Design brief for GazeAnchor

**Team:** Shambhavi Patil and Sanskar Tiwari. **Core technology:** Adaptive Spatial Accessibility Engine (ASAE).

## The one spatial moment

In a furnished rehabilitation room, a seated wearer with limited head movement and limited ability to use their hands or speak uses head direction and dwell to operate the only control within comfortable reach, the lamp. A short calibration brings the tethered fan and care controls into range, changing reachability from 1/3 to 3/3 before the wearer sets the fan to High and requests water. The simulated caregiver acknowledgment closes the loop.

> Instead of forcing the user to adapt to technology, GazeAnchor adapts technology to the user.

## Why it belongs on glasses

- Controls belong to specific room objects. When a control moves, its tether preserves that connection.
- Head direction and dwell let the wearer act while seated, with their hands at rest, without speaking or reaching for a device.
- The simulation illustrates how the wearer could handle everyday choices and communicate comfort needs with greater independence.

## Product or overlay

- The Lens overlays room and comfort controls on a furnished virtual rehabilitation room. A lamp, a standing fan, and a bedside care beacon give each control a visible purpose.
- Native Lens capabilities provide camera orientation, 3D scene transforms, rendered objects, and audio. GazeAnchor uses camera forward as a head-pointing signal.
- Interactive Preview uses mouse-look for head direction and its simulated hand for operator or accessibility-switch clicks. The lamp and fan act within the scene. The operator acknowledges requests explicitly using a control labeled **Caregiver simulation**.
- Paired devices, remote caregiver delivery, and wearable switches are future integrations.

## Where things live

- The seated camera starts at 120 cm eye height. Lamp, Fan, and CareBeacon begin at approximately −10°, +34°, and +22° yaw.
- The lamp keeps its object marker when its position falls inside the captured comfort range. The other controls move along short animations to stable, visibly separated positions inside the calibrated range. Thin tethers link them to the original objects.
- Keep proxy centers clear of the central ±4° sightline. Keep proxies roughly 1 m away. Use 5 cm idle badges and action buttons at least 8 cm wide where feasible. Fit active choices within the calibrated range and check them in Preview.

- Use 85% of the signed calibrated bounds as the conservative placement envelope. For the illustrative Restricted profile (±12° horizontal and ±8° vertical), the inset bounds are ±10.2° and ±6.8°. Aim for approximately 105 cm depth and 12 cm center spacing near 1 m. Prefer upper-right Fan and lower-right CareBeacon when the solver can preserve separation and clear the central ±4° to ±4.5° sightline.
- If safe space runs out, preserve the maximum safely placeable set of independently selectable controls and show the computed 0/3–3/3 count. Explain the limitation and offer optional recalibration within the wearer's comfort. Sequential selection across room controls is future work and would have a separate accessibility measure.

## Hands and input

- Capture the wearer's neutral position and comfortable left, right, up, and down limits. Keep each signed limit so asymmetric motion is represented. Show a labeled reproducible preset for demonstration and reset.
- Aim with camera-forward head direction and adaptive EMA smoothing. The Wide, Moderate and Restricted presets use approximately 650, 800 and 950 ms, configurable from 500 to 1400 ms. Action confirmation uses about 75% of target dwell. Apply at least 450 ms of cooldown and require re-arming before repeating a command. A short glance fills part of the ring and then clears without showing actions or issuing a command.
- After the target opens, use dwell to select actions. Provide a clickable SIK/UI Kit accessibility-switch simulation for the focused action and operator controls for the demo.

## When things show

- Show resting markers with restrained, high-luminance labels. Show the comfort boundary and reachable count during the comparison and calibration. Once the transformation completes, keep the controls small until needed. Show task progress near the active room control (default) as the wearer completes each task. Reachability counts available controls, and task progress counts the lamp action, fan set to High, and acknowledged water request. Calibration updates reachability without advancing task progress.
- During dwell, show a cyan progress ring. Show the actions only after the target opens and dismiss them on selection, cancellation, or exit.
- Keep Delivered and Acknowledged visible until the relevant operator action, briefly confirm explicit Completion, and keep Delivery Failed and Retry available until resolved. Distinguish states with readable text and icons as well as color. When the simulated caregiver acknowledges off-view, play one spatial chime and show a small arrow toward the reachable acknowledgment marker. Hide the arrow when the wearer looks back.

## Existing regression checks

Keep these integrated checks alongside the interview acceptance criteria.

1. Starting from a seated viewpoint in Fixed mode with the restricted profile, the Lens shows **1/3 reachable** and world anchors for three distinct room targets. Operate the lamp by dwell and confirm the room lamp responds and task progress reads **1/3**. Running the guided sweep saves the measured limits. Applying calibrated placement shows **3/3 reachable** when the captured range includes the lamp and permits both inside-range proxies. Proxies animate to distinct placements and remain visibly tethered to the original objects. Task progress stays at **1/3**.
2. A quick glance at Fan causes no command. Holding through dwell opens its actions. Selecting High turns the simulated fan faster and advances task progress to **2/3**.
3. Selecting Water creates a visibly simulated comfort request and leaves it delivered until the operator acts. With the wearer looking away, operator acknowledgment plays a single spatial chime and shows an arrow. The explicitly simulated acknowledgment advances task progress to **3/3**. Looking back reveals the acknowledgment, and the arrow clears. An offline simulation shows a delivery failure with retry and leaves task progress at **2/3** until acknowledgment.
4. Reset Calibration clears captured bounds and adaptive placement. Repeat the guided sweep and recover the same layout for equivalent inputs. Reset Demo restores baseline mode, lamp and fan states, caregiver state, dwell indicators, and task progress (**0/3**) in the current Preview session.
5. From the same seated neutral, record reachable counts, completed actions, and angular travel for each run. Mark any Fixed-mode tasks outside the calibrated range as incomplete.

## Interview acceptance checks

1. From the same seated neutral pose, use the Restricted ±12°/±8° profile in Fixed AR. Verify only Lamp is selectable, there are no proxies, and the calculated count is 1/3.
2. Enable ASAE Adaptive with the same bounds. Verify Lamp stays anchored, Fan and CareBeacon move to separate reachable tethered proxies, the central sightline stays clear, and each target can be highlighted independently. Verify the computed count is 3/3. Repeat with different or asymmetric bounds and inspect the adapted layout.
3. Use two-stage head-direction dwell to exercise Fan High, Low, Off and Lamp On, Dim, Off. Verify visible state changes, confirmation feedback, and halo closure. Repeat an action with the simulated switch.
4. Briefly glance away during target and action dwell, introduce small camera jitter, then execute one command and keep looking. Verify progress resets on cancellation, selection remains predictable, and cooldown and re-arm prevent repeats. Inspect cancellation and command telemetry.
5. Send Water through the CareBeacon proxy. Observe Pending and Delivered, wait without operator input, explicitly acknowledge off-view, follow the one-time chime and direction cue, and explicitly complete. Repeat offline and verify clear failure and accessible retry.

Reset and repeat in the same Preview session. Record actual reachable counts, angular travel, completion time, commands, cancelled attempts and cooldown blocks. Disclose simulated room, appliance, operator, switch and camera inputs. Report physical usability and clinical effectiveness as unverified. For narrower bounds, independently verify honest counts, safe placement and optional recalibration. The five checks above use the Restricted demonstration profile where specified.

## Out of scope

- Live hardware control, remote caregiver delivery, emergency alerts, live camera recognition, and persistent room mapping.

## Risks and open questions

- Verify that both tethers and action choices are distinguishable in the restricted profile. Check line weight, label readability, and target spacing in Interactive Preview.
- Run manual mouse-look checks for scenarios LEAF cannot drive. Record which steps rely on sample input and which are exercised in the visible Preview.
- Physical comfort and fatigue, fit, display legibility on hardware, head-tracking stability, and accessibility for the intended user population require testing on real glasses with consenting participants.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
