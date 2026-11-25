import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class DwellJitterScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const marker = findSceneObjectByName("Lamp marker")
    const actions = findSceneObjectByName("Focused actions")
    const light = findSceneObjectByName("Lamp illumination")?.getComponent("Component.LightSource")
    const metrics = findSceneObjectByName("Trial metrics")?.getComponent("Component.Text")
    if (!marker || !actions || !light || !metrics) throw new Error("Lamp interaction visuals are missing")
    const head = new HeadPoseDriver()
    try {
      expect(light.enabled).toBe(false)
      const markerPosition = marker.getTransform().getWorldPosition()
      head.aimAt(markerPosition, 1.5)
      for (let attempt = 0; attempt < 40 && actions.getChildrenCount() === 0; attempt++) {
        await sleep(50)
      }
      const on = findSceneObjectByName("On", actions)
      if (!on) throw new Error("Lamp actions did not open during ±1.5° jitter")
      head.aimAt(on.getTransform().getWorldPosition(), 1.5)
      for (let attempt = 0; attempt < 45 && !light.enabled; attempt++) {
        await sleep(50)
      }
      expect(light.enabled).toBe(true)
      await sleep(650)
      expect(actions.getChildrenCount()).toBe(0)
      expect(metrics.text.startsWith("1 actions")).toBe(true)
      print("[GazeAnchor LEAF] T04 ±1.5° jitter and sustained gaze left Lamp On with exactly one action")
    } finally {
      head.dispose()
    }
  }
}
