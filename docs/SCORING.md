# SkillBridge Career Readiness Scoring Specification

The SkillBridge Career Readiness Score is a deterministic, auditable, and transparent 0–100 integer score measuring how closely a candidate's verified competencies match a target role's hiring requirements.

---

## 1. Mathematical Formula

$$\text{Score} = \text{round}\left(\min\left(100, \max\left(0, \sum_{i=1}^{5} W_i \times C_i \times 100\right)\right)\right)$$

Where $W_i$ represents the component weight and $C_i \in [0, 1]$ is the normalized component index:

| Component $i$ | Factor Name | Weight $W_i$ | Max Points | Evaluation Function |
|---|---|---|---|---|
| 1 | **Core Skill Coverage** | **0.40** | 40 pts | $\frac{\sum_{r \in \text{MustHave}} w_r \times \mathbb{I}(\text{userProf}_r \ge \text{minProf}_r)}{\sum_{r \in \text{MustHave}} w_r}$ |
| 2 | **Proficiency Depth** | **0.30** | 30 pts | $\frac{\sum_{r \in \text{MustHave}} w_r \times \frac{\min(\text{userProf}_r, \text{minProf}_r)}{\text{minProf}_r}}{\sum_{r \in \text{MustHave}} w_r}$ |
| 3 | **Evidence Reliability** | **0.20** | 20 pts | Average multiplier across verified skills: Certification (1.00), Work Experience (0.95), Project (0.90), Self-Rated (0.75), None (0.00) |
| 4 | **Nice-to-Have Bonus** | **0.05** | 5 pts | Share of optional/nice-to-have requirements met $(\text{userProf} \ge 1)$ |
| 5 | **Soft Skills & Team Fit** | **0.05** | 5 pts | Share of soft skill requirements meeting role thresholds (returns 0 when no signal) |
| **Total** | | **1.00** | **100 pts** | |

---

## 2. Gap Classification

For each requirement $r$ of target role:
- **`STRONG`**: $\text{userProficiency} \ge \text{minProficiency}$
- **`PARTIAL_GAP`**: $0 < \text{userProficiency} < \text{minProficiency}$ AND ($\frac{\text{userProficiency}}{\text{minProficiency}} \ge 0.6$ OR requirement is nice-to-have)
- **`CRITICAL_GAP`**: $0 < \text{userProficiency} < \text{minProficiency}$ AND required MUST-HAVE with $< 60\%$ threshold ratio
- **`MISSING`**: $\text{userProficiency} = 0$

---

## 3. Confidence Indicator

The confidence metric $\in [0.3, 1.0]$ measures the reliability of the evidence profile:
$$\text{Confidence} = \max\left(0.3, 1.0 - 0.5 \times \frac{\text{count}(\text{SelfRated})}{\text{count}(\text{Skills})}\right)$$

Profiles backed by verified projects, work experience, and certifications achieve $\ge 90\%$ confidence.
