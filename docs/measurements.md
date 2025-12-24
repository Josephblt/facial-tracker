# Facial Measurements and Metrics

This document defines the facial measurements used by the Facial Tracker
application. It specifies which MediaPipe Face Mesh landmarks are used, how
absolute metrics are computed, and how relative metrics are derived.

All measurements are designed for anatomical consistency, repeatability, and
longitudinal tracking for peripheral facial palsy.

---

## Measurement Philosophy

### Absolute Metrics

Absolute metrics are raw geometric values computed directly from facial
landmarks. These values are stored permanently.

Absolute metrics:
- are auditable
- can be reprocessed
- do not depend on previous sessions

### Relative Metrics

Relative metrics are derived values computed by comparing absolute metrics from
an active pose to the Neutral pose (P0).

Relative metrics:
- are computed on demand
- are never stored
- depend on a valid Neutral baseline

---

## Coordinate System

- All landmarks are provided by MediaPipe Face Mesh.
- Landmark indices are interpreted anatomically, not by screen position.
- Canvas mirroring is visual only and does not affect measurements.
- All distances are computed in normalized face coordinates (range 0–1).

---

## Baseline Pose (P0 — Neutral)

The Neutral pose (P0) is mandatory and serves as the baseline for all relative
metrics.

Requirements:
- frontal face orientation
- eyes open naturally
- relaxed mouth
- minimal head movement

All absolute metrics measured during P0 are stored and reused as reference values.

---

## Landmark Definitions

### Eyes

Left eye landmarks:
- upper eyelid: 159
- lower eyelid: 145
- inner corner: 133
- outer corner: 33

Right eye landmarks:
- upper eyelid: 386
- lower eyelid: 374
- inner corner: 362
- outer corner: 263

---

### Mouth

- left mouth corner: 61
- right mouth corner: 291
- upper lip center: 13
- lower lip center: 14

---

### Eyebrows

Left eyebrow landmarks:
- 70, 63, 105

Right eyebrow landmarks:
- 336, 296, 334

The eyebrow center is defined as the average position of its landmarks.

---

## Reference Distances

Reference distances are defined once and reused across all metrics.

### Inter-Ocular Distance (IOD)

Distance between the outer corners of the eyes.

Formula:
IOD = distance(left_outer_eye_corner, right_outer_eye_corner)

Used to normalize mouth and eyebrow measurements.

---

### Eye Width

Computed separately for each eye.

Formula:
eye_width = distance(inner_eye_corner, outer_eye_corner)

Used to normalize eye aperture.

---

## Absolute Metrics

### Eye Aperture

Measures eyelid opening for each eye.

Formula:
eye_aperture = distance(upper_eyelid, lower_eyelid) / eye_width

Stored separately for left and right eyes.

---

### Mouth Corner Elevation

Measures vertical displacement of each mouth corner relative to the mouth center.

Definitions:
- mouth center is the midpoint between upper and lower lip landmarks

Formula:
mouth_corner_elevation = vertical_distance(mouth_corner, mouth_center) / IOD

Stored separately for left and right sides.

---

### Lip Separation

Measures vertical opening of the mouth.

Formula:
lip_separation = vertical_distance(upper_lip, lower_lip) / IOD

---

### Eyebrow Elevation

Measures eyebrow position relative to the corresponding eye.

Definitions:
- eyebrow center is the average of eyebrow landmarks
- eye center is the midpoint between upper and lower eyelids

Formula:
eyebrow_elevation = vertical_distance(eyebrow_center, eye_center) / IOD

Stored separately for left and right sides.

---

## Relative Metrics

Relative metrics are derived from absolute metrics using the Neutral pose.

Formula:
relative_value = absolute_value_pose - absolute_value_neutral

Relative metrics are not stored.

---

## Asymmetry Metrics

Asymmetry is computed using absolute left and right values.

Formula:
asymmetry = |left - right|

Optional normalized form:
normalized_asymmetry = |left - right| / (left + right)

The choice of asymmetry formula does not affect stored data.

---

## Pose-to-Metric Mapping

- P0 Neutral  
  All baseline absolute metrics

- P1 Gentle Smile  
  Mouth corner elevation

- P2 Big Smile  
  Mouth corner elevation, lip separation

- P3 Eye Closure  
  Eye aperture

- P4 Eyebrow Raise  
  Eyebrow elevation

- P5 Lip Purse  
  Lip separation, mouth symmetry

---

## Frame Aggregation

- Metrics are computed per frame
- Values are averaged over a short capture window
- Frames with face loss or excessive head rotation are discarded

---

## Limitations

- Assumes frontal face orientation
- Sensitive to lighting and camera quality
- Measures movement trends, not muscle force

Results must be interpreted longitudinally and do not constitute diagnosis.