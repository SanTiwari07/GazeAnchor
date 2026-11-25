import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils"
import { GazeAnchorMain } from "../GazeAnchorMain"

export class DwellScenarioView {
  readonly root = this.requireObject("GazeAnchor Controls")
  readonly lamp = this.requireObject("Lamp marker", this.root)
  readonly halo = this.requireObject("Focused actions", this.root)
  readonly firstSegment = this.requireObject("Dwell segment 0", this.root)
  readonly controller = this.root.getComponent(GazeAnchorMain.getTypeName()) as GazeAnchorMain

  constructor() {
    if (!this.controller) throw new Error("GazeAnchor controller is missing")
  }

  requireObject(name: string, root?: SceneObject): SceneObject {
    const object = findSceneObjectByName(name, root)
    if (!object) throw new Error("Scene object missing: " + name)
    return object
  }

  async waitForDwell(): Promise<void> {
    const deadline = getTime() + 1.5
    while (!this.firstSegment.enabled && getTime() < deadline) await sleep(10)
    expect(this.firstSegment.enabled).toBe(true)
  }

  expectNoCommand(): void {
    const metrics = this.requireObject("Trial metrics", this.root).getComponent("Component.Text")
    const lampLight = this.requireObject("Lamp illumination").getComponent("Component.LightSource")
    if (!metrics || !lampLight) throw new Error("Trial metrics or lamp illumination is missing")
    expect(metrics.text.startsWith("0 actions")).toBe(true)
    expect(lampLight.enabled).toBe(false)
  }
}
