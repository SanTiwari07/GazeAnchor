# GazeAnchor testing report

Lens Studio 5.23.2.26081320, SPECS 27 Interactive Preview, Leaf 2.0.0 and Spectacles Interaction Kit 2.0.0. The scenarios drive production UI Kit controls and synthetic head pose through the Preview camera. The controller consumes the resulting poses through its normal frame update. The [Lens log excerpts](evidence/preview-results.txt) record the observed outcomes.

| Test | Expected | Observed | Method and result |
| --- | --- | --- | --- |
| T01 | A signed guided sweep constrains the active profile. | Yaw −12°/+11°, pitch −7°/+8°. Fixed 1/3 and measured Adaptive 3/3. | LEAF passed. Also observed via native Preview camera moves and touch input. |
| T02 | Keep Lamp on its anchor, separate the fan and care proxies within the inset, and link both to their source. | Both tether endpoints aligned, Lamp was stationary, and the proxy separation was 16.28 cm. | LEAF passed through the actual Fixed / Adaptive control. |
| T03 | An early glance leaves the appliance unchanged. | A 450 ms glance showed progress, then cleared without a command. | LEAF passed. |
| T04 | Jitter and sustained gaze produce one Lamp selection. | With ±1.5° synthetic jitter, Lamp turned on and the selection count stayed at one. | LEAF passed. |
| T05 | A 700 ms hold opens a 600 ms action halo and leaves a 1,200 ms dwell in progress. | Observed both outcomes from first dwell feedback without an appliance command. | LEAF passed. |
| T06 | Choose the nearest candidate inside overlapping hit cones. | Both fixture assignments chose the 0.5° marker over the 2.1° marker. | LEAF passed with live test marker positions. |
| T07 | Leaving an incomplete dwell clears its progress without a command. | Leaving a dwell ring at or above 75% reset the ring and left the lamp off. | LEAF passed. |
| T08 | A delivered request waits for explicit acknowledgment and completion. | Water waited beyond 10 seconds. Explicit input acknowledged and completed it. Temperature and Assistance completed via the second scan menu. | LEAF passed via the production Switch select and operator UI. |
| T09 | Offline delivery fails, reconnect preserves failure, and only explicit Retry delivers. | Reposition stayed failed across reconnect and a rejected Ack, then delivered after Retry. Reset Demo cleared the delivered request. | LEAF passed. |
| T10 | Tracking interruption prevents false dwell completion and reacquires cleanly. | Disabling the native DeviceTracking component cleared partial dwell. A fresh dwell opened the halo after recovery. | LEAF passed in Preview. Device tracking under wear remains unverified. |
| T11 | Run the same three task attempts from neutral in both modes and measure the result. | Fixed completed 1/3 and Adaptive completed 3/3. Lamp Dim and Off and distinct Fan High, Low and Off were asserted after the trial. | LEAF passed. See [benchmark results](benchmark-results.md). |
| T12 | Use the switch to send Water and guide the wearer back after an off-view acknowledgment. | Switch delivered Water. A rightward mesh cue appeared, a chime request was logged, and the cue cleared on return. | LEAF passed. [Visual evidence](evidence/off-view-cue.png). Speaker audio was outside the recording. |

## Standalone regression coverage

All 11 cases passed with `node --test tests/*.test.mjs`. Five cases exercise signed restricted and asymmetric placement, the unreachable result for a very small envelope, invalid target directions, and zero travel for a stationary camera. Six cases exercise request legality, all four categories, duplicate prevention, online and offline delivery, reconnect and retry, invalid input, reset, and explicit acknowledgment and completion.

## Integrated regression scope

The same authored project ran after a normal save, close and reopen. Repeated Restricted, Moderate and Wide switching produced respectively **1/3**, **2/3**, and **3/3** fixed targets. The same asymmetric sweep was reproduced via native Preview input and LEAF. Reset Demo was exercised after device commands, a delivered care request, and the completed task sequence. The cold-start run initially exposed a menu navigation cooldown defect and a fixed-duration test wait. Later retests used verified current compiler imports. The [build verification record](build-verification.md) documents the failures and corrections.

Dedicated invalid-sweep interaction, physically worn tracking, long-duration comfort, external accessibility hardware, real devices, remote delivery, sound audibility and runtime frame-time profiling remain open.

## Post-interview verification

The five [judge-facing Preview checks](design-brief.md#interview-acceptance-checks) supplement the historical results above. A full judge walkthrough, physical audibility, and the new narrow-envelope shortfall explanation and optional recalibration behavior need evidence against those checks. Sequential selection across room controls is a proposed future enhancement. Existing action-menu navigation and the simulated switch remain part of the recorded build.
