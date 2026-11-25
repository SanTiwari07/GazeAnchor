import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import { BriefGlanceScenario } from "./BriefGlanceScenario"
import { CancelDwellScenario } from "./CancelDwellScenario"
import { DwellJitterScenario } from "./DwellJitterScenario"
import { DwellTimingScenario } from "./DwellTimingScenario"
import { GuidedCalibrationScenario } from "./GuidedCalibrationScenario"
import { NearestOverlapScenario } from "./NearestOverlapScenario"
import { OffViewAcknowledgmentScenario } from "./OffViewAcknowledgmentScenario"
import { TrackingInterruptionScenario } from "./TrackingInterruptionScenario"
import { CaregiverAcknowledgmentScenario } from "./CaregiverAcknowledgmentScenario"
import { CaregiverOfflineScenario } from "./CaregiverOfflineScenario"
import { ReachabilityBenchmarkScenario } from "./ReachabilityBenchmarkScenario"
import { TetherPlacementScenario } from "./TetherPlacementScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    { id: "gazeanchor-t01-guided-calibration", typename: GuidedCalibrationScenario.getTypeName() },
    { id: "gazeanchor-t02-tether-placement", typename: TetherPlacementScenario.getTypeName() },
    { id: "gazeanchor-t03-brief-glance", typename: BriefGlanceScenario.getTypeName() },
    { id: "gazeanchor-t04-dwell-jitter", typename: DwellJitterScenario.getTypeName() },
    { id: "gazeanchor-t05-dwell-timing", typename: DwellTimingScenario.getTypeName() },
    { id: "gazeanchor-t06-nearest-overlap", typename: NearestOverlapScenario.getTypeName() },
    { id: "gazeanchor-t07-cancel-dwell", typename: CancelDwellScenario.getTypeName() },
    { id: "gazeanchor-t08-explicit-acknowledgment", typename: CaregiverAcknowledgmentScenario.getTypeName() },
    { id: "gazeanchor-t09-offline-retry", typename: CaregiverOfflineScenario.getTypeName() },
    { id: "gazeanchor-t10-tracking-interruption", typename: TrackingInterruptionScenario.getTypeName() },
    { id: "gazeanchor-t11-reachability-benchmark", typename: ReachabilityBenchmarkScenario.getTypeName() },
    { id: "gazeanchor-t12-off-view-acknowledgment", typename: OffViewAcknowledgmentScenario.getTypeName() },
  ]
}
