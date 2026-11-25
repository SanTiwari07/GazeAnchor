# Measured Preview benchmark

Both trials use the same restricted illustrative profile, from a seated neutral pose with yaw **−12° to +12°** and pitch **−8° to +8°**. LEAF drives synthetic head poses through the normal Lens Studio Interactive Preview camera, and the Lens records observed angular travel and task actions. The task sequence is Lamp On, Fan High, then Water followed by explicit simulated acknowledgment. The Fixed trial looks toward the fan and care objects within the profile boundary and ends incomplete. The Adaptive trial ends when all three tasks complete.

## Final acceptance run

The Preview 1 log recorded the following on November 25, 2026 at 18:09 IST. [Lens log excerpts](evidence/preview-results.txt)

| Metric | Fixed AR | Adaptive |
| --- | ---: | ---: |
| Reachable targets | 1/3 | 3/3 |
| Completed tasks | 1/3 | 3/3 |
| Camera angular travel | 48.94° | 77.28° |
| Trial elapsed time | 4.69 s | 7.48 s |
| Task completion time | Incomplete | 7.48 s |
| Successful selections | 1 | 3 |
| Accidental aborts | 0 | 0 |
| Commands blocked by cooldown | 0 | 0 |
| Duplicate commands observed | 0 | 0 |

The Adaptive trial covers two additional tasks. Angular travel and elapsed time describe the observed sequences. A comparison at equal task completion would need a separate run that allows the Fixed controls to be reached. These measurements describe software behavior in Preview with simulated mobility bounds.

## Reproduce

Run T11 in the LEAF panel or start **Benchmark** from neutral in each mode. Run **Reset Demo** between attempts, restore the restricted preset, and show each target's attempted action. Stop the Fixed trial with **Benchmark** after the fan and care attempts. In Adaptive, acknowledge Water through the operator panel to finish the trial. Lens Studio Logger prints a structured `Trial ended` line that includes mode, bounds, actions, aborts, travel, task count and time.
