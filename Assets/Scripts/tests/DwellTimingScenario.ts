import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"
import { DwellScenarioView } from "./DwellScenarioView"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class DwellTimingScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const view = new DwellScenarioView()
    const preview = new CaregiverPreviewControls()
    const pose = new HeadPoseDriver()
    const configuredDwell = view.controller.dwellSeconds
    try {
      view.controller.dwellSeconds = 0.6
      pose.aimAt(view.lamp.getTransform().getWorldPosition())
      await view.waitForDwell()
      await sleep(700)
      expect(view.requireObject("On", view.halo).enabled).toBe(true)
      view.expectNoCommand()

      pose.aim(0, 0)
      await preview.tap("Reset Demo")
      await sleep(300)
      view.controller.dwellSeconds = 1.2
      pose.aimAt(view.lamp.getTransform().getWorldPosition())
      await view.waitForDwell()
      await sleep(700)
      expect(view.firstSegment.enabled).toBe(true)
      expect(view.halo.getChildrenCount()).toBe(0)
      view.expectNoCommand()
      print("[GazeAnchor LEAF] T05 700 ms after visible acquisition opened 600 ms dwell only")
    } finally {
      view.controller.dwellSeconds = configuredDwell
      pose.dispose()
    }
  }
}
