import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { CaregiverPreviewControls } from "./CaregiverPreviewControls"
import { DwellScenarioView } from "./DwellScenarioView"
import { HeadPoseDriver } from "./HeadPoseDriver"

@component
export class ReachabilityBenchmarkScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const view = new DwellScenarioView()
    const preview = new CaregiverPreviewControls()
    const pose = new HeadPoseDriver()
    const hud = view.requireObject("Reachability", view.root).getComponent("Component.Text")
    const metrics = view.requireObject("Trial metrics", view.root).getComponent("Component.Text")
    if (!hud || !metrics) throw new Error("Reachability or trial metrics text is missing")
    try {
      pose.aim(0, 0)
      expect(hud.text).toBe("Fixed   ·   1/3 reachable")
      await preview.tap("Benchmark")
      await this.dwellAction(view, pose, "Lamp marker", "On")

      // The physical fan and care anchors are beyond the restricted right bound.
      // Look toward each within that bound and wait through the target threshold.
      for (const pitch of [-2.5, -6]) {
        pose.aim(12, pitch)
        await sleep(1200)
        expect(view.halo.getChildrenCount()).toBe(0)
      }
      await preview.tap("Benchmark")
      this.checkTrial(metrics.text, 1, 1)
      print("[GazeAnchor LEAF] T11 fixed | " + metrics.text)

      pose.aim(0, 0)
      await preview.tap("Reset Demo")
      await preview.enableAdaptive()
      expect(hud.text).toBe("Adaptive   ·   3/3 reachable")
      await preview.tap("Benchmark")
      await this.dwellAction(view, pose, "Lamp marker", "On")
      await this.dwellAction(view, pose, "Fan marker", "High")
      await this.dwellAction(view, pose, "Care beacon marker", "Water")
      await preview.waitForText(preview.caption, "Water · Delivered")
      await preview.tap("Caregiver sim")
      await preview.tap("Acknowledge")
      await preview.waitForText(preview.caption, "Water · Acknowledged")
      this.checkTrial(metrics.text, 3, 3)
      print("[GazeAnchor LEAF] T11 adaptive | " + metrics.text)

      const rotor = view.controller.rotor.getTransform()
      const highSpeed = await this.rotorSpeed(rotor)
      expect(highSpeed).toBeGreaterThan(8)
      expect(highSpeed).toBeLessThan(16)

      await preview.tap("Reset Demo")
      expect(hud.text).toBe("Fixed   ·   1/3 reachable")
      await sleep(80)
      view.expectNoCommand()
      expect(preview.caption.text).toBe("Care beacon")
      expect(await this.rotorSpeed(rotor)).toBeLessThan(0.05)

      pose.aim(0, 0)
      await preview.enableAdaptive()
      await this.dwellAction(view, pose, "Lamp marker", "Dim")
      const lamp = view.requireObject("Lamp illumination").getComponent("Component.LightSource")
      if (!lamp) throw new Error("Lamp light is missing")
      expect(lamp.enabled).toBe(true)
      expect(lamp.intensity).toBeLessThan(0.8)
      expect(lamp.intensity).toBeGreaterThan(0)
      await this.dwellAction(view, pose, "Lamp marker", "Off")
      expect(lamp.enabled).toBe(false)
      await this.dwellAction(view, pose, "Fan marker", "Low")
      const lowSpeed = await this.rotorSpeed(rotor)
      expect(lowSpeed).toBeGreaterThan(2)
      expect(lowSpeed).toBeLessThan(7)
      expect(lowSpeed).toBeLessThan(highSpeed)
      await this.dwellAction(view, pose, "Fan marker", "Off")
      expect(await this.rotorSpeed(rotor)).toBeLessThan(0.05)
      print("[GazeAnchor LEAF] T11 rotor High " + highSpeed.toFixed(2) +
        " rad/s | Low " + lowSpeed.toFixed(2) + " rad/s | Off stationary")
      await preview.tap("Reset Demo")
    } finally {
      pose.dispose()
    }
  }

  private async dwellAction(view: DwellScenarioView, pose: HeadPoseDriver,
                            markerName: string, actionName: string): Promise<void> {
    const marker = view.requireObject(markerName, view.root)
    pose.aimAt(marker.getTransform().getWorldPosition())
    const deadline = getTime() + 2.5
    let action = findSceneObjectByName(actionName, view.halo)
    while (!action && getTime() < deadline) {
      await sleep(20)
      action = findSceneObjectByName(actionName, view.halo)
    }
    if (!action) throw new Error("Dwell did not open " + markerName + " / " + actionName)
    pose.aimAt(action.getTransform().getWorldPosition())
    const selectionDeadline = getTime() + 2.25
    while (view.halo.getChildrenCount() > 0 && getTime() < selectionDeadline) await sleep(20)
    if (view.halo.getChildrenCount() > 0) {
      throw new Error("Dwell left the action menu open for " + markerName + " / " + actionName)
    }
  }

  private checkTrial(metrics: string, tasks: number, actions: number): void {
    expect(metrics.startsWith(tasks + "/3 tasks")).toBe(true)
    expect(metrics.endsWith(actions + " actions")).toBe(true)
    const match = metrics.match(/(\d+(?:\.\d+)?)° travel/)
    if (!match) throw new Error("Camera travel is missing from trial metrics: " + metrics)
    expect(Number(match[1])).toBeGreaterThan(0)
  }

  private async rotorSpeed(rotor: Transform): Promise<number> {
    const startRotation = rotor.getLocalRotation()
    const startTime = getTime()
    await sleep(75)
    const duration = getTime() - startTime
    const angle = quat.angleBetween(startRotation, rotor.getLocalRotation())
    return Math.min(angle, Math.PI * 2 - angle) / duration
  }
}
