import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep } from "Leaf.lspkg/Utils/common/Utils"
import { DwellScenarioView } from "./DwellScenarioView"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class TrackingInterruptionScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const view = new DwellScenarioView()
    const pose = new HeadPoseDriver()
    try {
      const tracking = pose.camera.getSceneObject().getComponent("Component.DeviceTracking")
      if (!tracking || !tracking.enabled) throw new Error("Active native DeviceTracking is required")
      const transitions: boolean[] = []
      const status = tracking.trackingStatus.onChange
      const subscription = status.add(available => { transitions.push(available) })
      try {
        view.controller.dwellSeconds = 0.95
        pose.aimAt(view.lamp.getTransform().getWorldPosition())
        await view.waitForDwell()
        await sleep(350)
        expect(view.firstSegment.enabled).toBe(true)
        tracking.enabled = false
        await sleep(500)
        if (!transitions.includes(false)) {
          throw new Error("Preview did not emit DeviceTracking loss when the tracking component was disabled")
        }
        expect(view.halo.getChildrenCount()).toBe(0)
        expect(view.firstSegment.enabled).toBe(false)
        view.expectNoCommand()

        tracking.enabled = true
        const deadline = getTime() + 1.5
        while (!transitions.includes(true) && getTime() < deadline) await sleep(10)
        if (!transitions.includes(true)) {
          throw new Error("Preview did not emit DeviceTracking recovery after re-enabling the component")
        }
        await sleep(600)
        expect(view.halo.getChildrenCount()).toBe(0)
        await sleep(500)
        expect(view.requireObject("On", view.halo).enabled).toBe(true)
        view.expectNoCommand()
        print("[GazeAnchor LEAF] T10 native tracking interruption cleared partial dwell; fresh dwell opened after recovery")
      } finally {
        tracking.enabled = true
        status.remove(subscription)
      }
    } finally {
      pose.dispose()
    }
  }
}
