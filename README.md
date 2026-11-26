# GazeAnchor

**Hands-free room controls that adapt to how far a seated wearer can comfortably turn.** Built for Snap Spectacles at Learn AR with SPECS Round 2.

Imagine turning on a bedside lamp, adjusting a fan across the room, and asking a caregiver for water. A fixed AR interface puts each control on its object. That works for the lamp in front of you. If the fan sits past the point where you can turn your head, its control is visible to someone exploring the scene but unreachable from your seat.

GazeAnchor measures the wearer's range from a seated position. It leaves reachable controls on their objects and places a second, selectable marker inside that range for an object farther away. A visible line connects the marker to its source. Selecting the nearby fan marker changes the fan across the room. In the recorded restricted-range Preview trial, this change let the wearer complete **all three tasks in Adaptive mode, up from one in Fixed mode**, with the same movement limits.

[Watch the full demo](https://youtu.be/TXR-9WyQL4g) · [Watch the Short](https://youtube.com/shorts/jcPbjKkYRo4?feature=share) · [Run the Lens](#run-the-lens) · [Inspect the results](#preview-results)

[![Frame from the demonstration showing the lamp and the “Ask for water” option](docs/media/room-demo.jpg)](https://youtu.be/TXR-9WyQL4g?t=100)

*At [1:40 in the demo](https://youtu.be/TXR-9WyQL4g?t=100), look for the Care action beside the lamp. The lamp's own marker stays attached to the appliance.*

## What the wearer does

1. **Measure comfortable movement.** Start in a neutral seated position. In **Guided sweep**, look comfortably left, right, up and down, then return to neutral and hold for two seconds. The Lens records each direction independently. In one recorded sweep, the wearer reached 12° left, 11° right, 8° up and 7° down.
2. **Compare the same room in two modes.** In **Fixed**, each marker sits on its room object. In **Adaptive**, the lamp stays in place while the fan and Care beacon gain separate reachable markers called *proxies*. Follow either tether to identify its object before choosing an action.
3. **Look, hold, then choose.** Aim your head at a marker until the progress ring fills and its action menu opens. Aim at an action and hold again to confirm it. A glance can reveal progress without changing the room. Looking away cancels an unfinished hold. After a command, release focus to re-arm selection.
4. **See what happened.** The lamp shade changes appearance, the fan rotor changes speed, or the Care beacon displays the request status. **Switch select** provides another way to select the focused item and navigate timed action choices in Preview.

| Room control | Choices | What a judge can observe |
| --- | --- | --- |
| Lamp | On, Dim, Off | The shade changes at its original location. With the restricted preset, the lamp is reachable in both modes. |
| Fan | High, Low, Off | The blades change speed or stop. In Adaptive mode the wearer can operate the distant fan from its tethered marker. |
| Care beacon | Water, Reposition, Temperature, Assistance | A request enters the local caregiver simulation. The wearer can see whether it was delivered, acknowledged or failed. |

### Follow a water request from both sides

Select **Care beacon → Water** as the wearer. With the local caregiver panel online, the request moves from pending to delivered. It stays delivered until someone opens **Caregiver sim** and acknowledges it. This distinction matters when judging the demo. Delivery means the panel received the request. Acknowledgment means the operator acted on it.

To see how the wearer notices a reply, turn away from the beacon before acknowledging. An arrow points back toward it, and the Lens requests a single spatial chime. Look back to clear the arrow and read the status. The operator can then mark the request complete. To exercise recovery, take the panel offline, send a new request, reconnect and choose **Retry**. The failed request waits for that deliberate retry.

## Run the Lens

Install Git LFS and Lens Studio **5.23.2.26081320**. Fetch the large assets before opening the project.

```sh
git lfs install
git clone https://github.com/SanTiwari07/GazeAnchor.git
cd GazeAnchor
git lfs pull
```

1. Open `GazeAnchor.esproj` and select **SPECS 27 Interactive** in Preview. Right-drag to look around and click to simulate a pinch.
2. Select **Reset Demo** for the restricted preset in Fixed mode. Check which room controls are reachable. To measure a fresh range, choose **Guided sweep** and follow the four directions and neutral hold.
3. Toggle **Fixed / Adaptive**. Find the lamp, fan and Care beacon, then follow each tether back to its room object.
4. Turn the lamp on, set the fan to high and request water. Open **Caregiver sim** to acknowledge the request. To reproduce the measured trial, select **Benchmark** from neutral before the first action. Press it again to end an incomplete trial.

## Preview results

The recorded benchmark used the same restricted movement profile and task sequence in both modes. LEAF supplied synthetic head poses through the Preview camera.

| Measurement | Fixed | Adaptive |
| --- | ---: | ---: |
| Reachable controls | 1 of 3 | 3 of 3 |
| Completed tasks | 1 of 3 | 3 of 3 |
| Trial duration | 4.69 s, stopped incomplete | 7.48 s, all tasks completed |
| Total camera rotation | 48.94° | 77.28° |
| Duplicate commands | 0 | 0 |

The two durations cover different amounts of work. The result demonstrates improved reachability in this simulated room. Physical comfort, real-device tracking, paired appliances, hardware switches and remote caregiver delivery still need evaluation.

The project records **12 passing LEAF scenarios** and **11 passing standalone tests**. Run `node --test tests/*.test.mjs` with Node.js 26 for the standalone suite. For integrated scenarios, run the registered GazeAnchor tests one at a time in the Preview LEAF panel (Leaf 2.0.0).

[Benchmark protocol and results](devpost/benchmark-results.md) · [Preview log](devpost/evidence/preview-results.txt) · [Testing report](devpost/testing-report.md)

## Inside the project

| Entry point | Responsibility |
| --- | --- |
| [Room scene](Assets/Scene.scene) | Room geometry, camera and interaction bindings |
| [Lens controller](Assets/Scripts/GazeAnchorMain.ts) | Calibration, dwell input, room actions and benchmark telemetry |
| [Reach calculations](Assets/Scripts/Reach.ts) | Checks movement limits and places separated proxy controls |
| [Spatial UI](Assets/Scripts/GazeAnchorUI.ts) | Builds the controls and labels visible in the room |
| [Caregiver bridge](Assets/Scripts/room/CaregiverCommBridge.ts) | Tracks local delivery, failure, retry and acknowledgment |
| [Preview scenarios](Assets/Scripts/tests/) | Exercises the Lens through simulated wearer and operator input |

## Design and credits

Built by [Shambhavi Patil](https://github.com/Shambhavi500) and [Sanskar Tiwari](https://github.com/SanTiwari07) for Learn AR with SPECS Round 2. The project uses Snap’s Spectacles Interaction Kit, Spectacles UI Kit and LEAF. These components retain their upstream terms.

The calibration design draws on [Ability-Based Design](https://doi.org/10.1145/1952383.1952384), and the object-linked controls draw on [Reality Proxy](https://doi.org/10.1145/3746059.3747709). The team’s design decisions and build evidence are available in the [design brief](devpost/design-brief.md), [planning documents](docs/planning/README.md), [build verification](devpost/build-verification.md) and [submission checklist](devpost/submission-checklist.md).
