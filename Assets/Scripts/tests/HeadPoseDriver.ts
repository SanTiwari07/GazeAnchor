import { lookAtRotation } from "Leaf.lspkg/IKSolver/MathUtils"
import { UpdateDispatcher } from "Leaf.lspkg/Utils/common/UpdateDispatcher"
import { findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"

const degreesToRadians = Math.PI / 180

export class HeadPoseDriver {
  readonly camera: Camera
  readonly transform: Transform
  private readonly neutralRotation: quat
  private readonly neutralForward: vec3
  private readonly neutralRight: vec3
  private readonly neutralUp: vec3
  private readonly unsubscribe: () => void
  private target?: vec3
  private jitter = 0
  private jitterHz = 4
  private startTime = 0

  constructor() {
    const camera = findSceneObjectByName("Camera Object")?.getComponent("Component.Camera")
    if (!camera) throw new Error("GazeAnchor's authored Camera Object is missing")
    this.camera = camera
    this.transform = camera.getTransform()
    this.neutralRotation = this.transform.getWorldRotation()
    this.neutralForward = this.transform.back
    this.neutralRight = this.transform.right
    this.neutralUp = this.transform.up
    // LEAF's IKBodyInteractor drives the camera from this same Update dispatcher.
    this.unsubscribe = UpdateDispatcher.getInstance().onUpdate.add(() => this.apply())
  }

  point(yawDeg: number, pitchDeg: number, distanceCm = 100): vec3 {
    const yaw = yawDeg * degreesToRadians
    const pitch = pitchDeg * degreesToRadians
    return this.transform.getWorldPosition()
      .add(this.neutralForward.uniformScale(Math.cos(yaw) * Math.cos(pitch) * distanceCm))
      .add(this.neutralRight.uniformScale(Math.sin(yaw) * Math.cos(pitch) * distanceCm))
      .add(this.neutralUp.uniformScale(Math.sin(pitch) * distanceCm))
  }

  aim(yawDeg: number, pitchDeg: number): void {
    this.aimAt(this.point(yawDeg, pitchDeg))
  }

  aimAt(worldPoint: vec3, jitterDeg = 0, jitterHz = 4): void {
    this.target = worldPoint
    this.jitter = jitterDeg * degreesToRadians
    this.jitterHz = jitterHz
    this.startTime = getTime()
    this.apply()
  }

  dispose(): void {
    this.unsubscribe()
    this.transform.setWorldRotation(this.neutralRotation)
  }

  private apply(): void {
    if (!this.target) return
    const origin = this.transform.getWorldPosition()
    let target = this.target
    if (this.jitter !== 0) {
      const yaw = this.jitter * Math.sin(2 * Math.PI * this.jitterHz * (getTime() - this.startTime))
      const jitterRotation = quat.angleAxis(yaw, this.neutralUp)
      target = origin.add(jitterRotation.multiplyVec3(target.sub(origin)))
    }
    // The authored camera views along local -Z.
    this.transform.setWorldRotation(lookAtRotation(target, origin))
  }
}
