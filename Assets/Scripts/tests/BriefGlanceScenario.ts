import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class BriefGlanceScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const lamp = findSceneObjectByName("Lamp marker")
    const ring = findSceneObjectByName("Dwell segment 0")
    const actions = findSceneObjectByName("Focused actions")
    const light = findSceneObjectByName("Lamp illumination")?.getComponent("Component.LightSource")
    const metrics = findSceneObjectByName("Trial metrics")?.getComponent("Component.Text")
    if (!lamp || !ring || !actions || !light || !metrics) throw new Error("Lamp interaction visuals are missing")
    const head = new HeadPoseDriver()
    try {
      expect(light.enabled).toBe(false)
      head.aimAt(lamp.getTransform().getWorldPosition())
      await sleep(450)
      expect(ring.enabled).toBe(true)
      expect(actions.getChildrenCount()).toBe(0)
      head.aim(16, 0)
      await sleep(350)
      expect(ring.enabled).toBe(false)
      expect(actions.getChildrenCount()).toBe(0)
      expect(light.enabled).toBe(false)
      expect(metrics.text.startsWith("0 actions")).toBe(true)
      print("[GazeAnchor LEAF] T03 a 450 ms glance showed dwell progress without a command")
    } finally {
      head.dispose()
    }
  }
}
