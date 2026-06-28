import { CivicIssue } from "./types";

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: "CG-2026-089",
    category: "road_damage",
    title: "Critical Road Fracture",
    description: "Deep structural pothole on active transit lane, causing immediate vehicle damage and bicycle hazards. Expanding rapidly due to moisture runoff.",
    confidence: 0.98,
    coordinates: "45.5234° N, 122.6762° W",
    status: "critical",
    votes: 142,
    locationName: "Williams Ave & Stanton St",
    dateReported: "2026-06-27 08:34 UTC",
    image: "pothole",
    aiOutput: JSON.stringify({
      "category": "road_damage",
      "confidence": 0.98,
      "severity": "CRITICAL",
      "metrics": {
        "depth_est_cm": 14.5,
        "width_est_cm": 68.2,
        "expansion_rate_pct": 12.4
      },
      "environmental_impact": "Medium (Tire decay & aerosol microplastics)",
      "municipal_routing_id": "MUNI-RD-9942",
      "priority_score": "94/100"
    }, null, 2)
  },
  {
    id: "CG-2026-092",
    category: "water_leak",
    title: "Mainline Pressure Leak",
    description: "Subterranean main fracture causing significant surface bubbling and water accumulation on the pedestrian sidewalk. Sub-base erosion detected.",
    confidence: 0.95,
    coordinates: "45.5112° N, 122.6845° W",
    status: "active",
    votes: 89,
    locationName: "SW 11th Ave & Jefferson",
    dateReported: "2026-06-27 14:15 UTC",
    image: "water_leak",
    aiOutput: JSON.stringify({
      "category": "utility_water_leak",
      "confidence": 0.95,
      "severity": "HIGH",
      "metrics": {
        "est_flow_loss_lpm": 34.2,
        "soil_saturation_index": 0.88,
        "structural_risk_level": "MODERATE"
      },
      "environmental_impact": "High (Potable water loss & urban heat sync dampening)",
      "municipal_routing_id": "MUNI-H2O-3341",
      "priority_score": "81/100"
    }, null, 2)
  },
  {
    id: "CG-2026-074",
    category: "electrical_hazard",
    title: "Arcing Utility Hazard",
    description: "Fallen secondary power distribution cable making intermittent contact with low-hanging sagebrush canopy. Visible arcing during high moisture intervals.",
    confidence: 0.99,
    coordinates: "45.5301° N, 122.6421° W",
    status: "critical",
    votes: 216,
    locationName: "NE Sandy Blvd & 24th",
    dateReported: "2026-06-26 21:05 UTC",
    image: "electrical",
    aiOutput: JSON.stringify({
      "category": "grid_hazard",
      "confidence": 0.99,
      "severity": "IMMEDIATE_HAZARD",
      "metrics": {
        "line_potential_v": 240,
        "canopy_contact_sqm": 4.2,
        "thermal_signature_c": 142.5
      },
      "environmental_impact": "Severe (Local wildfire trigger risk & local fauna threat)",
      "municipal_routing_id": "MUNI-GRID-0211",
      "priority_score": "98/100"
    }, null, 2)
  },
  {
    id: "CG-2026-101",
    category: "hazardous_waste",
    title: "Chemical Runoff Deposit",
    description: "Unidentified high-alkaline liquid industrial run-off pooling near a bioswale. Threatens immediate root rot for native vegetation buffer.",
    confidence: 0.92,
    coordinates: "45.4829° N, 122.6104° W",
    status: "active",
    votes: 67,
    locationName: "Inner Industrial Way",
    dateReported: "2026-06-28 02:40 UTC",
    image: "chemical",
    aiOutput: JSON.stringify({
      "category": "hazardous_spill",
      "confidence": 0.92,
      "severity": "HIGH",
      "metrics": {
        "estimated_ph": 11.4,
        "volume_liters": 120,
        "bioswale_proximity_m": 8.5
      },
      "environmental_impact": "Severe (Aquatic toxicity & groundwater penetration risk)",
      "municipal_routing_id": "MUNI-ECO-8890",
      "priority_score": "88/100"
    }, null, 2)
  },
  {
    id: "CG-2026-061",
    category: "canopy_decay",
    title: "Eco-Buffer Tree Failure",
    description: "Massive limb detachment from protected 100-year Heritage Oak. The limb blocks standard bicycle corridor lanes and compromises core trunk balance.",
    confidence: 0.97,
    coordinates: "45.5042° N, 122.6288° W",
    status: "resolved",
    votes: 310,
    locationName: "SE Ankeny & 32nd Ave",
    dateReported: "2026-06-25 10:11 UTC",
    image: "tree",
    aiOutput: JSON.stringify({
      "category": "eco_canopy_failure",
      "confidence": 0.97,
      "severity": "RESOLVED",
      "metrics": {
        "foliage_mass_kg": 420,
        "corridor_obstruction_pct": 100,
        "trunk_structural_stability": "STABILIZED"
      },
      "environmental_impact": "Low (Resolved: Biomass redirected to community mulch)",
      "municipal_routing_id": "MUNI-PARK-0012",
      "priority_score": "12/100"
    }, null, 2)
  }
];

export const MUNICIPAL_AGENCY_STATS = [
  { name: "Urban Forestry Dept", active: 2, resolved: 41, priority_index: "0.85" },
  { name: "Grid & Electrification Board", active: 1, resolved: 88, priority_index: "0.99" },
  { name: "Clean Water & Bioswales", active: 4, resolved: 112, priority_index: "0.91" },
  { name: "Transportation & Road Repair", active: 9, resolved: 231, priority_index: "0.95" }
];
