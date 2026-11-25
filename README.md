# GazeAnchor

**Room controls within comfortable reach.**

GazeAnchor is a SPECS Lens that adapts room controls to a seated wearer’s comfortable head movement. A wearer with limited arm, head, or speech mobility can operate a simulated lamp and fan and send a local comfort request using head direction and dwell.

## How the Lens adapts

The Adaptive Spatial Accessibility Engine (ASAE) captures a neutral pose, four signed movement bounds, and two seconds of steady head motion. Fixed mode counts the room anchors inside the measured envelope. Adaptive mode keeps those anchors on their objects and places the remaining controls as separated proxies about one meter away. An inset keeps each proxy within the comfortable range, and a thin tether shows which room object it controls.

Looking steadily at a marker opens its actions. A second dwell selects an action. Smoothing reduces small changes in camera-forward direction. Short glances release focus, and a cooldown and gaze release gate prevent sustained gaze from issuing repeated selections. The **Switch select** UI Kit control can select the current gaze focus or start a timed scan of the available choices. Preview simulates a binary accessibility switch with this button.

The caregiver panel explicitly simulates local delivery for Water, Reposition, Temperature, and Assistance. An offline request stays failed until retry. Delivery and acknowledgment are separate states. Only operator input acknowledges a delivered request. An off-view acknowledgment cues the wearer back to the Care beacon or its proxy.

Spatial placement preserves the relationship between each control and the appliance it operates while allowing a seated wearer to interact without reaching across the room.

## Run in Lens Studio

Install Git LFS, clone this repository, and run `git lfs pull` from the checkout before opening the project.

1. Open `GazeAnchor.esproj` in Lens Studio **5.23.2.26081320**. The project targets Spectacles and includes the legacy Spectacles Interaction Kit and Spectacles UI Kit.
2. Set Preview to **SPECS 27 Interactive**. Right-drag to look around and click to simulate a pinch. Start at the seated neutral view.
3. **Reset Demo** restores the restricted profile and Fixed mode. From **Guided sweep**, capture comfortable Left, Right, Up and Down limits. Return to neutral for the steady hold. Use **Fixed / Adaptive** to compare placements. **Next profile** cycles the labeled restricted, moderate, and wide presets.
4. Dwell on Lamp, then choose On. In Adaptive mode, find the tethered Fan and select High. Use Care beacon to request Water, then open **Caregiver sim** and acknowledge it explicitly. **Online / Offline** and **Complete** are operator controls.
5. Use **Benchmark** to start a trial from neutral. Press it again to end an incomplete trial. A trial with all three tasks complete ends on the final task. The Lens logs the run duration, completed tasks, cumulative camera travel and action counts.

## Engineering and tests

| File | Responsibility |
| --- | --- |
| `Assets/Scene.scene` | Authored room, tracked camera, Interaction Kit, controller bindings and LEAF index |
| `Assets/Scripts/GazeAnchorMain.ts` | Calibration, spatial placement and tethers, input, devices, operator controls and measured telemetry |
| `Assets/Scripts/Reach.ts` | Signed envelope membership and deterministic proxy placement |
| `Assets/Scripts/GazeAnchorUI.ts` | Spatial UI Kit button, backing and text construction |
| `Assets/Scripts/room/CaregiverCommBridge.ts` | Local request and delivery state machine |
| `Assets/Scripts/tests/` | Preview scenarios for the installed legacy Leaf runner |

Run the standalone coverage with Node.js 26 and `node --test tests/*.test.mjs`. To run the integrated scenarios, open the LEAF panel for Preview and select the registered GazeAnchor scenarios one at a time. This project uses **Leaf 2.0.0**, which compiled against its existing Spectacles Interaction Kit 2.0.0.

In Lens Studio Interactive Preview, the restricted preset changed from **1/3 Fixed** to **3/3 Adaptive**. The guided demonstration reached the same counts with measured yaw **−12° to +11°** and pitch **−7° to +8°**. The lamp stayed on its object. LEAF measured **16.28 cm** between the restricted preset’s two proxy centers. See the [verification evidence](devpost/build-verification.md) and [requirement traceability](devpost/requirement-traceability.md).

The recorded Preview acceptance run passed all **12 LEAF scenarios**. All **11 standalone tests** passed during repository preparation. In the final benchmark, Fixed completed one task and the Adaptive run completed three in **7.48 s** under simulated head input. The full record includes the incomplete Fixed trial and both observed travel totals. [Testing report](devpost/testing-report.md) · [Measured benchmark](devpost/benchmark-results.md)

## Simulation and limitations

GazeAnchor uses camera-forward head direction and mouse-simulated Preview input. The room, appliances, switch and caregiver bridge are local simulations. The Lens is an exploratory prototype for ordinary comfort requests. Physical wear comfort, clinical usefulness, real-world tracking, switch hardware, paired appliances and remote caregiver delivery require separate evaluation.

## Research and components

- GazeAnchor’s personalization approach draws on Wobbrock and colleagues’ [Ability-Based Design](https://doi.org/10.1145/1952383.1952384).
- Its object-linked proxy design takes inspiration from [Reality Proxy](https://doi.org/10.1145/3746059.3747709).
- Spectacles Interaction Kit, Spectacles UI Kit, LEAF and the installed helper packages come from Snap’s Lens Studio Asset Library and retain their upstream terms.

## Team

- Shambhavi Patil
- Sanskar Tiwari

The [approved design brief](devpost/design-brief.md), [planning documents](docs/planning/README.md), and [submission checklist](devpost/submission-checklist.md) document the Learn AR with SPECS Round 2 workflow. The team used the Devpost Learn skill pack in a coding agent and built the Lens with CLAD, Lens Studio, and Lens Studio MCP.

The 2:55 Preview demonstration has been recorded for submission. Its public YouTube link is pending.
