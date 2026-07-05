// HealthGuard AI Synthetic Mock Database
const HEALTHGUARD_DATA = {
  claims: [
    {
      id: "HG-CLM-8821",
      patient: "Rajesh Kumar",
      age: 54,
      gender: "Male",
      provider: "MediCare Specialty Clinic",
      providerId: "PROV-9082",
      providerRating: "C+",
      amount: 145000,
      diagnosis: "Type 2 Diabetes with Neuropathy",
      diagnosisCode: "ICD-10-E11.4",
      procedure: "Premium Neuro-regenerative Therapy session & Intensive Laser treatment",
      procedureCode: "CPT-95928",
      date: "2026-07-02",
      status: "Flagged for Review",
      riskScore: 88,
      riskLevel: "High",
      shapValues: [
        { feature: "Upcoding Detection (Unusual CPT code combination)", weight: 35 },
        { feature: "Provider Claims Frequency for CPT-95928", weight: 22 },
        { feature: "Cost Outlier (3.4x average for diagnosis)", weight: 18 },
        { feature: "Provider Billing History & Rating", weight: 13 }
      ],
      llmAnalysis: "This claim is flagged with high risk (88/100) due to severe billing anomalies. The procedure CPT-95928 ('Neuro-regenerative Therapy') is billed alongside 'Intensive Laser treatment' for a diagnosis of Diabetes with Neuropathy. In standard billing databases, this combination is extremely rare and constitutes **Upcoding/Phantom billing**. Furthermore, provider 'MediCare Specialty Clinic' has billed this high-cost therapy for 84% of their diabetic patients this month (regional average is 4%). We recommend denying the premium neuro-therapy portion, requesting detailed clinic session logs, and auditing provider billing patterns."
    },
    {
      id: "HG-CLM-4019",
      patient: "Priya Sharma",
      age: 29,
      gender: "Female",
      provider: "Apex Wellness Center",
      providerId: "PROV-4412",
      providerRating: "A",
      amount: 12500,
      diagnosis: "Acute Bronchitis",
      diagnosisCode: "ICD-10-J20.9",
      procedure: "Outpatient Consultation & Standard Nebulization",
      procedureCode: "CPT-99213",
      date: "2026-07-04",
      status: "Auto-Approved",
      riskScore: 12,
      riskLevel: "Low",
      shapValues: [
        { feature: "Standard Procedure for Diagnosis", weight: -20 },
        { feature: "Provider Rating (High trust history)", weight: -15 },
        { feature: "Cost is within 10% of regional median", weight: -10 },
        { feature: "No overlapping claims detected", weight: -5 }
      ],
      llmAnalysis: "This claim has an extremely low risk score (12/100) and qualifies for auto-approval. The billed consultation code (CPT-99213) and nebulization therapy are standard clinical protocols for Acute Bronchitis (ICD-10-J20.9). The cost of ₹12,500 is aligned with the regional average. The provider has a historical audit rating of 'A' with a 0.2% fraud-flag rate. No double-billing, upcoding, or compliance flags detected."
    },
    {
      id: "HG-CLM-7703",
      patient: "Aarav Mehta",
      age: 67,
      gender: "Male",
      provider: "CarePlus Diagnostic Labs",
      providerId: "PROV-2110",
      providerRating: "B-",
      amount: 98000,
      diagnosis: "Essential Hypertension",
      diagnosisCode: "ICD-10-I10",
      procedure: "Comprehensive Cardiac Panels & Full Body Scan",
      procedureCode: "CPT-80050",
      date: "2026-07-03",
      status: "Flagged for Review",
      riskScore: 74,
      riskLevel: "Medium",
      shapValues: [
        { feature: "Unnecessary Diagnostic Testing", weight: 32 },
        { feature: "Cost Outlier (2.1x regional median)", weight: 19 },
        { feature: "Patient Age / Comorbidity matching", weight: 15 },
        { feature: "Duplicate claims check", weight: 8 }
      ],
      llmAnalysis: "This claim has a medium risk score (74/100) and is flagged for potential **Over-utilization**. Billed services include a comprehensive cardiac panel and full-body scan for a primary diagnosis of simple Essential Hypertension. Standard clinical guidelines do not warrant expensive full-body imaging or advanced multiplex panel testing for basic, non-crisis hypertension unless secondary causes are suspected. The total cost is ₹98,000, which exceeds standard screening costs by 210%. Recommended Action: Request clinical notes justifying the full-body scan before approving this claim."
    },
    {
      id: "HG-CLM-3312",
      patient: "Sunita Devi",
      age: 72,
      gender: "Female",
      provider: "City Heart Care Clinic",
      providerId: "PROV-1189",
      providerRating: "D",
      amount: 210000,
      diagnosis: "Chronic Heart Failure",
      diagnosisCode: "ICD-10-I50.9",
      procedure: "Emergency Echocardiography & Cardiac Output Monitoring",
      procedureCode: "CPT-93306",
      date: "2026-07-01",
      status: "Flagged for Review",
      riskScore: 92,
      riskLevel: "High",
      shapValues: [
        { feature: "Duplicate Billing Check (Overlap same-day)", weight: 40 },
        { feature: "Provider Audit Rating History", weight: 25 },
        { feature: "Unbundled Service Codes detected", weight: 17 },
        { feature: "High-cost claims anomaly threshold", weight: 10 }
      ],
      llmAnalysis: "This claim exhibits critical billing irregularities (92/100). A primary duplicate billing flag was triggered: provider billed two separate claims for 'Emergency Echocardiography' for the same patient on the same day within a 4-hour window, without indicating separate emergency events (Modifier -59 missing). Provider rating is 'D' due to recurring billing integrity issues. We suspect **Unbundling & Duplicate Billing**. Recommended Action: Audit both overlapping claims, check hospital time stamps, and reject the second claim pending clinical charts."
    },
    {
      id: "HG-CLM-5590",
      patient: "Amit Patel",
      age: 41,
      gender: "Male",
      provider: "Metro Diagnostics & Clinic",
      providerId: "PROV-8829",
      providerRating: "B+",
      amount: 45000,
      diagnosis: "Lumbar Disc Herniation",
      diagnosisCode: "ICD-10-M51.26",
      procedure: "Outpatient Lumbar MRI Scan",
      procedureCode: "CPT-72148",
      date: "2026-07-03",
      status: "Auto-Approved",
      riskScore: 19,
      riskLevel: "Low",
      shapValues: [
        { feature: "Indication/Procedure Alignment", weight: -18 },
        { feature: "Standard regional pricing match", weight: -12 },
        { feature: "Trustworthy Provider Profile", weight: -8 },
        { feature: "Prior authorization found in EHR", weight: -7 }
      ],
      llmAnalysis: "This claim is low risk (19/100). Lumbar MRI (CPT-72148) is the standard imaging modality to diagnose Lumbar Disc Herniation (ICD-10-M51.26). The price of ₹45,000 matches standard pre-negotiated provider fee structures. Prior auth is linked and valid. Approving claim."
    }
  ],

  drugs: [
    {
      name: "Warfarin",
      class: "Anticoagulant (Blood Thinner)",
      commonSideEffects: ["Bleeding", "Bruising", "Nausea", "Abdominal Pain"],
      baselineRisk: 25
    },
    {
      name: "Aspirin",
      class: "Antiplatelet / NSAID",
      commonSideEffects: ["Indigestion", "Heartburn", "Stomach Ulceration"],
      baselineRisk: 15
    },
    {
      name: "Sildenafil",
      class: "PDE5 Inhibitor (Vasodilator)",
      commonSideEffects: ["Headache", "Flushing", "Dyspepsia", "Visual Disturbances"],
      baselineRisk: 18
    },
    {
      name: "Nitroglycerin",
      class: "Vasodilator / Nitrate",
      commonSideEffects: ["Dizziness", "Severe Headache", "Hypotension", "Tachycardia"],
      baselineRisk: 30
    },
    {
      name: "Simvastatin",
      class: "HMG-CoA Reductase Inhibitor (Statin)",
      commonSideEffects: ["Muscle aches (Myalgia)", "Headache", "Liver enzyme elevation"],
      baselineRisk: 10
    },
    {
      name: "Amlodipine",
      class: "Calcium Channel Blocker (Antihypertensive)",
      commonSideEffects: ["Peripheral Edema (Swelling)", "Fatigue", "Palpitations"],
      baselineRisk: 12
    },
    {
      name: "Clopidogrel",
      class: "Antiplatelet Agent",
      commonSideEffects: ["Bleeding", "Bruising", "Diarrhea", "Rashes"],
      baselineRisk: 20
    },
    {
      name: "Metformin",
      class: "Biguanide Antidiabetic",
      commonSideEffects: ["Gastrointestinal upset", "Diarrhea", "Metallic taste", "Lactic Acidosis (Rare)"],
      baselineRisk: 15
    },
    {
      name: "Lisinopril",
      class: "ACE Inhibitor",
      commonSideEffects: ["Dry Cough", "Hyperkalemia", "Dizziness", "Angioedema (Rare)"],
      baselineRisk: 14
    },
    {
      name: "Ibuprofen",
      class: "NSAID",
      commonSideEffects: ["Gastric irritation", "Fluid retention", "Renal impairment"],
      baselineRisk: 18
    }
  ],

  interactions: [
    {
      drugA: "Warfarin",
      drugB: "Aspirin",
      severity: "High",
      riskScore: 92,
      mechanism: "Synergistic antiplatelet and anticoagulant effects. Aspirin inhibits platelet aggregation and can cause gastric mucosal damage, which increases the likelihood and severity of bleeding induced by Warfarin's systemic anticoagulation.",
      alternatives: ["Switch Aspirin to Acetaminophen (for pain/fever) or Clopidogrel (under close monitoring for antiplatelet need). If co-therapy is mandatory (e.g. mechanical valve + CAD), prescribe PPI (Pantoprazole) to protect the stomach, and monitor INR closely."]
    },
    {
      drugA: "Sildenafil",
      drugB: "Nitroglycerin",
      severity: "Critical",
      riskScore: 99,
      mechanism: "Extreme synergistic vasodilation. Nitroglycerin increases nitric oxide production, and Sildenafil inhibits PDE5, which prevents the breakdown of cGMP. Together, they cause unchecked accumulation of cGMP, leading to profound, life-threatening hypotension and cardiovascular collapse.",
      alternatives: ["Absolute contraindication. Sildenafil must not be taken within 24 hours of Nitroglycerin (or 48 hours for long-acting nitrates). If angina occurs, use alternative non-nitrate agents like Beta-blockers, Calcium Channel Blockers, or Ranolazine."]
    },
    {
      drugA: "Simvastatin",
      drugB: "Amlodipine",
      severity: "Medium",
      riskScore: 58,
      mechanism: "Pharmacokinetic interaction. Amlodipine is a weak inhibitor of CYP3A4, which metabolizes Simvastatin. Co-administration increases systemic exposure of Simvastatin, elevating the risk of concentration-dependent myopathy and rhabdomyolysis.",
      alternatives: ["Limit Simvastatin dose to a maximum of 20 mg daily, or switch Simvastatin to a statin not primarily metabolized by CYP3A4, such as Pravastatin, Rosuvastatin, or Pitavastatin."]
    },
    {
      drugA: "Clopidogrel",
      drugB: "Aspirin",
      severity: "Medium",
      riskScore: 62,
      mechanism: "Dual Antiplatelet Therapy (DAPT) profile. Increases systemic bleeding risks (gastrointestinal and cerebral). Often prescribed intentionally in post-PCI or acute coronary syndrome settings, but requires strict vigilance.",
      alternatives: ["Monitor for bleeding. Consider co-prescribing a Proton Pump Inhibitor (PPI) such as Pantoprazole (avoid Omeprazole as it inhibits CYP2C19, reducing Clopidogrel's efficacy)."]
    },
    {
      drugA: "Ibuprofen",
      drugB: "Lisinopril",
      severity: "High",
      riskScore: 78,
      mechanism: "NSAIDs reduce renal prostaglandins, causing afferent arteriolar constriction. ACE inhibitors like Lisinopril cause efferent arteriolar vasodilation. Combined, they severely reduce glomerular filtration rate (GFR), causing acute kidney injury and decreasing Lisinopril's blood-pressure lowering efficacy.",
      alternatives: ["Avoid chronic NSAID use. Switch Ibuprofen to Acetaminophen (Paracetamol) for analgesia. Monitor renal function and potassium levels if co-administration is necessary."]
    }
  ],

  complianceControls: [
    {
      framework: "DPDP Act 2023 (India)",
      section: "Sensitive Personal Data (SPD)",
      control: "Consent Manager Integration & De-identification",
      details: "Under DPDP 2023, health data requires explicit, revocable consent. The HealthGuard MVP ensures patient records in claims and ADR inputs are de-identified or tokenized before processing by AI engines, and logs consent tokens."
    },
    {
      framework: "ABDM (Ayushman Bharat)",
      section: "ABHA ID Alignment",
      control: "ABHA Health Locker API Readiness",
      details: "To deploy in Indian clinics, the platform integrates with the ABHA ecosystem. Instead of a custom database, claims data fetches directly from ABDM Health Lockers, ensuring patients hold ownership of their medical files."
    },
    {
      framework: "Clinical Safety Regulation",
      section: "Human-in-the-Loop (HITL)",
      control: "Clinical Gate Review Workflow",
      details: "No autonomous clinical actions are taken. LLM-generated reports are placed in a 'Draft review' state, requiring signature verification by a licensed doctor or pharmacist before inclusion in official medical records."
    }
  ]
};

// Expose data globally if running in browser
if (typeof window !== 'undefined') {
  window.HEALTHGUARD_DATA = HEALTHGUARD_DATA;
}
