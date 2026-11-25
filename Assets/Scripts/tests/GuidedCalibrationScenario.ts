import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep, withTimeout } from "Leaf.lspkg/Utils/common/Utils"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class GuidedCalibrationScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const root = findSceneObjectByName("GazeAnchor Controls")
    if (!root) throw new Error("GazeAnchor Controls is missing")
    const prompt = findSceneObjectByName("Calibration prompt", root)?.getComponent("Component.Text")
    const reachability = findSceneObjectByName("Reachability", root)?.getComponent("Component.Text")
    if (!prompt || !reachability) throw new Error("Calibration text is missing")
    const head = new HeadPoseDriver()
    const hand = new DefaultLeafInteractor()
    const tap = async (name: string) => {
      const target = findInteractableByName(name, root, true)
      if (!target) throw new Error("Enabled calibration control missing: " + name)
      await withTimeout(hand.trigger(target), 2500, "LEAF could not trigger " + name)
      await sleep(150)
    }
    try {
      head.aim(0, 0)
      await tap("Guided sweep")
      const stops = [
        { direction: "LEFT", yaw: -12, pitch: 0 },
        { direction: "RIGHT", yaw: 11, pitch: 0 },
        { direction: "UP", yaw: 0, pitch: 8 },
        { direction: "DOWN", yaw: 0, pitch: -7 },
      ]
      for (const stop of stops) {
        expect(prompt.text.includes(stop.direction)).toBe(true)
        head.aim(stop.yaw, stop.pitch)
        await sleep(120)
        await tap("Capture / Next")
      }
      expect(prompt.text.includes("Return to neutral")).toBe(true)
      head.aim(0, 0)
      for (let attempt = 0; attempt < 50 && !prompt.text.startsWith("Measured"); attempt++) {
        await sleep(100)
      }
      expect(prompt.text).toBe("Measured   Y -12.0° / +11.0°   P -7.0° / +8.0°")
      expect(reachability.text).toBe("Fixed   ·   1/3 reachable")
      await tap("Fixed / Adaptive")
      expect(reachability.text).toBe("Adaptive   ·   3/3 reachable")
      print("[GazeAnchor LEAF] T01 measured " + prompt.text + " and placed 3/3 targets")
    } finally {
      head.dispose()
    }
  }
}
