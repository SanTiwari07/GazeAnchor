![GazeAnchor — room controls within comfortable reach](docs/media/banner.jpg)

# GazeAnchor

The bedside lamp is in front of you. The fan is off to your right, past the point where you can comfortably turn your head. How do you turn it up from your seat?

GazeAnchor is a Snap Spectacles Lens for people who have limited head or hand movement. It measures how far the wearer can comfortably look in each direction, then brings a control for the distant fan into that space. A blue line leads from the control back to the fan. The wearer can turn it up, dim the lamp or ask for water by pointing their head and holding still.

**[Watch the 2:55 demo](https://youtu.be/TXR-9WyQL4g)** · [Watch the 44-second overview](https://youtube.com/shorts/jcPbjKkYRo4) · [Run it in Lens Studio](#run-it-in-lens-studio)

## The same room from the same seat

| Fixed · 1 of 3 controls within reach | Adaptive · 3 of 3 controls within reach |
| --- | --- |
| ![Fixed Preview. The lamp has a blue square beside its shade. The fan and care controls are outside the seated range.](devpost/evidence/fixed-reachability.png) | ![Adaptive Preview. Two blue squares labeled Fan and Care beacon appear to the right of the lamp, with lines leading to their objects.](devpost/evidence/adaptive-tethers.png) |
| The square beside the lampshade lets the wearer control the lamp. Reaching the other two markers would require a larger head turn. | The lamp marker stays in place. The upper square now controls the fan, and the lower square opens care requests. |

Both screenshots use the same simulated head movement limits of 12° to either side and 8° up or down. The wearer can also choose **Guided sweep** to measure each direction separately. Turn comfortably toward each prompt, choose **Capture / Next**, then face forward and hold for two seconds. A smaller range can fit fewer controls. [See a measured sweep in Preview](devpost/evidence/measured-adaptive-reachability.png)

## Turn up the fan

Point your head at the **Fan** square until the ring fills and the choices open. Hold on **High** and the blades spin faster across the room. A brief glance only starts the ring. Looking away cancels the unfinished selection. The same two holds let you turn the lamp on, dim it or switch it off.

![Frame from the recorded Preview demo. Fan high appears above the two tethered controls after the wearer selects High.](docs/media/fan-control.jpg)

## Ask for water

Choose **Care beacon → Water**. *Delivered* means the local caregiver panel received the request. When the operator presses **Acknowledge**, the wearer sees *Water · Acknowledged*. If the wearer has turned away, an arrow points back to the beacon and clears when they look back. [See the arrow in Preview](devpost/evidence/off-view-cue.png)

![Frame from the recorded demo. The caregiver panel shows Water · Acknowledged above the Acknowledge, Online / Offline and Complete controls.](docs/media/water-request.jpg)

## What the trial showed

With the limits pictured above, the Fixed trial completed **one task** (lamp on). Adaptive completed **all three** (lamp on, fan high and a water request acknowledged). The placement lesson was easy to miss during design. Bringing the fan marker within reach only helps if the wearer can also reach **High** after its menu opens.

The trial used simulated head poses, appliances and a local caregiver panel in Lens Studio. Comfort on physical glasses, real appliance control and remote request delivery still need testing. The recorded integration run passed all 12 LEAF scenarios. [Benchmark and reproduction steps](devpost/benchmark-results.md) · [Preview log](devpost/evidence/preview-results.txt) · [Test report](devpost/testing-report.md)

## Run it in Lens Studio

With Git LFS and Lens Studio **5.23.2.26081320** installed, fetch the project and its assets.

```sh
git lfs install
git clone https://github.com/SanTiwari07/GazeAnchor.git
cd GazeAnchor
git lfs pull
```

1. Open `GazeAnchor.esproj`, select **SPECS 27** and start **Interactive** Preview. Right-drag to aim your head and click to operate a panel button.
2. Choose **Reset Demo**. From the seated position, the restricted preset starts in **Fixed** with one reachable control. Click **Fixed / Adaptive** to reveal the two tethered controls.
3. Try **Fan → High**, then **Care beacon → Water**. Open **Caregiver sim** and click **Acknowledge** to see the reply. **Switch select** also lets you choose the focused item using a simulated switch.
4. To replay the measured comparison, run **T11** in the LEAF panel. To run the 11 standalone logic tests, use `node --test tests/*.test.mjs` with Node.js 26.

## Team and credits

Built by [Shambhavi Patil](https://github.com/Shambhavi500) and [Sanskar Tiwari](https://github.com/SanTiwari07). The design draws on [Ability-Based Design](https://doi.org/10.1145/1952383.1952384) and [Reality Proxy](https://doi.org/10.1145/3746059.3747709). The [design brief](devpost/design-brief.md) records the interaction decisions, and the [engineering report](devpost/engineering-report.md) traces them to the implementation.

The team's original GazeAnchor code is available under the [MIT License](LICENSE). Snap packages, bundled assets from other creators and the Devpost planning skill retain their respective terms. [Bundled packages](Packages/) · [Devpost skill license](agent/skills/plan-lens/LICENSE)
