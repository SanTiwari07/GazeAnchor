import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class CancelDwellScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const lamp = findSceneObjectByName("Lamp marker")
    const actions = findSceneObjectByName("Focused actions")
    const light = findSceneObjectByName("Lamp illumination")?.getComponent("Component.LightSource")
    const metrics = findSceneObjectByName("Trial metrics")?.getComponent("Component.Text")
    const ring = Array.from({ length: 24 }, (_, i) => findSceneObjectByName("Dwell segment " + i))
    if (!lamp || !actions || !light || !metrics || ring.some(segment => !segment)) {
      throw new Error("Dwell ring or lamp interaction visuals are missing")
    }
    const visibleSegments = () => ring.filter(segment => segment?.enabled).length
    const head = new HeadPoseDriver()
    try {
      expect(visibleSegments()).toBe(0)
      head.aimAt(lamp.getTransform().getWorldPosition())
      for (let attempt = 0; attempt < 80 && visibleSegments() < 18; attempt++) {
        await sleep(20)
      }
      expect(visibleSegments() >= 18).toBe(true)
      expect(actions.getChildrenCount()).toBe(0)
      head.aim(16, 0)
      await sleep(350)
      expect(visibleSegments()).toBe(0)
      expect(actions.getChildrenCount()).toBe(0)
      expect(light.enabled).toBe(false)
      expect(metrics.text.startsWith("0 actions")).toBe(true)
      expect(metrics.text.endsWith("1 cancelled glances")).toBe(true)
      print("[GazeAnchor LEAF] T07 leaving a ≥75%-filled dwell ring cleared it without changing Lamp")
    } finally {
      head.dispose()
    }
  }
}
