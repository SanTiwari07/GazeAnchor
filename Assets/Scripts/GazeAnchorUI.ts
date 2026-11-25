import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"

const white = new vec4(0.91, 0.97, 1, 1)

export function node(parent: SceneObject, name: string, position = vec3.zero()): SceneObject {
  const object = global.scene.createSceneObject(name)
  object.setParent(parent)
  object.getTransform().setLocalPosition(position)
  return object
}

export function label(parent: SceneObject, name: string, value: string, position: vec3,
                      width: number, size: number): Text {
  const text = node(parent, name, position).createComponent("Component.Text")
  text.text = value
  text.size = size * 19
  text.layoutRect = Rect.create(-width / 2, width / 2, -size * 1.1, size * 1.1)
  text.horizontalOverflow = HorizontalOverflow.Overflow
  text.verticalOverflow = VerticalOverflow.Overflow
  text.horizontalAlignment = HorizontalAlignment.Center
  text.verticalAlignment = VerticalAlignment.Center
  text.textFill.color = white
  return text
}

export function button(parent: SceneObject, value: string, position: vec3,
                       width: number, callback: () => void, height = 4.2): SceneObject {
  const object = node(parent, value, position)
  const control = object.createComponent(Button.getTypeName()) as Button
  control.size = new vec3(width, height, 0.7)
  control.onTriggerUp.add(callback)
  label(object, "Button label", value, new vec3(0, 0, 0.65), width - 0.4, Math.min(2.8, height * 0.72))
  return object
}

export function panel(parent: SceneObject, name: string, position: vec3, width: number, height: number): SceneObject {
  const root = node(parent, name, position)
  const back = node(root, "Backing", new vec3(0, 0, -0.65)).createComponent(BackPlate.getTypeName()) as BackPlate
  back.size = new vec2(width, height)
  return root
}
