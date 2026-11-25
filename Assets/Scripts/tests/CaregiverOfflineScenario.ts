import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"

@component
export class CaregiverOfflineScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const preview = new CaregiverPreviewControls()
    await preview.enableAdaptive()
    await preview.tap("Caregiver sim")
    expect(preview.simulationState.text).toBe("Sim online   ·   Idle")
    await preview.tap("Online / Offline")
    expect(preview.simulationState.text).toBe("Sim offline   ·   Idle")
    await preview.tap("Caregiver sim")

    await preview.selectCareAction("Reposition")
    await preview.waitForText(preview.caption, "Reposition · Delivery failed")
    await preview.tap("Caregiver sim")
    expect(preview.simulationState.text).toBe("Sim offline   ·   Reposition · Delivery failed")
    const requestedAt = preview.timestamp.text
    expect(requestedAt.startsWith("Requested at +")).toBe(true)
    await preview.tap("Acknowledge")
    expect(preview.caption.text).toBe("Reposition · Delivery failed")

    await preview.tap("Online / Offline")
    expect(preview.simulationState.text).toBe("Sim online   ·   Reposition · Delivery failed")
    await sleep(500)
    expect(preview.caption.text).toBe("Reposition · Delivery failed")
    await preview.tap("Caregiver sim")

    await preview.selectCareAction("Retry")
    await preview.waitForText(preview.caption, "Reposition · Delivered")
    expect(preview.timestamp.text).toBe(requestedAt)
    print("[GazeAnchor LEAF] T09 Reposition stayed failed through reconnect until explicit Retry")
    await preview.tap("Reset Demo")
    expect(preview.caption.text).toBe("Care beacon")
    expect(preview.timestamp.text).toBe("")
    expect(preview.simulationState.text).toBe("Sim online   ·   Idle")
    print("[GazeAnchor LEAF] T09 Reset Demo cleared a delivered request")
  }
}
