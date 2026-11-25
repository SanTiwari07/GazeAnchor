export const careCategories = ["Water", "Reposition", "Temperature", "Assistance"] as const
export type CareCategory = typeof careCategories[number]

export type CareRequestState =
  "Idle" | "Pending" | "Delivered" | "Acknowledged" | "Completed" | "Delivery failed"

export class CaregiverCommBridge {
  private readonly deliverySeconds: number
  private currentState: CareRequestState = "Idle"
  private currentCategory: CareCategory | null = null
  private connected = true
  private elapsed = 0
  private lastTransition: number | null = null
  private requestTimestamp: number | null = null

  constructor(deliverySeconds = 0.25) {
    if (!Number.isFinite(deliverySeconds) || deliverySeconds <= 0) {
      throw new RangeError("Delivery duration must be positive and finite")
    }
    this.deliverySeconds = deliverySeconds
  }

  get state(): CareRequestState {
    return this.currentState
  }

  get category(): CareCategory | null {
    return this.currentCategory
  }

  get online(): boolean {
    return this.connected
  }

  get changedAt(): number | null {
    return this.lastTransition
  }

  get requestedAt(): number | null {
    return this.requestTimestamp
  }

  request(category: CareCategory, now: number): boolean {
    if (!this.isValidTime(now) || !careCategories.includes(category)) return false
    if (this.currentState !== "Idle" && this.currentState !== "Completed") return false

    this.currentCategory = category
    this.requestTimestamp = now
    return this.beginDelivery(now)
  }

  retry(now: number): boolean {
    if (this.currentState !== "Delivery failed" || !this.isValidTime(now)) return false
    if (!this.connected) return false

    return this.beginDelivery(now)
  }

  setOnline(online: boolean, now: number): boolean {
    if (!this.isValidTime(now) || online === this.connected) return false

    this.connected = online
    if (!online && this.currentState === "Pending") {
      this.transition("Delivery failed", now)
    }
    return true
  }

  update(dt: number, now: number): boolean {
    if (this.currentState !== "Pending" || !this.isValidTime(now)) return false
    if (!Number.isFinite(dt) || dt <= 0) return false

    this.elapsed += dt
    if (this.elapsed < this.deliverySeconds) return false
    return this.transition("Delivered", now)
  }

  acknowledge(now: number): boolean {
    if (this.currentState !== "Delivered" || !this.isValidTime(now)) return false
    return this.transition("Acknowledged", now)
  }

  complete(now: number): boolean {
    if (this.currentState !== "Acknowledged" || !this.isValidTime(now)) return false
    return this.transition("Completed", now)
  }

  reset(): void {
    this.currentState = "Idle"
    this.currentCategory = null
    this.connected = true
    this.elapsed = 0
    this.lastTransition = null
    this.requestTimestamp = null
  }

  private isValidTime(now: number): boolean {
    return Number.isFinite(now) && (this.lastTransition === null || now >= this.lastTransition)
  }

  private beginDelivery(now: number): boolean {
    this.elapsed = 0
    return this.transition(this.connected ? "Pending" : "Delivery failed", now)
  }

  private transition(state: CareRequestState, now: number): true {
    this.currentState = state
    this.lastTransition = now
    return true
  }
}
