import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { findSceneObjectByName, sleep, withTimeout } from "Leaf.lspkg/Utils/common/Utils"

export class CaregiverPreviewControls {
  readonly caption: Text
  readonly simulationState: Text
  readonly timestamp: Text
  private readonly root: SceneObject
  private readonly switchFocus: Text
  private readonly hand = new DefaultLeafInteractor()

  constructor() {
    const root = findSceneObjectByName("GazeAnchor Controls")
    if (!root) throw new Error("GazeAnchor Controls is missing")
    this.root = root
    this.caption = this.text("Target caption", this.object("Care beacon marker", root))
    this.simulationState = this.text("Simulation state", root)
    this.timestamp = this.text("Request timestamp", root)
    this.switchFocus = this.text("Switch focus", root)
  }

  async enableAdaptive(): Promise<void> {
    await this.tap("Fixed / Adaptive")
    await this.waitForText(this.text("Reachability", this.root), "Adaptive   ·   3/3 reachable")
    await sleep(750)
  }

  async selectCareAction(action: string, secondPage = false): Promise<void> {
    await this.tap("Switch select")
    await this.waitForText(this.switchFocus, "Select Care beacon", 6000)
    await this.tap("Switch select")
    if (secondPage) {
      await this.waitForText(this.switchFocus, "Select More", 6000)
      await this.tap("Switch select")
      // Leave a released interval before pressing the same switch on the new page.
      await sleep(250)
    }
    await this.waitForText(this.switchFocus, "Select " + action, 6000)
    await this.tap("Switch select")
  }

  async tap(name: string): Promise<void> {
    const target = findInteractableByName(name, this.root, true)
    if (!target) throw new Error("Enabled SIK Interactable missing: " + name)
    await withTimeout(this.hand.trigger(target), 3500, "LEAF trigger timed out: " + name)
  }

  async waitForText(text: Text, expected: string, timeoutMs = 2500): Promise<void> {
    const deadline = getTime() + timeoutMs / 1000
    while (text.text !== expected) {
      if (getTime() >= deadline) {
        throw new Error("Expected '" + expected + "' but found '" + text.text + "'")
      }
      await sleep(25)
    }
  }

  private text(name: string, root: SceneObject): Text {
    const text = this.object(name, root).getComponent("Component.Text")
    if (!text) throw new Error("Text component missing: " + name)
    return text
  }

  private object(name: string, root: SceneObject): SceneObject {
    const object = findSceneObjectByName(name, root)
    if (!object) throw new Error("Scene object missing: " + name)
    return object
  }
}
