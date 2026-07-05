// HealthGuard AI Client-Side Application Logic

// App State
let currentTab = 'overview';
let activeClaimId = null;
let claimsDatabase = [...HEALTHGUARD_DATA.claims];
let adrChecksRunCount = 24;
let totalLeakagePrevented = 453000;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDashboard();
  initClaimsAuditor();
  initADRPredictor();
  initRoadmap();
  initComplianceReport();
});

// 1. Navigation System
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  
  // Update sidebar active classes
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch visible views
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => {
    if (content.id === `view-${tabId}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Dynamic header updates
  const headerTitle = document.getElementById('main-header-title');
  const headerSubtitle = document.getElementById('main-header-subtitle');
  
  if (tabId === 'overview') {
    headerTitle.innerText = "Executive Dashboard";
    headerSubtitle.innerText = "Real-time explainable billing auditing & drug safety checker";
  } else if (tabId === 'claims') {
    headerTitle.innerText = "Claims Auditor Queue";
    headerSubtitle.innerText = "Fraud anomaly detection powered by Isolation Forest & SHAP";
  } else if (tabId === 'adr') {
    headerTitle.innerText = "ADR Risk Predictor";
    headerSubtitle.innerText = "Drug-drug interaction risk scoring and decision check";
  } else if (tabId === 'roadmap') {
    headerTitle.innerText = "HealthGuard AI 2.0 Blueprint";
    headerSubtitle.innerText = "Interactive system architecture and enterprise scaling roadmap";
  } else if (tabId === 'audit-report') {
    headerTitle.innerText = "Blueprint Auditing Log";
    headerSubtitle.innerText = "Comparison between MVP and 2.0 scopes, compliance, and regulatory paths";
  }
}

// 2. Executive Dashboard Overview
function initDashboard() {
  renderMiniClaimsList();
  
  // Populate Quick check dropdowns
  const currentSelect = document.getElementById('qc-current-drug');
  const newSelect = document.getElementById('qc-new-drug');
  
  currentSelect.innerHTML = "";
  newSelect.innerHTML = "";
  
  HEALTHGUARD_DATA.drugs.forEach((drug, idx) => {
    // Current drug select
    const op1 = document.createElement('option');
    op1.value = drug.name;
    op1.innerText = `${drug.name} (${drug.class})`;
    currentSelect.appendChild(op1);
    
    // Proposed drug select
    const op2 = document.createElement('option');
    op2.value = drug.name;
    op2.innerText = `${drug.name} (${drug.class})`;
    if (idx === 1) op2.selected = true; // Default propose Aspirin
    newSelect.appendChild(op2);
  });

  // Wire quick check button
  const qcBtn = document.getElementById('btn-quick-check');
  qcBtn.addEventListener('click', runQuickCheck);
}

function renderMiniClaimsList() {
  const container = document.getElementById('overview-claims-list');
  container.innerHTML = "";
  
  // Show first 3 flagged or pending claims
  const itemsToShow = claimsDatabase.filter(c => c.status === "Flagged for Review").slice(0, 3);
  
  itemsToShow.forEach(claim => {
    const div = document.createElement('div');
    div.className = "mini-item";
    div.addEventListener('click', () => {
      switchTab('claims');
      selectClaim(claim.id);
    });

    const badgeClass = claim.riskLevel === 'High' ? 'badge-red' : 'badge-yellow';
    
    div.innerHTML = `
      <div class="mini-left">
        <div class="mini-title">${claim.patient} (${claim.age}y, ${claim.gender})</div>
        <div class="mini-subtitle">${claim.provider} • CPT-${claim.procedureCode.split('-')[1] || ''}</div>
      </div>
      <div class="mini-right">
        <div class="mini-amount">₹${claim.amount.toLocaleString('en-IN')}</div>
        <span class="badge ${badgeClass}">${claim.riskLevel} Risk</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function runQuickCheck() {
  const age = parseInt(document.getElementById('qc-patient-age').value) || 40;
  const currentMed = document.getElementById('qc-current-drug').value;
  const proposedMed = document.getElementById('qc-new-drug').value;
  
  const resultCard = document.getElementById('quick-check-result');
  resultCard.classList.remove('hidden');
  
  if (currentMed === proposedMed) {
    resultCard.innerHTML = `
      <div class="qr-score-row">
        <span class="qr-score-label">ADR Risk Score</span>
        <span class="qr-score-val text-green" style="color: var(--accent-emerald)">0%</span>
      </div>
      <p class="qr-text">Cannot check interaction with identical drug candidate.</p>
    `;
    return;
  }

  // Calculate quick score
  let score = 10;
  let hasInteraction = false;
  let interactionDetail = null;

  // Check direct interactions
  const interact = HEALTHGUARD_DATA.interactions.find(i => 
    (i.drugA === currentMed && i.drugB === proposedMed) ||
    (i.drugA === proposedMed && i.drugB === currentMed)
  );

  if (interact) {
    hasInteraction = true;
    score = interact.riskScore;
    interactionDetail = interact;
  } else {
    // Demographics math
    const baseDrug = HEALTHGUARD_DATA.drugs.find(d => d.name === proposedMed);
    score = baseDrug ? baseDrug.baselineRisk : 15;
    if (age > 65) score += 15;
    if (age > 75) score += 25;
    score += 5; // polypharmacy overhead
  }

  score = Math.min(score, 99);
  let colorClass = 'text-green';
  let colorHex = 'var(--accent-emerald)';
  
  if (score >= 70) {
    colorClass = 'text-red';
    colorHex = 'var(--accent-rose)';
  } else if (score >= 40) {
    colorClass = 'text-yellow';
    colorHex = 'var(--accent-amber)';
  }

  let desc = `Baseline risk factors evaluated. Proposed drug is safe to prescribe under standard clinical supervision.`;
  if (hasInteraction) {
    desc = `<strong>ALERT:</strong> ${interactionDetail.severity} interaction detected. ${interactionDetail.mechanism.substring(0, 100)}...`;
  } else if (age > 65) {
    desc = `Medium warning due to geriatric clearance concerns (Age ${age}).`;
  }

  resultCard.innerHTML = `
    <div class="qr-score-row">
      <span class="qr-score-label">ADR Risk Score</span>
      <span class="qr-score-val ${colorClass}" style="color: ${colorHex}">${score}%</span>
    </div>
    <p class="qr-text">${desc}</p>
    <button class="btn btn-secondary btn-sm w-full" style="margin-top: 0.5rem" onclick="goToFullADR('${currentMed}', '${proposedMed}', ${age})">Configure Full Audit</button>
  `;
}

function goToFullADR(current, proposed, age) {
  switchTab('adr');
  document.getElementById('adr-pt-age').value = age;
  
  // Set new proposed drug
  document.getElementById('adr-new-med').value = proposed;
  
  // Uncheck all except current
  const checkboxes = document.querySelectorAll('#adr-current-meds-grid input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = (cb.value === current);
  });
  
  // Run full adr check
  document.getElementById('btn-run-adr-check').click();
}

// 3. Claims Auditor (MVP Option A)
function initClaimsAuditor() {
  renderClaimsList('all');
  
  // Wire search input
  const searchInput = document.getElementById('claims-search');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    filterClaims(q);
  });

  // Wire filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      const query = document.getElementById('claims-search').value.toLowerCase();
      renderClaimsList(filterValue, query);
    });
  });

  // Re-generate report click
  const reGenBtn = document.getElementById('btn-generate-report');
  reGenBtn.addEventListener('click', () => {
    if (!activeClaimId) return;
    simulateLLMReporting();
  });
}

function renderClaimsList(filter = 'all', query = '') {
  const container = document.getElementById('claims-list-body');
  container.innerHTML = "";
  
  let filtered = claimsDatabase;
  if (filter !== 'all') {
    filtered = filtered.filter(c => c.riskLevel === filter);
  }
  if (query) {
    filtered = filtered.filter(c => 
      c.patient.toLowerCase().includes(query) ||
      c.provider.toLowerCase().includes(query) ||
      c.diagnosis.toLowerCase().includes(query) ||
      c.procedureCode.toLowerCase().includes(query)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 2rem; font-size: 0.8rem">No claims match the filter options.</div>`;
    return;
  }

  filtered.forEach(claim => {
    const card = document.createElement('div');
    card.className = `claim-item-card ${activeClaimId === claim.id ? 'active' : ''}`;
    card.setAttribute('data-id', claim.id);
    card.addEventListener('click', () => selectClaim(claim.id));

    const statusBadge = claim.status === 'Auto-Approved' ? 'badge-green' : (claim.status === 'Rejected' ? 'badge-red' : 'badge-yellow');
    const riskColorClass = claim.riskLevel === 'High' ? 'high' : (claim.riskLevel === 'Medium' ? 'medium' : 'low');

    card.innerHTML = `
      <div class="cl-card-top">
        <span class="cl-card-id">${claim.id}</span>
        <span class="badge ${statusBadge}">${claim.status}</span>
      </div>
      <div class="cl-card-body">
        <div class="cl-card-patient">${claim.patient} (${claim.age}y, ${claim.gender})</div>
        <div class="cl-card-desc">${claim.provider} • ${claim.procedureCode}</div>
      </div>
      <div class="cl-card-bottom">
        <span class="cl-card-amount">₹${claim.amount.toLocaleString('en-IN')}</span>
        <span class="cl-card-score ${riskColorClass}">Risk: <strong>${claim.riskScore}%</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterClaims(query) {
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
  renderClaimsList(filter, query);
}

function selectClaim(claimId) {
  activeClaimId = claimId;
  
  // Highlight in list
  const cards = document.querySelectorAll('.claim-item-card');
  cards.forEach(c => {
    if (c.getAttribute('data-id') === claimId) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  const claim = claimsDatabase.find(c => c.id === claimId);
  if (!claim) return;

  // Show content panel
  document.getElementById('empty-inspector-state').classList.add('hidden');
  const content = document.getElementById('inspector-content');
  content.classList.remove('hidden');

  // Load details
  document.getElementById('ins-claim-id').innerText = claim.id;
  document.getElementById('ins-patient-name').innerText = `${claim.patient} (${claim.age} yrs, ${claim.gender})`;
  document.getElementById('ins-provider-name').innerText = `Billed by ${claim.provider} (ID: ${claim.providerId}) | Rating: ${claim.providerRating}`;
  
  document.getElementById('ins-diagnosis').innerText = `${claim.diagnosisCode} - ${claim.diagnosis}`;
  document.getElementById('ins-procedure').innerText = `${claim.procedureCode} - ${claim.procedure}`;
  document.getElementById('ins-amount').innerText = `₹${claim.amount.toLocaleString('en-IN')}`;
  document.getElementById('ins-probability').innerText = `${claim.riskScore}%`;

  // Risk badge styling
  const badge = document.getElementById('ins-risk-badge');
  badge.innerText = `${claim.riskLevel} RISK`;
  badge.className = `risk-badge ${claim.riskLevel.toLowerCase()}`;

  // Render SHAP chart
  renderSHAPChart(claim.shapValues, 'ins-shap-bars');

  // Load LLM report
  document.getElementById('ins-llm-report').innerHTML = claim.llmAnalysis;

  // Load status action buttons state
  const indicator = content.querySelector('.hitl-indicator');
  const buttons = content.querySelector('.footer-buttons');
  if (claim.status !== 'Flagged for Review') {
    indicator.innerHTML = `<span class="hitl-dot" style="background-color: ${claim.status === 'Auto-Approved' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}"></span><span>Claim audited and marked as <strong>${claim.status}</strong>.</span>`;
    buttons.classList.add('hidden');
  } else {
    indicator.innerHTML = `<span class="hitl-dot"></span><span>Human-in-the-loop: Awaiting Auditor Signature</span>`;
    buttons.classList.remove('hidden');
  }
}

function renderSHAPChart(shapValues, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Normalize SHAP weights to fit in chart (max SHAP weight gets 100%)
  const maxWeight = Math.max(...shapValues.map(s => Math.abs(s.weight)));

  shapValues.forEach(item => {
    const row = document.createElement('div');
    row.className = "shap-row";

    const widthPct = maxWeight > 0 ? (Math.abs(item.weight) / maxWeight) * 100 : 0;
    const direction = item.weight >= 0 ? 'positive' : 'negative';
    const sign = item.weight >= 0 ? '+' : '-';
    
    row.innerHTML = `
      <div class="shap-label-row">
        <span>${item.feature}</span>
        <strong>${sign}${Math.abs(item.weight)}% SHAP</strong>
      </div>
      <div class="shap-bar-track">
        <div class="shap-bar-fill ${direction}" style="width: ${widthPct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function simulateLLMReporting() {
  const reportBox = document.getElementById('ins-llm-report');
  reportBox.innerHTML = "<em>Invoking Gemini Report API... analyzing SHAP vectors... de-identifying records...</em>";
  
  const claim = claimsDatabase.find(c => c.id === activeClaimId);
  if (!claim) return;

  setTimeout(() => {
    // Simple typewriter effect simulation or direct inject
    reportBox.innerHTML = `<strong>[RE-GENERATED NARRATIVE LOG]</strong><br><br>${claim.llmAnalysis}<br><br><span style="font-size: 0.72rem; color: var(--text-dark)">Verification signature token: HG-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}</span>`;
  }, 1000);
}

function actionClaim(action) {
  if (!activeClaimId) return;
  const claim = claimsDatabase.find(c => c.id === activeClaimId);
  if (!claim) return;

  if (action === 'approve') {
    claim.status = 'Auto-Approved';
    // If it was high/medium risk, update claims leakage counts if rejected, else not.
  } else if (action === 'reject') {
    claim.status = 'Rejected';
    totalLeakagePrevented += claim.amount;
    document.getElementById('val-leakage').innerText = `₹${totalLeakagePrevented.toLocaleString('en-IN')}`;
  }

  // Recalculate fraud count
  const flags = claimsDatabase.filter(c => c.status === 'Flagged for Review' && c.riskLevel === 'High').length;
  document.getElementById('val-fraud-flags').innerText = flags;

  // Refresh view
  renderClaimsList();
  renderMiniClaimsList();
  selectClaim(activeClaimId);
}

// 4. ADR Risk Predictor (MVP Option B)
function initADRPredictor() {
  // Populate options
  const medGrid = document.getElementById('adr-current-meds-grid');
  const newMedSelect = document.getElementById('adr-new-med');
  
  medGrid.innerHTML = "";
  newMedSelect.innerHTML = "";
  
  HEALTHGUARD_DATA.drugs.forEach((drug, idx) => {
    // Current meds checkboxes
    const label = document.createElement('label');
    label.className = "checkbox-item";
    label.innerHTML = `
      <input type="checkbox" value="${drug.name}">
      <span>${drug.name}</span>
    `;
    medGrid.appendChild(label);

    // Proposed select
    const op = document.createElement('option');
    op.value = drug.name;
    op.innerText = `${drug.name} (${drug.class})`;
    if (idx === 0) op.selected = true; // Warfarin default select
    newMedSelect.appendChild(op);
  });

  // Set default checkbox for Clopidogrel and Aspirin
  const checkBoxes = medGrid.querySelectorAll('input[type="checkbox"]');
  checkBoxes.forEach(cb => {
    if (cb.value === "Aspirin" || cb.value === "Clopidogrel") cb.checked = true;
  });

  // Wire audit button
  const runBtn = document.getElementById('btn-run-adr-check');
  runBtn.addEventListener('click', runFullADRCheck);

  // Doctor sign-off wire
  const signBtn = document.getElementById('btn-adr-signoff');
  signBtn.addEventListener('click', signOffADR);
}

function runFullADRCheck() {
  const age = parseInt(document.getElementById('adr-pt-age').value) || 40;
  const gender = document.getElementById('adr-pt-gender').value;
  
  // Get comorbidities
  const comSelect = document.getElementById('adr-pt-comorbidities');
  const selectedComs = Array.from(comSelect.selectedOptions).map(o => o.value);

  // Get current meds
  const checkBoxes = document.querySelectorAll('#adr-current-meds-grid input[type="checkbox"]');
  const currentMeds = Array.from(checkBoxes).filter(cb => cb.checked).map(cb => cb.value);

  // New drug candidate
  const proposedMed = document.getElementById('adr-new-med').value;

  const emptyState = document.getElementById('adr-empty-state');
  const content = document.getElementById('adr-output-content');
  
  emptyState.classList.add('hidden');
  content.classList.remove('hidden');

  if (currentMeds.includes(proposedMed)) {
    alert("The proposed drug is already in the patient's current medication list.");
    return;
  }

  // ML logic Simulation
  let score = 10;
  let interactionsFound = [];
  
  // 1. Check direct drug-drug interactions with proposed drug
  for (const currentMed of currentMeds) {
    const interaction = HEALTHGUARD_DATA.interactions.find(i => 
      (i.drugA === currentMed && i.drugB === proposedMed) ||
      (i.drugA === proposedMed && i.drugB === currentMed)
    );
    if (interaction && !interactionsFound.some(ex => ex.drugA === interaction.drugA && ex.drugB === interaction.drugB)) {
      interactionsFound.push(interaction);
    }
  }

  // 2. Base risk & SHAP generation
  let shapList = [];
  const baseDrug = HEALTHGUARD_DATA.drugs.find(d => d.name === proposedMed);
  const baseline = baseDrug ? baseDrug.baselineRisk : 15;
  
  shapList.push({ feature: `Baseline Drug Risk (${proposedMed})`, weight: baseline });
  score = baseline;

  // Comorbidities modifiers
  selectedComs.forEach(com => {
    let weight = 8;
    let label = "";
    if (com === 'renal') { label = "Renal Impairment Check"; weight = 12; }
    else if (com === 'cardio') { label = "Cardiovascular Strain"; weight = 9; }
    else if (com === 'gastric') { label = "Gastric Ulcer Susceptibility"; weight = 7; }
    else if (com === 'liver') { label = "Hepatic Clearance"; weight = 10; }
    
    shapList.push({ feature: `Comorbidity: ${label}`, weight: weight });
    score += weight;
  });

  // Demographics modifiers
  if (age > 65) {
    const ageWeight = age > 75 ? 25 : 15;
    shapList.push({ feature: `Age Factor (Geriatric Clearance ${age}y)`, weight: ageWeight });
    score += ageWeight;
  } else if (age < 30) {
    shapList.push({ feature: "Age Factor (Young patient resilience)", weight: -8 });
    score -= 8;
  }

  // Polypharmacy modifier
  if (currentMeds.length > 2) {
    const polyWeight = currentMeds.length * 4;
    shapList.push({ feature: `Polypharmacy Factor (${currentMeds.length} drugs)`, weight: polyWeight });
    score += polyWeight;
  }

  // 3. Apply Interaction Boost if any
  if (interactionsFound.length > 0) {
    const maxInteractScore = Math.max(...interactionsFound.map(i => i.riskScore));
    score = Math.max(score, maxInteractScore);
    interactionsFound.forEach(interact => {
      shapList.push({ 
        feature: `Critical Synergy: ${interact.drugA} + ${interact.drugB}`, 
        weight: interact.severity === 'Critical' || interact.severity === 'High' ? 45 : 30 
      });
    });
  }

  score = Math.max(2, Math.min(score, 99));

  // Update UI Elements
  const gaugeVal = document.getElementById('adr-risk-gauge-val');
  gaugeVal.innerText = `${score}%`;
  
  const gaugeBox = document.querySelector('.risk-gauge-box');
  
  let riskTitle = "Low ADR Risk";
  let riskText = "Standard prescription profile. Patient risk values are low.";
  let badgeColor = 'var(--accent-emerald)';
  let glowColor = 'var(--accent-emerald-glow)';

  if (score >= 75) {
    riskTitle = "High Risk Alert";
    riskText = "Immediate clinician action required. Major side-effects likely.";
    badgeColor = 'var(--accent-rose)';
    glowColor = 'var(--accent-rose-glow)';
  } else if (score >= 40) {
    riskTitle = "Moderate Warning";
    riskText = "Increased risk. Adjust dosage or monitor vitals frequently.";
    badgeColor = 'var(--accent-amber)';
    glowColor = 'var(--accent-amber-glow)';
  }

  gaugeVal.style.color = '#fff';
  gaugeBox.style.borderColor = badgeColor;
  gaugeBox.style.boxShadow = `0 0 15px ${glowColor}`;

  document.getElementById('adr-risk-summary-title').innerText = riskTitle;
  document.getElementById('adr-risk-summary-title').style.color = badgeColor;
  document.getElementById('adr-risk-summary-text').innerText = riskText;

  // Interaction alert box mapping
  const interactBox = document.getElementById('adr-interaction-box');
  if (interactionsFound.length > 0) {
    interactBox.classList.remove('hidden');
    const hasHighRisk = interactionsFound.some(i => i.severity === 'Critical' || i.severity === 'High');
    
    if (hasHighRisk) {
      interactBox.className = `interaction-alert-box alert-high`;
      interactBox.style.background = '';
      interactBox.style.border = '';
    } else {
      interactBox.className = `interaction-alert-box`;
      interactBox.style.background = 'var(--accent-amber-glow)';
      interactBox.style.border = '1px solid rgba(245, 158, 11, 0.2)';
    }
    
    interactBox.innerHTML = interactionsFound.map((interact, idx) => `
      <div class="interaction-item" style="${idx > 0 ? 'margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem;' : ''}">
        <h5 id="adr-interact-title-${idx}" style="color: ${interact.severity === 'Critical' || interact.severity === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)'}; font-weight: 700; margin-bottom: 0.25rem;">
          Interaction: ${interact.drugA} + ${interact.drugB} (${interact.severity})
        </h5>
        <p id="adr-interact-mechanism-${idx}" style="margin: 0; line-height: 1.4">${interact.mechanism}</p>
      </div>
    `).join('');
  } else {
    interactBox.classList.add('hidden');
  }

  // Alternatives mapping
  const altList = document.getElementById('adr-alternatives-list');
  altList.innerHTML = "";
  if (interactionsFound.length > 0) {
    interactionsFound.forEach(interact => {
      interact.alternatives.forEach(alt => {
        const li = document.createElement('li');
        li.innerText = alt;
        altList.appendChild(li);
      });
    });
  } else {
    // Generic advice
    const li = document.createElement('li');
    li.innerText = `No severe interactions found for ${proposedMed} with the selected profile. Continue standard monitoring of baseline side effects: ${baseDrug ? baseDrug.commonSideEffects.join(', ') : 'nausea, dizziness'}.`;
    altList.appendChild(li);
  }

  // Render SHAP
  renderSHAPChart(shapList, 'adr-shap-bars');

  // Simulated LLM Gemini Narrative
  const explanationBox = document.getElementById('adr-llm-explanation');
  const interactSummary = interactionsFound.map(i => `${i.drugA} + ${i.drugB} (${i.severity}): ${i.mechanism}`).join('<br>');
  explanationBox.innerHTML = `<strong>CLINICAL REASONING REPORT (Gemini Engine)</strong><br><br>
    Patient presents at ${age} years of age. Adding <strong>${proposedMed}</strong> to current drug list containing [${currentMeds.join(', ')}].<br><br>
    ${interactionsFound.length > 0 ? `<strong>Critical Conflict(s) Detected:</strong><br>${interactSummary}<br><br>The calculated interactive risk probability is ${score}%. Recommend implementing the alternative protocols described above immediately.` : `<strong>Safety Clear:</strong> Clearance calculations indicate standard elimination rates. Composite risk is ${score}%, primarily driven by geriatric age metrics rather than drug-to-drug metabolic competition.`}
    <br><br>
    <span style="font-size:0.75rem; color: var(--text-dark);">ABDM Token: ABDM-HITL-${Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
  `;
}

function signOffADR() {
  adrChecksRunCount++;
  document.getElementById('val-adr-checks').innerText = adrChecksRunCount;
  alert("Prescription checked, signed by licensed practitioner, and synced to ABDM Health Locker.");
}

// 5. 2.0 Roadmap & Architecture
function initRoadmap() {
  // Accordion toggle is handled via inline onclick, but we can set up references
}

function toggleRoadmapStep(stepId) {
  const steps = document.querySelectorAll('.roadmap-step');
  steps.forEach(step => {
    if (step.id === `step-${stepId}`) {
      step.classList.toggle('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// 6. Compliance & Report Panel
function initComplianceReport() {
  const container = document.getElementById('compliance-cards-container');
  container.innerHTML = "";

  HEALTHGUARD_DATA.complianceControls.forEach(ctrl => {
    const card = document.createElement('div');
    card.className = "comp-card";
    card.innerHTML = `
      <div class="comp-hdr">
        <h4>${ctrl.framework}</h4>
        <span class="badge badge-purple">${ctrl.section}</span>
      </div>
      <div class="comp-ctrl">${ctrl.control}</div>
      <div class="comp-det">${ctrl.details}</div>
    `;
    container.appendChild(card);
  });
}

// Expose accordion trigger globally
if (typeof window !== 'undefined') {
  window.toggleRoadmapStep = toggleRoadmapStep;
  window.actionClaim = actionClaim;
  window.switchTab = switchTab;
}
