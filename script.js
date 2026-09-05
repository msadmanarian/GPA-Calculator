/* =========================================================
   AIUB GPA & CGPA Calculator — Pure Vanilla JavaScript Engine
   Academic Source: G:\AIUB coursework & grading regulations
   ========================================================= */

// AIUB Official Grading Matrix (4.00 Max Scale)
const AIUB_GRADING_SCALE = [
  { minMark: 90, maxMark: 100, grade: 'A+', gp: 4.00, desc: 'Outstanding' },
  { minMark: 85, maxMark: 89,  grade: 'A',  gp: 3.75, desc: 'Excellent' },
  { minMark: 80, maxMark: 84,  grade: 'B+', gp: 3.50, desc: 'Very Good' },
  { minMark: 75, maxMark: 79,  grade: 'B',  gp: 3.25, desc: 'Good' },
  { minMark: 70, maxMark: 74,  grade: 'C+', gp: 3.00, desc: 'Satisfactory' },
  { minMark: 65, maxMark: 69,  grade: 'C',  gp: 2.75, desc: 'Pass' },
  { minMark: 60, maxMark: 64,  grade: 'D+', gp: 2.50, desc: 'Passing' },
  { minMark: 50, maxMark: 59,  grade: 'D',  gp: 2.25, desc: 'Conditional Passing' },
  { minMark: 0,  maxMark: 49,  grade: 'F',  gp: 0.00, desc: 'Failing' }
];

// Grade Point to Letter Grade reverse lookup
function getGradePointDetails(gp) {
  const match = AIUB_GRADING_SCALE.find(item => Math.abs(item.gp - gp) < 0.01);
  return match || { grade: 'N/A', gp: gp, desc: '' };
}

// Convert percentage marks to Grade & Grade Point
function marksToGrade(marks) {
  const num = parseFloat(marks);
  if (isNaN(num)) return null;
  const clamped = Math.max(0, Math.min(100, Math.round(num)));
  for (const item of AIUB_GRADING_SCALE) {
    if (clamped >= item.minMark && clamped <= item.maxMark) {
      return item;
    }
  }
  return AIUB_GRADING_SCALE[AIUB_GRADING_SCALE.length - 1];
}

// Actual AIUB Course Presets from G:\AIUB coursework
const AIUB_PRESETS = {
  sem1: [
    { title: 'CSC1102 - Intro to Computer Studies', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'CSC1204 - Discrete Mathematics', credits: 3, grade: 'A+', gp: 4.00 },
    { title: 'MAT1102 - Differential Calculus & Coordinate Geometry', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'PHY1101 - Physics 1', credits: 3, grade: 'B+', gp: 3.50 },
    { title: 'ACT1111 - Financial & Managerial Accounting', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'ENG1101 - English Reading & Composition', credits: 3, grade: 'A+', gp: 4.00 }
  ],
  sem4: [
    { title: 'CSC2108 - Database Management Systems', credits: 3, grade: 'A+', gp: 4.00 },
    { title: 'CSC2109 - Data Structures (Theory)', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'CSC2110 - Data Structures (Laboratory)', credits: 1, grade: 'A+', gp: 4.00 },
    { title: 'EEE2105 - Electronic Devices (Theory)', credits: 3, grade: 'B+', gp: 3.50 },
    { title: 'EEE2106 - Electronic Devices (Laboratory)', credits: 1, grade: 'A', gp: 3.75 },
    { title: 'MAT2101 - Numerical Methods & Statistics', credits: 3, grade: 'A', gp: 3.75 }
  ],
  sem8: [
    { title: 'CSC4160 - Artificial Intelligence & Expert Systems', credits: 3, grade: 'A+', gp: 4.00 },
    { title: 'CSC4161 - Computer Graphics', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'CSC4162 - Computer Organization & Architecture', credits: 3, grade: 'A', gp: 3.75 },
    { title: 'CSC4163 - Data Communication', credits: 3, grade: 'B+', gp: 3.50 },
    { title: 'CSC4164 - Web Technologies', credits: 3, grade: 'A+', gp: 4.00 }
  ]
};

// Application State
let currentCourses = [];

// Initialize DOM
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initCourseTable();
  initCGPAForecaster();
  initTargetAndRetake();
  initPresetModal();

  // Load default course bundle
  loadCoursesPreset('sem8');
});

/* =========================================================
   Theme Switcher (Persistent)
   ========================================================= */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('aiub-gpa-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aiub-gpa-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* =========================================================
   Tab Navigation
   ========================================================= */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* =========================================================
   Semester GPA Table & Calculation Logic
   ========================================================= */
function initCourseTable() {
  const addBtn = document.getElementById('add-course-btn');
  const resetBtn = document.getElementById('reset-courses-btn');
  const sendToCgpaBtn = document.getElementById('send-to-cgpa-btn');

  addBtn.addEventListener('click', () => {
    addCourseRow({
      title: 'Course ' + (currentCourses.length + 1),
      credits: 3,
      grade: 'A',
      gp: 3.75
    });
    calculateSemesterGPA();
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Clear all course rows for current semester?')) {
      currentCourses = [];
      renderCourseRows();
      calculateSemesterGPA();
    }
  });

  sendToCgpaBtn.addEventListener('click', () => {
    // Jump to Tab 2 and sync
    document.getElementById('tab-cgpa-btn').click();
    syncSemesterToCGPA();
  });
}

function addCourseRow(data) {
  const course = {
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    title: data.title || '',
    credits: data.credits !== undefined ? parseFloat(data.credits) : 3,
    grade: data.grade || 'A',
    gp: data.gp !== undefined ? parseFloat(data.gp) : 3.75
  };
  currentCourses.push(course);
  renderCourseRows();
}

function renderCourseRows() {
  const tbody = document.getElementById('courses-body');
  tbody.innerHTML = '';

  if (currentCourses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No courses added yet. Click "+ Add Course" or load a preset.</td></tr>`;
    return;
  }

  currentCourses.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" class="form-control-sm course-title-input" value="${c.title}" placeholder="Course Title / Code" data-id="${c.id}">
      </td>
      <td>
        <select class="form-control-sm course-credits-select" data-id="${c.id}">
          <option value="1" ${c.credits === 1 ? 'selected' : ''}>1.0 (Lab)</option>
          <option value="2" ${c.credits === 2 ? 'selected' : ''}>2.0 (Theory)</option>
          <option value="3" ${c.credits === 3 ? 'selected' : ''}>3.0 (Theory/Lab)</option>
          <option value="4" ${c.credits === 4 ? 'selected' : ''}>4.0 (Project/Thesis)</option>
        </select>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <select class="form-control-sm course-grade-select" data-id="${c.id}" style="width: 60%;">
            ${AIUB_GRADING_SCALE.map(g => `<option value="${g.gp}" ${Math.abs(g.gp - c.gp) < 0.01 ? 'selected' : ''}>${g.grade} (${g.gp.toFixed(2)})</option>`).join('')}
          </select>
          <input type="number" min="0" max="100" class="form-control-sm course-marks-input" placeholder="Marks" data-id="${c.id}" style="width: 40%;" title="Enter 0-100 to auto-set grade">
        </div>
      </td>
      <td>
        <span class="course-gp-display" style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${c.gp.toFixed(2)}</span>
      </td>
      <td style="text-align: center;">
        <button class="delete-row-btn" data-id="${c.id}" title="Remove course">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachCourseRowListeners();
}

function attachCourseRowListeners() {
  // Title changes
  document.querySelectorAll('.course-title-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = currentCourses.find(c => c.id === id);
      if (item) item.title = e.target.value;
    });
  });

  // Credit changes
  document.querySelectorAll('.course-credits-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = currentCourses.find(c => c.id === id);
      if (item) {
        item.credits = parseFloat(e.target.value);
        calculateSemesterGPA();
      }
    });
  });

  // Grade dropdown changes
  document.querySelectorAll('.course-grade-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = currentCourses.find(c => c.id === id);
      if (item) {
        item.gp = parseFloat(e.target.value);
        const details = getGradePointDetails(item.gp);
        item.grade = details.grade;
        // update GP display in row
        const row = select.closest('tr');
        row.querySelector('.course-gp-display').textContent = item.gp.toFixed(2);
        row.querySelector('.course-marks-input').value = '';
        calculateSemesterGPA();
      }
    });
  });

  // Marks input changes (auto-convert to grade)
  document.querySelectorAll('.course-marks-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val === '') return;
      const converted = marksToGrade(val);
      if (converted) {
        const id = e.target.getAttribute('data-id');
        const item = currentCourses.find(c => c.id === id);
        if (item) {
          item.gp = converted.gp;
          item.grade = converted.grade;
          const row = input.closest('tr');
          row.querySelector('.course-grade-select').value = converted.gp.toFixed(2);
          row.querySelector('.course-gp-display').textContent = converted.gp.toFixed(2);
          calculateSemesterGPA();
        }
      }
    });
  });

  // Delete row
  document.querySelectorAll('.delete-row-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      currentCourses = currentCourses.filter(c => c.id !== id);
      renderCourseRows();
      calculateSemesterGPA();
    });
  });
}

// Compute Term GPA according to AIUB Formula
function calculateSemesterGPA() {
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let passedCredits = 0;

  currentCourses.forEach(c => {
    totalCredits += c.credits;
    totalQualityPoints += (c.credits * c.gp);
    if (c.gp >= 2.25) {
      passedCredits += c.credits;
    }
  });

  const termGPA = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0.00;

  // Update DOM metrics
  document.getElementById('term-gpa-val').textContent = termGPA.toFixed(2);
  document.getElementById('total-credits-val').textContent = totalCredits.toFixed(1);
  document.getElementById('total-qp-val').textContent = totalQualityPoints.toFixed(2);
  document.getElementById('total-courses-val').textContent = currentCourses.length;
  document.getElementById('passed-credits-val').textContent = passedCredits.toFixed(1);

  // Update letter grade subtext
  const gpaDetails = getGradePointDetails(termGPA);
  document.getElementById('term-gpa-letter').textContent = totalCredits > 0 ? `Equivalent Standing: ${getEquivalentLetter(termGPA)}` : 'Grade: N/A';

  // Academic Standing Badge & Honors
  const statusBadge = document.getElementById('academic-status-badge');
  const honorsTitle = document.getElementById('honors-title');
  const honorsDesc = document.getElementById('honors-desc');

  if (totalCredits === 0) {
    statusBadge.textContent = 'No Courses';
    statusBadge.className = 'badge';
    honorsTitle.textContent = 'Awaiting Course Input';
    honorsDesc.textContent = 'Enter course details to determine your standing.';
    return;
  }

  if (termGPA >= 3.75 && totalCredits >= 12) {
    statusBadge.textContent = "Dean's Honor List";
    statusBadge.className = 'badge';
    honorsTitle.textContent = "🏆 Dean's Honor List Eligible";
    honorsDesc.textContent = `Term GPA of ${termGPA.toFixed(2)} with ${totalCredits} credits qualifies for the AIUB Dean's Honor List this semester.`;
  } else if (termGPA >= 3.50) {
    statusBadge.textContent = 'High Standing';
    statusBadge.className = 'badge badge-accent';
    honorsTitle.textContent = '⭐ Outstanding Performance';
    honorsDesc.textContent = `Consistent Term GPA of ${termGPA.toFixed(2)} maintains high academic standing for graduation honors.`;
  } else if (termGPA >= 2.50) {
    statusBadge.textContent = 'Good Standing';
    statusBadge.className = 'badge';
    honorsTitle.textContent = '✅ Good Academic Standing';
    honorsDesc.textContent = 'Progressing smoothly toward degree completion requirements.';
  } else if (termGPA >= 2.00) {
    statusBadge.textContent = 'Academic Warning';
    statusBadge.className = 'badge' ;
    statusBadge.style.background = 'var(--warning-light)';
    statusBadge.style.color = 'var(--warning)';
    honorsTitle.textContent = '⚠️ Academic Warning Notice';
    honorsDesc.textContent = 'Term GPA is below 2.50. Focus on core prerequisite course retakes next semester.';
  } else {
    statusBadge.textContent = 'Academic Probation';
    statusBadge.className = 'badge';
    statusBadge.style.background = 'var(--danger-light)';
    statusBadge.style.color = 'var(--danger)';
    honorsTitle.textContent = '🚨 Academic Probation Alert';
    honorsDesc.textContent = 'Term GPA is critically below 2.00. Consultation with academic advisor required.';
  }
}

function getEquivalentLetter(gpa) {
  if (gpa >= 3.90) return 'A+ (Outstanding)';
  if (gpa >= 3.75) return 'A (Excellent)';
  if (gpa >= 3.50) return 'B+ (Very Good)';
  if (gpa >= 3.25) return 'B (Good)';
  if (gpa >= 3.00) return 'C+ (Satisfactory)';
  if (gpa >= 2.75) return 'C (Pass)';
  if (gpa >= 2.50) return 'D+ (Passing)';
  if (gpa >= 2.25) return 'D (Conditional Pass)';
  return 'F (Fail)';
}

/* =========================================================
   CGPA Forecaster Logic
   ========================================================= */
function initCGPAForecaster() {
  const inputs = ['prev-credits', 'prev-cgpa', 'curr-term-credits', 'curr-term-gpa'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateCumulativeCGPA);
    }
  });

  const syncBtn = document.getElementById('sync-from-term-btn');
  syncBtn.addEventListener('click', syncSemesterToCGPA);

  calculateCumulativeCGPA();
}

function syncSemesterToCGPA() {
  const totalCredits = parseFloat(document.getElementById('total-credits-val').textContent) || 0;
  const termGPA = parseFloat(document.getElementById('term-gpa-val').textContent) || 0;

  if (totalCredits > 0) {
    document.getElementById('curr-term-credits').value = totalCredits;
    document.getElementById('curr-term-gpa').value = termGPA.toFixed(2);
    calculateCumulativeCGPA();
  }
}

function calculateCumulativeCGPA() {
  const prevCredits = parseFloat(document.getElementById('prev-credits').value) || 0;
  const prevCGPA = parseFloat(document.getElementById('prev-cgpa').value) || 0;
  const termCredits = parseFloat(document.getElementById('curr-term-credits').value) || 0;
  const termGPA = parseFloat(document.getElementById('curr-term-gpa').value) || 0;

  const prevQP = prevCredits * prevCGPA;
  const termQP = termCredits * termGPA;
  const newTotalCredits = prevCredits + termCredits;
  const newTotalQP = prevQP + termQP;

  const newCGPA = newTotalCredits > 0 ? (newTotalQP / newTotalCredits) : 0;
  const delta = newCGPA - prevCGPA;

  // Render
  document.getElementById('projected-cgpa-val').textContent = newCGPA.toFixed(2);
  document.getElementById('disp-prev-credits').textContent = prevCredits.toFixed(1);
  document.getElementById('disp-new-credits').textContent = newTotalCredits.toFixed(1);
  document.getElementById('disp-total-qp').textContent = newTotalQP.toFixed(1);

  // Degree progress (AIUB standard BSc in CSE is ~148 credits)
  const degProg = Math.min(100, (newTotalCredits / 148) * 100);
  document.getElementById('disp-degree-prog').textContent = degProg.toFixed(1) + '%';

  // Delta Badge
  const deltaBadge = document.getElementById('cgpa-delta-badge');
  const sign = delta >= 0 ? '+' : '';
  deltaBadge.textContent = `${sign}${delta.toFixed(2)} Change`;
  if (delta >= 0) {
    deltaBadge.style.background = 'var(--success-light)';
    deltaBadge.style.color = 'var(--success)';
  } else {
    deltaBadge.style.background = 'var(--danger-light)';
    deltaBadge.style.color = 'var(--danger)';
  }

  // Distinction standing
  const standingSub = document.getElementById('projected-cgpa-standing');
  if (newCGPA >= 3.90) {
    standingSub.textContent = 'Summa Cum Laude (Highest Distinction Eligible)';
  } else if (newCGPA >= 3.75) {
    standingSub.textContent = 'Magna Cum Laude (High Distinction Eligible)';
  } else if (newCGPA >= 3.65) {
    standingSub.textContent = 'Cum Laude (Distinction Eligible)';
  } else if (newCGPA >= 3.00) {
    standingSub.textContent = 'Good Academic Standing (Graduation Capable)';
  } else {
    standingSub.textContent = 'Caution: Minimum 2.50 CGPA required for graduation';
  }
}

/* =========================================================
   Target CGPA & Course Retake Planner
   ========================================================= */
function initTargetAndRetake() {
  // Target CGPA listeners
  const targetInputs = ['target-current-cgpa', 'target-earned-credits', 'target-remaining-credits', 'target-desired-cgpa'];
  targetInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateTargetGPA);
  });

  // Retake simulator listeners
  const retakeInputs = ['retake-current-cgpa', 'retake-total-credits', 'retake-course-credits', 'retake-old-grade', 'retake-new-grade'];
  retakeInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateRetakeImpact);
  });

  calculateTargetGPA();
  calculateRetakeImpact();
}

function calculateTargetGPA() {
  const currentCGPA = parseFloat(document.getElementById('target-current-cgpa').value) || 0;
  const earnedCredits = parseFloat(document.getElementById('target-earned-credits').value) || 0;
  const remainingCredits = parseFloat(document.getElementById('target-remaining-credits').value) || 0;
  const desiredCGPA = parseFloat(document.getElementById('target-desired-cgpa').value) || 0;

  if (remainingCredits <= 0) {
    document.getElementById('target-required-gpa-val').textContent = 'N/A';
    document.getElementById('target-required-status').textContent = 'Remaining credits must be greater than 0';
    return;
  }

  const totalFinalCredits = earnedCredits + remainingCredits;
  const currentTotalQP = currentCGPA * earnedCredits;
  const desiredTotalQP = desiredCGPA * totalFinalCredits;
  const neededQP = desiredTotalQP - currentTotalQP;
  const requiredGPA = neededQP / remainingCredits;

  const valEl = document.getElementById('target-required-gpa-val');
  const statusEl = document.getElementById('target-required-status');

  valEl.textContent = requiredGPA.toFixed(2);

  if (requiredGPA > 4.00) {
    statusEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">Mathematically Unachievable</span> (Requires > 4.00). Consider retaking past low-grade courses to boost your base quality points.`;
  } else if (requiredGPA <= 2.25) {
    statusEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">Easily Achievable!</span> Maintaining a standard passing grade (D/D+) will secure your goal.`;
  } else {
    statusEl.innerHTML = `Achievable by averaging at least a <strong>${getEquivalentLetter(requiredGPA)}</strong> across all remaining semesters.`;
  }
}

function calculateRetakeImpact() {
  const currentCGPA = parseFloat(document.getElementById('retake-current-cgpa').value) || 0;
  const totalCredits = parseFloat(document.getElementById('retake-total-credits').value) || 0;
  const courseCredits = parseFloat(document.getElementById('retake-course-credits').value) || 3;
  const oldGP = parseFloat(document.getElementById('retake-old-grade').value) || 0;
  const newGP = parseFloat(document.getElementById('retake-new-grade').value) || 4.0;

  if (totalCredits <= 0) return;

  const currentQP = currentCGPA * totalCredits;
  const qpGain = courseCredits * (newGP - oldGP);
  const newQP = currentQP + qpGain;
  const newCGPA = newQP / totalCredits; // In AIUB retakes, credits are not duplicated; the old grade is replaced

  const delta = newCGPA - currentCGPA;

  document.getElementById('retake-boost-val').textContent = (delta >= 0 ? '+' : '') + delta.toFixed(3);
  document.getElementById('retake-new-cgpa-val').textContent = newCGPA.toFixed(2);
}

/* =========================================================
   Preset Modal
   ========================================================= */
function initPresetModal() {
  const modal = document.getElementById('preset-modal');
  const openBtn = document.getElementById('quick-preset-btn');
  const closeBtn = document.getElementById('modal-close-btn');

  openBtn.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.querySelectorAll('.preset-item').forEach(item => {
    item.addEventListener('click', () => {
      const presetKey = item.getAttribute('data-preset');
      loadCoursesPreset(presetKey);
      modal.classList.remove('active');
    });
  });

  const printBtn = document.getElementById('print-scale-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

function loadCoursesPreset(presetKey) {
  const presetData = AIUB_PRESETS[presetKey];
  if (presetData) {
    currentCourses = [];
    presetData.forEach(c => {
      currentCourses.push({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        title: c.title,
        credits: c.credits,
        grade: c.grade,
        gp: c.gp
      });
    });
    renderCourseRows();
    calculateSemesterGPA();
  }
}
