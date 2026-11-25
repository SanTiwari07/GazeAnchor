import { Angles, Limits, angularDistance, inside, place, radians, restricted } from "./Reach"
import { button, label, node, panel } from "./GazeAnchorUI"
import { CaregiverCommBridge, careCategories } from "./room/CaregiverCommBridge"

type Target = {
  source: SceneObject; marker: SceneObject; caption: Text; tether: SceneObject;
  from: vec3; dest: vec3; proxy: boolean; reachable: boolean
}
type Action = { name: string; object: SceneObject }
const sweepSteps = ["Left", "Right", "Up", "Down", "Steady"] as const
const targetNames = ["Lamp", "Fan", "Care beacon"]
const profiles = [
  { label: "12° restricted preset", limits: restricted, dwell: 0.95, smoothing: 0.14 },
  { label: "25° moderate preset", limits: { left: -25, right: 25, down: -15, up: 15 }, dwell: 0.8, smoothing: 0.22 },
  { label: "45° wide preset", limits: { left: -45, right: 45, down: -25, up: 25 }, dwell: 0.65, smoothing: 0.35 }
]
const roomEye = new vec3(0, 120, 0)
const mint = new vec4(0.35, 1, 0.75, 1)
const amber = new vec4(1, 0.72, 0.26, 1)

@component
export class GazeAnchorMain extends BaseScriptComponent {
  @input camera!: Camera
  @input room!: SceneObject
  @input lamp!: SceneObject
  @input fan!: SceneObject
  @input care!: SceneObject
  @input rotor!: SceneObject
  @input shade!: RenderMeshVisual
  @input lampOn!: Material
  @input lampOff!: Material
  @input cube!: RenderMesh
  @input cyan!: Material
  @input ackClip!: AudioTrackAsset
  @input @hint("Head-pointing dwell threshold in seconds") dwellSeconds: number = 0.95

  private root!: SceneObject
  private view!: Transform
  private origin!: vec3
  private seatedOrigin!: vec3
  private right!: vec3
  private up!: vec3
  private forward!: vec3
  private gaze!: vec3
  private lastDirection!: vec3
  private limits: Limits = { ...restricted }
  private profileIndex = 0
  private measured = false
  private adaptive = false
  private targets: Target[] = []
  private boundary: SceneObject[] = []
  private movement = 1
  private hud!: Text
  private guide!: Text
  private benchmark!: Text
  private careLine!: Text
  private fanLine!: Text
  private operator!: SceneObject
  private sweepControls!: SceneObject
  private normalControls!: SceneObject
  private switchButton!: SceneObject
  private switchPrompt!: Text
  private switchChoices: number[] = []
  private switchIndex = 0
  private switchElapsed = 0
  private arrow!: SceneObject
  private ring: SceneObject[] = []
  private actions: Action[] = []
  private actionRoot!: SceneObject
  private open = -1
  private focus = -1
  private elapsed = 0
  private lookingAway = 0
  private cooldown = 0
  private lastActionPosition: vec3 | null = null
  private trackingAvailable = true
  private inputNeedsReseed = false
  private sweep = -1
  private sampleTime = 0
  private captureRequested = false
  private samples: number[] = []
  private motionNoise = 0
  private fanSpeed = 0
  private fanRotation = 0
  private readonly careBridge = new CaregiverCommBridge()
  private careTimestamp!: Text
  private lampDim!: Material
  private lampLight!: LightSource
  private deviceChimes: AudioComponent[] = []
  private offView = false
  private acknowledgmentCuePending = false
  private chime!: AudioComponent
  private travel = 0
  private lampOperated = false
  private fanHighSet = false
  private waterAcknowledged = false
  private aborts = 0
  private selections = 0
  private blockedByCooldown = 0
  private menuVersion = 0
  private reachableCount = 0
  private benchmarkState: "hidden" | "running" | "results" = "hidden"
  private trialStartedAt = 0
  private trialTasks = new Set<string>()
  private lastBenchmark = ""

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.start())
  }

  private start(): void {
    this.view = this.camera.getTransform()
    const tracking = this.camera.getSceneObject().getComponent("Component.DeviceTracking")
    tracking?.trackingStatus.onChange.add(available => {
      this.trackingAvailable = available
      this.interruptInput()
    })
    this.root = this.getSceneObject()
    this.root.createComponent("Component.Canvas")
    this.camera.getSceneObject().createComponent("Component.AudioListenerComponent")
    // Align the authored room's seated origin to the tracked starting position.
    this.seatedOrigin = this.view.getWorldPosition()
    const seatOffset = this.seatedOrigin.sub(roomEye)
    this.room.getTransform().setWorldPosition(this.room.getTransform().getWorldPosition().add(seatOffset))
    this.root.getTransform().setWorldPosition(seatOffset)
    this.setNeutral(false)
    this.gaze = this.view.back
    this.lastDirection = this.gaze

    this.targets = [this.lamp, this.fan, this.care].map((source, index) => {
      const marker = node(this.root, targetNames[index] + " marker")
      const caption = label(marker, "Target caption", targetNames[index], new vec3(0, 2.8, 0), 23, 2.05)
      this.box(marker, "Marker diamond").getTransform().setLocalScale(new vec3(1.15, 1.15, 0.25))
      const pos = source.getTransform().getWorldPosition()
      return { source, marker, caption, tether: this.box(this.root, targetNames[index] + " tether"),
        from: pos, dest: pos, proxy: false, reachable: false }
    })
    this.chime = this.targets[2].marker.createComponent("Component.AudioComponent")
    this.chime.audioTrack = this.ackClip
    this.chime.volume = 0.75
    this.chime.spatialAudio.enabled = true
    this.lampDim = this.lampOn.clone()
    this.lampDim.mainPass.baseColor = vec4.lerp(
      this.lampOff.mainPass.baseColor, this.lampOn.mainPass.baseColor, 0.45
    )
    this.lampLight = node(this.lamp, "Lamp illumination", new vec3(0, -12, 0))
      .createComponent("Component.LightSource")
    this.lampLight.lightType = LightType.Point
    this.lampLight.falloffType = FalloffType.Quadratic
    this.lampLight.falloffRange = 100
    this.lampLight.color = new vec3(1, 0.83, 0.55)
    this.deviceChimes = [this.lamp, this.fan].map(source => {
      const audio = source.createComponent("Component.AudioComponent")
      audio.audioTrack = this.ackClip
      audio.spatialAudio.enabled = true
      audio.volume = 0.22
      return audio
    })

    for (let i = 0; i < 4; i++) this.boundary.push(this.box(this.root, "Comfort boundary " + i))
    for (let i = 0; i < 24; i++) {
      const segment = this.box(this.root, "Dwell segment " + i)
      segment.getTransform().setLocalScale(new vec3(0.42, 0.42, 0.24))
      segment.enabled = false
      this.ring.push(segment)
    }
    this.actionRoot = node(this.root, "Focused actions")
    this.arrow = node(this.camera.getSceneObject(), "Ack direction")
    const cueMaterial = this.cyan.clone()
    cueMaterial.mainPass.baseColor = mint
    const strokes = [
      { name: "Shaft", x: -0.6, y: 0, length: 3.6, angle: 0 },
      { name: "Upper arrowhead", x: 1.05, y: 0.58, length: 1.8, angle: -45 },
      { name: "Lower arrowhead", x: 1.05, y: -0.58, length: 1.8, angle: 45 }
    ]
    for (const stroke of strokes) {
      const object = this.box(this.arrow, stroke.name)
      object.getComponent("Component.RenderMeshVisual").mainMaterial = cueMaterial
      const transform = object.getTransform()
      transform.setLocalPosition(new vec3(stroke.x, stroke.y, 0))
      transform.setLocalScale(new vec3(stroke.length, 0.28, 0.18))
      transform.setLocalRotation(quat.angleAxis(stroke.angle * radians, vec3.forward()))
    }
    this.arrow.enabled = false
    this.buildControls()
    this.resetDemo()
    this.createEvent("LateUpdateEvent").bind(() => this.update(getDeltaTime()))
  }

  private box(parent: SceneObject, name: string): SceneObject {
    const object = node(parent, name)
    const visual = object.createComponent("Component.RenderMeshVisual")
    visual.mesh = this.cube
    visual.mainMaterial = this.cyan
    return object
  }

  private buildControls(): void {
    const controls = node(this.root, "Seated controls")
    controls.getTransform().setWorldPosition(this.seatedOrigin)
    const hud = panel(controls, "Reachability and calibration", new vec3(0, 22, -110), 58, 11)
    this.hud = label(hud, "Reachability", "", new vec3(0, 2.5, 0), 57, 4)
    this.guide = label(hud, "Calibration prompt", "", new vec3(0, -2.4, 0), 57, 2.7)
    this.normalControls = node(controls, "Demo controls", new vec3(0, -21, -107))
    button(this.normalControls, "Guided sweep", new vec3(-21.3, 0, 0), 14, () => this.startSweep())
    button(this.normalControls, "Next profile", new vec3(-7.5, 0, 0), 12, () => this.nextProfile())
    button(this.normalControls, "Fixed / Adaptive", new vec3(7, 0, 0), 15, () => this.toggleMode())
    button(this.normalControls, "Caregiver sim", new vec3(21.5, 0, 0), 13, () => {
      this.closeActions()
      this.operator.enabled = !this.operator.enabled
    })
    button(this.normalControls, "Reset Calibration", new vec3(-20, -5.4, 0), 18, () => this.resetCalibration())
    button(this.normalControls, "Benchmark", new vec3(0, -5.4, 0), 15, () => this.toggleBenchmark())
    this.switchButton = button(this.normalControls, "Switch select", vec3.zero(), 12, () => this.switchSelect(), 3)
    this.switchPrompt = label(this.switchButton, "Switch focus", "", new vec3(0, 2.8, 0.65), 31, 1.65)
    button(this.normalControls, "Reset Demo", new vec3(20, -5.4, 0), 15, () => this.resetDemo())

    this.sweepControls = node(controls, "Sweep capture controls", new vec3(0, -17, -104))
    button(this.sweepControls, "Capture / Next", new vec3(-9, 0, 0), 15, () => { this.captureRequested = true })
    button(this.sweepControls, "Cancel", new vec3(9, 0, 0), 12, () => this.resetCalibration())

    this.operator = panel(controls, "Caregiver simulation", new vec3(0, -3, -96), 43, 17)
    label(this.operator, "Simulation title", "Simulated caregiver bridge", new vec3(0, 5.8, 0), 41, 2.15)
    this.careLine = label(this.operator, "Simulation state", "", new vec3(0, 1.8, 0), 41, 1.7)
    this.careTimestamp = label(this.operator, "Request timestamp", "", new vec3(0, -0.35, 0), 41, 1.25)
    button(this.operator, "Acknowledge", new vec3(-13.5, -3.9, 0), 13, () => this.acknowledge())
    button(this.operator, "Online / Offline", new vec3(0, -3.9, 0), 13, () => {
      this.careBridge.setOnline(!this.careBridge.online, getTime())
      this.showCare()
    })
    button(this.operator, "Complete", new vec3(13.5, -3.9, 0), 12, () => {
      if (this.careBridge.complete(getTime())) {
        this.offView = false
        this.acknowledgmentCuePending = false
        this.showCare()
      }
    })
    this.benchmark = label(controls, "Trial metrics", "", new vec3(0, -31, -110), 65, 2.5)
    this.fanLine = label(controls, "Fan state", "Fan off", new vec3(0, 15, -110), 36, 2.6)
  }

  private setNeutral(capture: boolean): void {
    this.origin = capture ? this.view.getWorldPosition() : this.seatedOrigin
    this.right = capture ? this.view.right : new vec3(1, 0, 0)
    this.up = capture ? this.view.up : new vec3(0, 1, 0)
    this.forward = capture ? this.view.back : new vec3(0, 0, -1)
  }

  private angles(direction: vec3): Angles {
    return { yaw: Math.atan2(direction.dot(this.right), direction.dot(this.forward)) / radians,
      pitch: Math.asin(Math.max(-1, Math.min(1, direction.dot(this.up)))) / radians }
  }

  private point(angle: Angles, depth: number): vec3 {
    const yaw = angle.yaw * radians
    const pitch = angle.pitch * radians
    return this.origin.add(this.forward.uniformScale(Math.cos(yaw) * Math.cos(pitch) * depth))
      .add(this.right.uniformScale(Math.sin(yaw) * Math.cos(pitch) * depth))
      .add(this.up.uniformScale(Math.sin(pitch) * depth))
  }

  private line(object: SceneObject, from: vec3, to: vec3, width: number): void {
    const delta = to.sub(from)
    const transform = object.getTransform()
    transform.setWorldPosition(vec3.lerp(from, to, 0.5))
    transform.setWorldScale(new vec3(width, width, Math.max(0.01, delta.length)))
    transform.setWorldRotation(quat.lookAt(delta.normalize(), Math.abs(delta.normalize().y) > 0.98
      ? new vec3(1, 0, 0) : vec3.up()))
  }

  private updatePlacement(animate: boolean): void {
    const sources = this.targets.map(target => target.source.getTransform().getWorldPosition())
    const angles = sources.map(source => {
      const direction = source.sub(this.origin)
      return direction.length > 0.001 ? this.angles(direction.normalize()) : { yaw: NaN, pitch: NaN }
    })
    const placements = place(angles, this.limits, this.adaptive)
    this.targets.forEach((target, index) => {
      const placement = placements[index]
      target.reachable = placement !== null
      target.proxy = placement !== null && !inside(angles[index], this.limits)
      target.from = animate ? target.marker.getTransform().getWorldPosition() : sources[index]
      target.dest = target.proxy && placement ? this.point(placement, 103) : sources[index]
    })
    this.movement = animate ? 0 : 1
    this.renderPlacement()
    const count = placements.filter(point => point !== null).length
    this.reachableCount = count
    this.hud.text = (this.adaptive ? "Adaptive" : "Fixed") + "   ·   " + count + "/3 reachable"
    const { left, right, down, up } = this.limits
    this.guide.text = (this.measured ? "Measured" : profiles[this.profileIndex].label) +
      "   Y " + left.toFixed(1) + "° / +" + right.toFixed(1) + "°   P " +
      down.toFixed(1) + "° / +" + up.toFixed(1) + "°"
    this.switchButton.getTransform().setWorldPosition(this.point({
      yaw: (left + right) * 0.5,
      pitch: down * 0.7
    }, 98))
    this.switchButton.getTransform().setWorldRotation(quat.lookAt(this.forward.uniformScale(-1), this.up))
    const corners = [
      { yaw: left, pitch: down }, { yaw: right, pitch: down },
      { yaw: right, pitch: up }, { yaw: left, pitch: up }
    ].map(angle => this.point(angle, 125))
    this.boundary.forEach((edge, index) => {
      edge.enabled = !this.adaptive
      this.line(edge, corners[index], corners[(index + 1) % 4], 0.13)
    })
    print("[GazeAnchor] " + this.hud.text + " | " + this.guide.text +
      " | " + JSON.stringify(placements))
  }

  private renderPlacement(): void {
    const t = this.movement * this.movement * (3 - 2 * this.movement)
    this.targets.forEach(target => {
      const position = vec3.lerp(target.from, target.dest, t)
      target.marker.getTransform().setWorldPosition(position)
      target.tether.enabled = target.proxy && t > 0.005
      if (target.tether.enabled) this.line(target.tether, position, target.source.getTransform().getWorldPosition(), 0.28)
    })
  }

  private startSweep(): void {
    this.closeActions()
    this.setNeutral(true)
    this.limits = { left: 0, right: 0, up: 0, down: 0 }
    this.measured = false
    this.sweep = 0
    this.sampleTime = 0
    this.samples = []
    this.captureRequested = false
    this.adaptive = false
    this.updatePlacement(false)
    this.normalControls.enabled = false
    this.sweepControls.enabled = true
    this.operator.enabled = false
    this.guide.text = "Look comfortably LEFT, then click Capture / Next"
  }

  private sampleSweep(dt: number, current: Angles): void {
    const step = sweepSteps[this.sweep]
    this.sampleTime += dt
    if (step === "Left") this.limits.left = Math.min(this.limits.left, current.yaw)
    if (step === "Right") this.limits.right = Math.max(this.limits.right, current.yaw)
    if (step === "Up") this.limits.up = Math.max(this.limits.up, current.pitch)
    if (step === "Down") this.limits.down = Math.min(this.limits.down, current.pitch)
    if (step === "Steady") {
      if (Math.hypot(current.yaw, current.pitch) > 2.5) {
        this.sampleTime = 0
        this.samples = []
        return
      }
      this.samples.push(angularDistance(this.lastDirection, this.view.back))
      if (this.sampleTime < 2) return
      const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length
      this.motionNoise = Math.sqrt(this.samples.reduce((a, b) => a + (b - mean) ** 2, 0) / this.samples.length)
      this.sweep = -1
      this.measured = true
      this.normalControls.enabled = true
      this.sweepControls.enabled = false
      this.updatePlacement(false)
      if (this.limits.left > -1 || this.limits.right < 1 || this.limits.down > -1 || this.limits.up < 1) {
        this.guide.text = "Incomplete sweep. Retry or use the 12° preset."
      }
      return
    }
    if (!this.captureRequested) return
    this.captureRequested = false
    const bound = this.limits[step.toLowerCase() as keyof Limits]
    if (Math.abs(bound) < 1) {
      this.guide.text = "Look " + step.toUpperCase() + " before capturing"
      print("[GazeAnchor] Sweep capture rejected | " + step)
      return
    }
    print("[GazeAnchor] Sweep captured | " + step + " " + bound.toFixed(2) + "°")
    this.sampleTime = 0
    this.sweep++
    const next = sweepSteps[this.sweep]
    this.guide.text = next === "Steady" ? "Return to neutral and hold steady for 2 s" :
      "Look comfortably " + next.toUpperCase() + ", then click Capture / Next"
  }

  private resetCalibration(profileIndex = 0): void {
    this.closeActions()
    this.sweep = -1
    this.captureRequested = false
    this.motionNoise = 0
    this.setNeutral(false)
    this.limits = { ...profiles[profileIndex].limits }
    this.profileIndex = profileIndex
    this.measured = false
    this.adaptive = false
    this.offView = false
    this.acknowledgmentCuePending = false
    this.chime.stop(false)
    this.arrow.enabled = false
    this.normalControls.enabled = true
    this.sweepControls.enabled = false
    this.startTrial()
    this.updatePlacement(false)
  }

  private resetDemo(): void {
    this.resetCalibration()
    this.cooldown = 0
    this.operator.enabled = false
    this.lampOperated = false
    this.fanHighSet = false
    this.waterAcknowledged = false
    this.fanSpeed = 0
    this.fanRotation = 0
    this.rotor.getTransform().setLocalRotation(quat.angleAxis(0, vec3.forward()))
    this.fanLine.text = "Fan off"
    this.shade.mainMaterial = this.lampOff
    this.lampLight.enabled = false
    this.deviceChimes.forEach(audio => audio.stop(false))
    this.careBridge.reset()
    this.showCare()
    print("[GazeAnchor] Reset Demo")
  }

  private nextProfile(): void {
    const next = this.measured ? 0 : (this.profileIndex + 1) % profiles.length
    this.resetCalibration(next)
  }

  private toggleMode(): void {
    this.closeActions()
    this.adaptive = !this.adaptive
    this.startTrial()
    this.updatePlacement(true)
  }

  private startTrial(): void {
    this.benchmarkState = "hidden"
    this.benchmark.enabled = false
    this.travel = 0
    this.aborts = 0
    this.selections = 0
    this.blockedByCooldown = 0
    this.trialTasks.clear()
    this.lastDirection = this.view.back
    this.gaze = this.lastDirection
    this.lastActionPosition = null
  }

  private toggleBenchmark(): void {
    if (this.benchmarkState === "running") {
      this.finishTrial()
    } else if (this.benchmarkState === "results") {
      this.startTrial()
    } else {
      this.closeActions()
      this.startTrial()
      this.benchmarkState = "running"
      this.trialStartedAt = getTime()
      this.benchmark.enabled = true
      print("[GazeAnchor] Trial started | " + this.hud.text)
    }
  }

  private finishTrial(): void {
    const duration = getTime() - this.trialStartedAt
    const tasks = this.trialTasks.size
    const summary = {
      mode: this.adaptive ? "Adaptive" : "Fixed",
      limits: this.limits,
      reachableTargetsCount: this.reachableCount,
      cumulativeHeadRotationDeg: Number(this.travel.toFixed(2)),
      trialDurationSec: Number(duration.toFixed(2)),
      taskCompletionTimeSec: tasks === 3 ? Number(duration.toFixed(2)) : null,
      successfulSelections: this.selections,
      accidentalAborts: this.aborts,
      blockedByCooldownCount: this.blockedByCooldown,
      completedTasks: tasks
    }
    this.benchmark.text = tasks + "/3 tasks   ·   " + duration.toFixed(1) + " s   ·   " +
      this.travel.toFixed(1) + "° travel   ·   " + this.selections + " actions"
    this.benchmarkState = "results"
    print("[GazeAnchor] Trial ended | " + JSON.stringify(summary))
  }

  private showCare(): void {
    const { state, category, online, requestedAt } = this.careBridge
    this.careLine.text = (online ? "Sim online" : "Sim offline") + "   ·   " +
      (category ? category + " · " : "") + state
    this.careTimestamp.text = requestedAt === null ? "" : "Requested at +" + requestedAt.toFixed(1) + " s"
    const caption = this.targets[2].caption
    caption.text = state === "Idle" ? "Care beacon" : category + " · " + state
    const color = state === "Acknowledged" || state === "Completed" ? mint :
      state === "Delivery failed" ? new vec4(1, 0.46, 0.39, 1) :
      state === "Pending" || state === "Delivered" ? amber : new vec4(0.91, 0.97, 1, 1)
    caption.textFill.color = color
    this.careLine.textFill.color = color
  }

  private acknowledge(): void {
    if (!this.careBridge.acknowledge(getTime())) return
    if (this.careBridge.category === "Water") {
      this.waterAcknowledged = true
      if (this.benchmarkState === "running" && (this.careBridge.requestedAt ?? -1) >= this.trialStartedAt) {
        this.trialTasks.add("Water")
      }
    }
    this.acknowledgmentCuePending = true
    this.showCare()
    if (this.benchmarkState === "running" && this.trialTasks.size === 3) this.finishTrial()
  }

  private ackInView(yawLimit: number, pitchLimit: number): boolean {
    const direction = this.targets[2].marker.getTransform().getWorldPosition().sub(this.view.getWorldPosition()).normalize()
    const yaw = Math.atan2(direction.dot(this.view.right), direction.dot(this.view.back)) / radians
    const pitch = Math.asin(Math.max(-1, Math.min(1, direction.dot(this.view.up)))) / radians
    return Math.abs(yaw) <= yawLimit && Math.abs(pitch) <= pitchLimit
  }

  private updateCue(): void {
    if (this.acknowledgmentCuePending) {
      this.acknowledgmentCuePending = false
      this.offView = !this.ackInView(14, 16)
      if (this.offView) this.chime.play(1)
      print("[GazeAnchor] Care acknowledged | chime=" + this.offView + " | task " + this.taskProgress() + "/3")
    }
    if (this.offView && this.ackInView(10, 10)) {
      this.offView = false
      print("[GazeAnchor] Acknowledgment cue cleared")
    }
    this.arrow.enabled = this.offView
    if (!this.offView) return
    const target = this.targets[2].marker.getTransform().getWorldPosition().sub(this.view.getWorldPosition())
    const angle = Math.atan2(target.dot(this.view.up), target.dot(this.view.right))
    const transform = this.arrow.getTransform()
    transform.setLocalPosition(new vec3(17 * Math.cos(angle), 15 * Math.sin(angle), -85))
    transform.setLocalRotation(quat.angleAxis(angle, vec3.forward()))
  }

  private showActions(index: number, moreRequests = false): void {
    this.clearDwell()
    this.open = index
    const menuVersion = ++this.menuVersion
    this.lookingAway = 0
    const state = this.careBridge.state
    const canRequest = state === "Idle" || state === "Completed"
    const names = index === 0 ? ["On", "Dim", "Off"] : index === 1 ? ["Low", "High", "Off"] :
      state === "Delivery failed" ? ["Retry", "Cancel"] :
        !canRequest ? ["Close"] : moreRequests ? ["Temperature", "Assistance", "Back"] :
          ["Water", "Reposition", "More"]
    const angle = this.angles(this.targets[index].dest.sub(this.origin).normalize())
    const width = 8.5
    const horizontalStep = 5.5
    const span = (names.length - 1) / 2
    const yawMargin = 2.5
    const pitchRange = this.limits.up - this.limits.down
    const vertical = names.length > 1 &&
      this.limits.right - this.limits.left < 2 * (yawMargin + span * horizontalStep)
    const height = vertical ? Math.min(4.2, 103 * pitchRange * radians / names.length * 0.72) : 4.2
    const verticalStep = vertical ? Math.min(3.1, pitchRange / names.length) : 0
    const pitchMargin = height / (2 * 103 * radians)
    const clamp = (value: number, low: number, high: number) =>
      low <= high ? Math.max(low, Math.min(high, value)) : (low + high) * 0.5
    const horizontalSpan = vertical ? 0 : span * horizontalStep
    const verticalSpan = span * verticalStep
    const yaw = clamp(angle.yaw, this.limits.left + yawMargin + horizontalSpan,
      this.limits.right - yawMargin - horizontalSpan)
    const pitch = clamp(angle.pitch > 0 ? this.limits.down : this.limits.up,
      this.limits.down + pitchMargin + verticalSpan, this.limits.up - pitchMargin - verticalSpan)
    this.actions = names.map((name, i) => {
      const offset = i - span
      const location = this.point({ yaw: yaw + (vertical ? 0 : offset * horizontalStep),
        pitch: pitch + offset * verticalStep }, 103)
      const object = button(this.actionRoot, name, vec3.zero(), width,
        () => this.selectAction(name, menuVersion), height)
      object.getTransform().setWorldPosition(location)
      object.getTransform().setWorldRotation(quat.lookAt(this.forward.uniformScale(-1), this.up))
      return { name, object }
    })
    print("[GazeAnchor] Actions opened | " + targetNames[index])
  }

  private switchSelect(): void {
    if (!this.canSelect()) return
    const scanning = this.switchChoices.length > 0
    const index = scanning ? this.switchChoices[this.switchIndex] : this.focus
    if (index < 0) {
      if (scanning) this.closeActions()
      else this.startSwitchScan()
      return
    }
    if (this.open < 0) {
      this.showActions(index)
      if (scanning) this.startSwitchScan()
      return
    }
    const action = this.actions[index]
    if (!action) return
    this.selectAction(action.name)
    if (scanning && this.open >= 0) this.startSwitchScan()
  }

  private startSwitchScan(): void {
    this.clearDwell()
    this.switchChoices = this.open >= 0 ? this.actions.map((_, i) => i) :
      this.targets.flatMap((target, i) => target.reachable ? [i] : [])
    if (this.switchChoices.length === 0) {
      this.switchPrompt.text = "No reachable control"
      return
    }
    this.switchChoices.push(-1)
    this.switchIndex = 0
    this.switchElapsed = 0
    this.showSwitchFocus()
  }

  private showSwitchFocus(): void {
    const index = this.switchChoices[this.switchIndex]
    const name = index < 0 ? "Exit" : this.open < 0 ? targetNames[index] : this.actions[index].name
    this.switchPrompt.text = "Select " + name
  }

  private canSelect(): boolean {
    return this.trackingAvailable && !this.inputNeedsReseed && this.cooldown <= 0 && this.movement === 1 &&
      this.sweep < 0 && !this.operator.enabled
  }

  private selectAction(name: string, menuVersion = this.menuVersion): void {
    if (this.cooldown > 0) {
      this.blockedByCooldown++
      return
    }
    if (menuVersion !== this.menuVersion) return
    const target = this.open
    if (target < 0 || !this.canSelect()) return
    const choice = this.actions.find(action => action.name === name)
    if (!choice) return
    const chosenPosition = choice.object.getTransform().getWorldPosition()
    this.closeActions()
    if (name === "More" || name === "Back") {
      this.showActions(target, name === "More")
      return
    }
    this.cooldown = 0.45
    if (name === "Cancel" || name === "Close") return
    this.lastActionPosition = chosenPosition
    if (target === 0) {
      this.shade.mainMaterial = name === "On" ? this.lampOn : name === "Dim" ? this.lampDim : this.lampOff
      this.lampLight.enabled = name !== "Off"
      this.lampLight.intensity = name === "Dim" ? 0.28 : 0.8
      this.lampOperated = true
      if (this.benchmarkState === "running") this.trialTasks.add("Lamp")
    }
    if (target === 1) {
      this.fanSpeed = name === "High" ? 12 : name === "Low" ? 4 : 0
      this.fanLine.text = "Fan " + name.toLowerCase()
      if (name === "High") {
        this.fanHighSet = true
        if (this.benchmarkState === "running") this.trialTasks.add("Fan")
      }
    }
    if (target === 2) {
      const now = getTime()
      const category = careCategories.find(candidate => candidate === name)
      const changed = category ? this.careBridge.request(category, now) :
        name === "Retry" && this.careBridge.retry(now)
      if (!changed) return
      this.showCare()
    }
    if (target < 2) {
      this.deviceChimes[target].play(1)
      this.selections++
    }
    print("[GazeAnchor] Selection " + targetNames[target] + " / " + name +
      " | " + this.travel.toFixed(1) + "° | " + this.careBridge.state)
    if (this.benchmarkState === "running" && this.trialTasks.size === 3) this.finishTrial()
  }

  private taskProgress(): number {
    return Number(this.lampOperated) + Number(this.fanHighSet) + Number(this.waterAcknowledged)
  }

  private closeActions(): void {
    this.actions.forEach(action => action.object.destroy())
    this.actions = []
    this.open = -1
    this.menuVersion++
    this.switchChoices = []
    if (this.switchPrompt) this.switchPrompt.text = ""
    this.clearDwell()
  }

  private clearDwell(): void {
    if (this.focus < 0 && this.elapsed === 0) return
    this.focus = -1
    this.elapsed = 0
    this.ring.forEach(segment => segment.enabled = false)
  }

  private updateDwell(dt: number, raw: vec3): void {
    if (!this.canSelect()) return
    if (this.switchChoices.length > 0) {
      this.switchElapsed += dt
      if (this.switchElapsed >= 1.25) {
        this.switchElapsed = 0
        this.switchIndex = (this.switchIndex + 1) % this.switchChoices.length
        this.showSwitchFocus()
      }
      return
    }
    const isAction = this.open >= 0
    const size = isAction ? this.actions.length : this.targets.length
    const cameraPos = this.view.getWorldPosition()
    const cone = Math.min(4.2, 2.45 + this.motionNoise * 0.6)
    if (this.lastActionPosition) {
      const selectedDirection = this.lastActionPosition.sub(cameraPos).normalize()
      if (angularDistance(raw, selectedDirection) < cone * 1.45) return
      this.lastActionPosition = null
    }
    let closest = -1
    let best = cone
    let focusPosition: vec3 | null = null
    for (let i = 0; i < size; i++) {
      if (!isAction && !this.targets[i].reachable) continue
      const object = isAction ? this.actions[i].object : this.targets[i].marker
      const position = object.getTransform().getWorldPosition()
      const direction = position.sub(cameraPos).normalize()
      const angle = angularDistance(this.gaze, direction)
      if (angle < best && angularDistance(raw, direction) < cone * 1.45) {
        closest = i
        best = angle
        focusPosition = position
      }
    }
    if (closest !== this.focus) {
      if (!isAction && this.elapsed > 0.2) {
        this.aborts++
        print("[GazeAnchor] Dwell cancelled | " + this.elapsed.toFixed(3) + " s")
      }
      this.clearDwell()
      this.focus = closest
    }
    if (focusPosition === null) {
      if (isAction) {
        this.lookingAway += dt
        if (this.lookingAway > 1.2) this.closeActions()
      }
      return
    }
    this.lookingAway = 0
    this.elapsed += dt
    const configured = this.profileIndex === 0 ? this.dwellSeconds : profiles[this.profileIndex].dwell
    const threshold = Math.max(0.5, Math.min(1.4, configured)) * (isAction ? 0.75 : 1)
    const position = focusPosition
    this.ring.forEach((segment, i) => {
      segment.enabled = i < Math.floor(this.elapsed / threshold * this.ring.length)
      if (segment.enabled) {
        const angle = (90 - i * 15) * radians
        const radius = isAction ? 4.8 : 2.4
        segment.getTransform().setWorldPosition(position.add(this.right.uniformScale(radius * Math.cos(angle)))
          .add(this.up.uniformScale(radius * Math.sin(angle))).add(this.forward.uniformScale(-0.9)))
      }
    })
    if (this.elapsed < threshold) return
    if (isAction) this.selectAction(this.actions[closest].name)
    else this.showActions(closest)
  }

  private interruptInput(): void {
    this.closeActions()
    this.inputNeedsReseed = true
    this.captureRequested = false
    if (this.sweep === 4) {
      this.sampleTime = 0
      this.samples = []
    }
  }

  private update(dt: number): void {
    if (this.careBridge.update(dt, getTime())) {
      this.showCare()
      this.selections++
      print("[GazeAnchor] Care delivered | " + this.careBridge.category)
    }
    if (!this.trackingAvailable) return
    if (!(dt > 0 && dt <= 0.25)) {
      this.interruptInput()
      return
    }
    const raw = this.view.back
    if (!Number.isFinite(raw.length) || raw.length < 0.001) {
      this.interruptInput()
      return
    }
    if (this.inputNeedsReseed) {
      this.gaze = raw
      this.lastDirection = raw
      this.inputNeedsReseed = false
    }
    const smoothing = this.measured ? Math.max(0.12, 0.38 - 0.1 * this.motionNoise) :
      profiles[this.profileIndex].smoothing
    this.gaze = vec3.lerp(this.gaze, raw, smoothing).normalize()
    if (this.benchmarkState === "running") this.travel += angularDistance(this.lastDirection, raw)
    if (this.sweep >= 0) this.sampleSweep(dt, this.angles(raw))
    else this.updateDwell(dt, raw)
    this.lastDirection = raw
    this.cooldown = Math.max(0, this.cooldown - dt)
    if (this.movement < 1) {
      this.movement = Math.min(1, this.movement + dt / 0.65)
      this.renderPlacement()
    }
    if (this.fanSpeed > 0) {
      this.fanRotation = (this.fanRotation + this.fanSpeed * dt) % (Math.PI * 2)
      this.rotor.getTransform().setLocalRotation(quat.angleAxis(this.fanRotation, vec3.forward()))
    }
    this.updateCue()
    if (this.benchmarkState !== "results") {
      const metrics = this.selections + " actions   ·   " + this.travel.toFixed(0) +
        "° travel   ·   " + this.aborts + " cancelled glances"
      if (metrics !== this.lastBenchmark || this.benchmark.text !== metrics) {
        this.lastBenchmark = metrics
        this.benchmark.text = metrics
      }
    }
  }
}
