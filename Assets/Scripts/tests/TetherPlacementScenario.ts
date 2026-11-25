import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { IKBodyInteractor } from "Leaf.lspkg/Interactors/interactor/ik/IKBodyInteractor"
import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep, withTimeout } from "Leaf.lspkg/Utils/common/Utils"

@component
export class TetherPlacementScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(100)
    const camera = this.object("Camera Object").getTransform()
    const origin = camera.getWorldPosition()
    const root = this.object("GazeAnchor Controls")
    const hud = this.object("Reachability", root).getComponent("Component.Text")
    const lamp = this.object("Lamp marker", root).getTransform()
    const lampAnchor = this.object("Lamp object anchor").getTransform().getWorldPosition()
    const fan = this.object("Fan marker", root)
    const care = this.object("Care beacon marker", root)
    const fanTether = this.object("Fan tether", root)
    const careTether = this.object("Care beacon tether", root)
    const toggle = findInteractableByName("Fixed / Adaptive", root, true)
    if (!toggle) throw new Error("Fixed / Adaptive has no enabled SIK Interactable")

    expect(hud.text).toBe("Fixed   ·   1/3 reachable")
    expect(lamp.getWorldPosition().distance(lampAnchor)).toBeLessThan(0.1)
    expect(fanTether.enabled).toBe(false)
    expect(careTether.enabled).toBe(false)

    const body = new IKBodyInteractor()
    await body.ready
    await withTimeout(body.trigger(toggle), 8000, "IK did not trigger Fixed / Adaptive")
    await sleep(750)

    expect(hud.text).toBe("Adaptive   ·   3/3 reachable")
    expect(lamp.getWorldPosition().distance(lampAnchor)).toBeLessThan(0.1)
    expect(this.object("Lamp tether", root).enabled).toBe(false)
    this.checkProxy(origin, fan, fanTether, this.object("Fan object anchor"))
    this.checkProxy(origin, care, careTether, this.object("Care beacon object anchor"))
    const separation = fan.getTransform().getWorldPosition().distance(care.getTransform().getWorldPosition())
    expect(separation).toBeGreaterThan(11.99)
    print("[GazeAnchor LEAF] T02 fan/care proxy separation " + separation.toFixed(2) + " cm")
  }

  private object(name: string, root?: SceneObject): SceneObject {
    const object = findSceneObjectByName(name, root)
    if (!object) throw new Error("Scene object missing: " + name)
    return object
  }

  private checkProxy(origin: vec3, marker: SceneObject, tether: SceneObject, anchor: SceneObject): void {
    const from = marker.getTransform().getWorldPosition()
    const to = anchor.getTransform().getWorldPosition()
    const displacement = from.sub(origin)
    const yaw = Math.atan2(displacement.x, -displacement.z) * MathUtils.RadToDeg
    const pitch = Math.asin(displacement.y / displacement.length) * MathUtils.RadToDeg
    expect(Math.abs(yaw)).toBeGreaterThan(4.49)
    expect(Math.abs(yaw)).toBeLessThan(10.21)
    expect(Math.abs(pitch)).toBeLessThan(6.81)
    expect(displacement.length).toBeCloseTo(103, 0)
    expect(tether.enabled).toBe(true)

    const transform = tether.getTransform()
    const center = transform.getWorldPosition()
    const half = transform.forward.uniformScale(transform.getWorldScale().z / 2)
    const start = center.sub(half)
    const end = center.add(half)
    const endpointError = Math.min(start.distance(from) + end.distance(to), start.distance(to) + end.distance(from))
    expect(endpointError).toBeLessThan(0.2)
  }
}
