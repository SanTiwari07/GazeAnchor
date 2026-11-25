import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class OffViewAcknowledgmentScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const preview = new CaregiverPreviewControls()
    const pose = new HeadPoseDriver()
    try {
      pose.aim(0, 0)
      const arrow = findSceneObjectByName("Ack direction", pose.camera.getSceneObject())
      const care = findSceneObjectByName("Care beacon marker")
      if (!arrow || !care) throw new Error("Camera-relative cue or active caregiver marker is missing")
      expect(arrow.enabled).toBe(false)
      expect(arrow.getChildrenCount()).toBe(3)

      await preview.enableAdaptive()
      await preview.selectCareAction("Water")
      await preview.waitForText(preview.caption, "Water · Delivered")
      expect(arrow.enabled).toBe(false)

      await preview.tap("Caregiver sim")
      pose.aim(-35, 0)
      await sleep(100)
      await preview.tap("Acknowledge")
      await preview.waitForText(preview.caption, "Water · Acknowledged")
      await sleep(100)
      expect(preview.simulationState.text).toBe("Sim online   ·   Water · Acknowledged")
      expect(arrow.enabled).toBe(true)
      expect(arrow.getTransform().getLocalPosition().x).toBeGreaterThan(0)
      await sleep(650)

      pose.aimAt(care.getTransform().getWorldPosition())
      await sleep(150)
      expect(arrow.enabled).toBe(false)
      expect(preview.caption.text).toBe("Water · Acknowledged")
      print("[GazeAnchor LEAF] T12 switch sent Water and the rightward acknowledgment cue cleared on return")
    } finally {
      pose.dispose()
    }
  }
}
