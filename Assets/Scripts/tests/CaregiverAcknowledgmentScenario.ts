import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"

@component
export class CaregiverAcknowledgmentScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const preview = new CaregiverPreviewControls()
    expect(preview.caption.text).toBe("Care beacon")
    await preview.enableAdaptive()
    await preview.selectCareAction("Water")
    await preview.waitForText(preview.caption, "Water · Delivered")

    await sleep(10250)
    expect(preview.caption.text).toBe("Water · Delivered")
    await preview.tap("Caregiver sim")
    expect(preview.simulationState.text).toBe("Sim online   ·   Water · Delivered")
    expect(/^Requested at \+\d+(?:\.\d+)? s$/.test(preview.timestamp.text)).toBe(true)

    await preview.tap("Acknowledge")
    await preview.waitForText(preview.caption, "Water · Acknowledged")
    expect(preview.simulationState.text).toBe("Sim online   ·   Water · Acknowledged")
    await preview.tap("Complete")
    await preview.waitForText(preview.caption, "Water · Completed")
    print("[GazeAnchor LEAF] T08 Water remained Delivered for over 10 s until operator input")
    for (const category of ["Temperature", "Assistance"]) {
      await preview.tap("Caregiver sim")
      await preview.selectCareAction(category, true)
      await preview.waitForText(preview.caption, category + " · Delivered")
      await preview.tap("Caregiver sim")
      await preview.tap("Acknowledge")
      await preview.waitForText(preview.caption, category + " · Acknowledged")
      await preview.tap("Complete")
      await preview.waitForText(preview.caption, category + " · Completed")
      print("[GazeAnchor LEAF] T08 second-page request completed | " + category)
    }
  }
}
