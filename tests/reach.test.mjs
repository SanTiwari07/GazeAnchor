import assert from "node:assert/strict"
import test from "node:test"
import { angularDistance, inside, place, radians, restricted, separation } from "../Assets/Scripts/Reach.ts"

// Authored target offsets from the seated neutral frame, in centimeters.
const roomTargets = [
  [-20, -8, -110],
  [78, -6, -112],
  [44, -12, -105]
].map(([x, y, z]) => ({
  yaw: Math.atan2(x, -z) / radians,
  pitch: Math.atan2(y, Math.hypot(x, z)) / radians
}))

const asymmetric = { left: -12, right: 9, down: -6, up: 4 }

for (const [profileName, limits] of [["restricted", restricted], ["asymmetric", asymmetric]]) {
  test(profileName + " profile keeps the lamp anchored and places two separated proxies", () => {
    assert.deepEqual(place(roomTargets, limits, false), [roomTargets[0], null, null])
    const placements = place(roomTargets, limits, true)
    assert.equal(placements[0], roomTargets[0])
    const inset = {
      left: limits.left * 0.85,
      right: limits.right * 0.85,
      down: limits.down * 0.85,
      up: limits.up * 0.85
    }
    for (const proxy of placements.slice(1)) {
      assert.ok(proxy && inside(proxy, inset))
      assert.ok(Math.abs(proxy.yaw) >= 4.5)
      assert.ok(separation(placements[0], proxy) >= 9)
    }
    assert.ok(separation(placements[1], placements[2]) >= 9)
    assert.deepEqual(place(roomTargets, limits, true), placements)
  })
}

test("an infeasible envelope reports no reachable target without expanding the bounds", () => {
  const limits = { left: -3, right: 3, down: -2, up: 2 }
  assert.deepEqual(place(roomTargets, limits, true), [null, null, null])
  assert.deepEqual(limits, { left: -3, right: 3, down: -2, up: 2 })
})

test("degenerate neutral offsets do not acquire targets or synthesize proxies", () => {
  assert.deepEqual(place([{ yaw: NaN, pitch: NaN }], restricted, true), [null])
  assert.equal(angularDistance({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }), Infinity)
})

test("stationary camera directions add exactly zero travel, even without unit length", () => {
  const direction = { x: 0.031618, y: 0, z: -0.9987345 }
  assert.equal(angularDistance(direction, direction), 0)
  assert.equal(angularDistance({ x: 0, y: 0, z: -1 }, { x: 1, y: 0, z: 0 }), 90)
})
