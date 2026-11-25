import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"
import { DwellScenarioView } from "./DwellScenarioView"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class NearestOverlapScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const view = new DwellScenarioView()
    const preview = new CaregiverPreviewControls()
    const pose = new HeadPoseDriver()
    const lamp = view.lamp.getTransform()
    const fan = view.requireObject("Fan marker", view.root).getTransform()
    try {
      pose.aim(0, 0)
      await preview.enableAdaptive()
      const near = pose.point(0.5, 0)
      const far = pose.point(2.1, 0)
      const lampStart = lamp.getWorldPosition()
      const fanStart = fan.getWorldPosition()
      try {
        lamp.setWorldPosition(near)
        fan.setWorldPosition(far)
        await view.waitForDwell()
        await sleep(1050)
        expect(view.requireObject("On", view.halo).enabled).toBe(true)
        expect(findSceneObjectByName("Low", view.halo) === undefined).toBe(true)

        await preview.tap("Fixed / Adaptive")
        await preview.enableAdaptive()
        lamp.setWorldPosition(far)
        fan.setWorldPosition(near)
        await view.waitForDwell()
        await sleep(1050)
        expect(view.requireObject("Low", view.halo).enabled).toBe(true)
        expect(findSceneObjectByName("On", view.halo) === undefined).toBe(true)
        view.expectNoCommand()
        print("[GazeAnchor LEAF] T06 both registration orders chose the 0.5° marker over the 2.1° marker")
      } finally {
        lamp.setWorldPosition(lampStart)
        fan.setWorldPosition(fanStart)
      }
    } finally {
      pose.dispose()
    }
  }
}
