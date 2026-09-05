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
  initStudentProfile();
  initDegreeAudit();
  initCSVFeatures();
  if (!loadCoursesFromStorage()) {
    loadCoursesPreset('sem8');
  }
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
  saveCoursesToStorage();
  renderGradeDistributionChart();
  updateAcademicAdvisor();
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


/* =========================================================
   Student Profile & LocalStorage Persistence
   ========================================================= */
function initStudentProfile() {
  const profileFields = ['student-name', 'student-id', 'student-program', 'student-term'];
  profileFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const saved = localStorage.getItem('aiub-profile-' + id);
      if (saved) el.value = saved;
      el.addEventListener('input', (e) => {
        localStorage.setItem('aiub-profile-' + id, e.target.value);
      });
    }
  });
}

function saveCoursesToStorage() {
  localStorage.setItem('aiub-courses-data', JSON.stringify(currentCourses));
}

function loadCoursesFromStorage() {
  try {
    const saved = localStorage.getItem('aiub-courses-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentCourses = parsed;
        renderCourseRows();
        calculateSemesterGPA();
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved courses:', e);
  }
  return false;
}

/* =========================================================
   CSV Import & Export Engine
   ========================================================= */
function initCSVFeatures() {
  const exportBtn = document.getElementById('export-csv-btn');
  const importInput = document.getElementById('import-csv-input');
  const printSlipBtn = document.getElementById('print-transcript-btn');

  if (exportBtn) {
    exportBtn.addEventListener('click', exportCoursesToCSV);
  }

  if (importInput) {
    importInput.addEventListener('change', handleCSVImport);
  }

  if (printSlipBtn) {
    printSlipBtn.addEventListener('click', prepareAndPrintGradeSlip);
  }
}

function exportCoursesToCSV() {
  if (currentCourses.length === 0) {
    alert('No courses to export! Add courses first.');
    return;
  }

  let csvContent = 'Course Title,Credits,Grade,Grade Point\r\n';
  currentCourses.forEach(c => {
    const cleanTitle = '"' + (c.title || '').replace(/"/g, '""') + '"';
    csvContent += `${cleanTitle},${c.credits},${c.grade},${c.gp.toFixed(2)}\r\n`;
  });

  const studentId = (document.getElementById('student-id')?.value || 'student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AIUB_Grades_${studentId}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);
    const newCourses = [];

    // Skip header line if present
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (i === 0 && line.toLowerCase().includes('course title')) continue;

      // Simple CSV regex for quoted fields
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (cols.length >= 2) {
        const title = cols[0].replace(/^"|"$/g, '').trim();
        const credits = parseFloat(cols[1]) || 3;
        const grade = cols[2] ? cols[2].trim() : 'A';
        const gp = cols[3] !== undefined ? parseFloat(cols[3]) : (getGradePointDetailsFromLetter(grade) || 3.75);

        newCourses.push({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          title: title,
          credits: credits,
          grade: grade,
          gp: gp
        });
      }
    }

    if (newCourses.length > 0) {
      currentCourses = newCourses;
      renderCourseRows();
      calculateSemesterGPA();
      saveCoursesToStorage();
  renderGradeDistributionChart();
  updateAcademicAdvisor();
      alert(`Successfully imported ${newCourses.length} courses from CSV.`);
    } else {
      alert('Could not parse any courses from the provided CSV file.');
    }
    event.target.value = ''; // Reset input
  };
  reader.readAsText(file);
}

function getGradePointDetailsFromLetter(letter) {
  const match = AIUB_GRADING_SCALE.find(item => item.grade.toLowerCase() === letter.toLowerCase());
  return match ? match.gp : 3.75;
}

/* =========================================================
   Official Grade Slip Generator & Print Handler
   ========================================================= */
function prepareAndPrintGradeSlip() {
  if (currentCourses.length === 0) {
    alert('Please add at least one course to generate your official grade slip.');
    return;
  }

  // Populate metadata
  const name = document.getElementById('student-name')?.value || 'N/A';
  const id = document.getElementById('student-id')?.value || 'N/A';
  const program = document.getElementById('student-program')?.value || 'N/A';
  const term = document.getElementById('student-term')?.value || 'N/A';
  const standing = document.getElementById('academic-status-badge')?.textContent || 'Good Standing';

  document.getElementById('print-disp-name').textContent = name;
  document.getElementById('print-disp-id').textContent = id;
  document.getElementById('print-disp-program').textContent = program;
  document.getElementById('print-disp-term').textContent = term;
  document.getElementById('print-disp-date').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  document.getElementById('print-disp-standing').textContent = standing;

  // Build print table
  let tableHtml = `
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">Sl No.</th>
          <th style="width: 45%;">Course Title / Catalog No.</th>
          <th style="width: 15%; text-align: center;">Credit Hours</th>
          <th style="width: 15%; text-align: center;">Letter Grade</th>
          <th style="width: 15%; text-align: center;">Grade Points</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalCr = 0;
  let passedCr = 0;
  let totalQP = 0;

  currentCourses.forEach((c, idx) => {
    totalCr += c.credits;
    totalQP += (c.credits * c.gp);
    if (c.gp >= 2.25) passedCr += c.credits;

    tableHtml += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${c.title || 'Untitled Course'}</strong></td>
        <td style="text-align: center;">${c.credits.toFixed(1)}</td>
        <td style="text-align: center;"><strong>${c.grade}</strong></td>
        <td style="text-align: center;">${c.gp.toFixed(2)}</td>
      </tr>
    `;
  });

  tableHtml += `</tbody></table>`;
  document.getElementById('print-courses-wrapper').innerHTML = tableHtml;

  const termGpa = totalCr > 0 ? (totalQP / totalCr).toFixed(2) : '0.00';
  document.getElementById('print-total-cr').textContent = totalCr.toFixed(1);
  document.getElementById('print-passed-cr').textContent = passedCr.toFixed(1);
  document.getElementById('print-total-qp').textContent = totalQP.toFixed(2);
  document.getElementById('print-term-gpa').textContent = termGpa;

  // Trigger browser print
  window.print();
}


/* =========================================================
   Pure HTML5 Canvas Grade Distribution Chart Engine
   ========================================================= */
const GRADE_COLORS = {
  'A+': '#10b981',
  'A':  '#0284c7',
  'B+': '#22c55e',
  'B':  '#eab308',
  'C+': '#f97316',
  'C':  '#f59e0b',
  'D+': '#ef4444',
  'D':  '#dc2626',
  'F':  '#991b1b'
};

function renderGradeDistributionChart() {
  const canvas = document.getElementById('grade-dist-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Clear background
  ctx.clearRect(0, 0, width, height);

  // Tally grades
  const counts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+': 0, 'D': 0, 'F': 0 };
  let maxCount = 1;

  currentCourses.forEach(c => {
    const g = (c.grade || '').toUpperCase();
    if (counts[g] !== undefined) {
      counts[g]++;
      if (counts[g] > maxCount) maxCount = counts[g];
    }
  });

  const grades = Object.keys(counts);
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 28;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const colWidth = chartW / grades.length;
  const barWidth = Math.max(12, colWidth * 0.65);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  // Draw Horizontal Grid Lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= maxCount; i++) {
    const y = paddingTop + chartH - (i / maxCount) * chartH;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    if (i > 0 && i % Math.ceil(maxCount / 4) === 0) {
      ctx.fillStyle = textColor;
      ctx.font = '9px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(i, paddingLeft - 6, y + 3);
    }
  }

  // Draw Bars
  grades.forEach((grade, idx) => {
    const count = counts[grade];
    const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
    const barH = maxCount > 0 ? (count / maxCount) * chartH : 0;
    const y = paddingTop + chartH - barH;

    // Bar rectangle
    ctx.fillStyle = count > 0 ? (GRADE_COLORS[grade] || '#3b82f6') : (isDark ? '#1e293b' : '#e2e8f0');
    
    // Rounded top bar
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(x, paddingTop + chartH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, paddingTop + chartH);
    ctx.closePath();
    ctx.fill();

    // Value text above bar
    if (count > 0) {
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(count, x + barWidth / 2, y - 5);
    }

    // Label below
    ctx.fillStyle = textColor;
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(grade, x + barWidth / 2, height - 10);
  });

  // Update subtitle & legend
  const courseCountEl = document.getElementById('chart-course-count');
  if (courseCountEl) {
    courseCountEl.textContent = `${currentCourses.length} Course${currentCourses.length === 1 ? '' : 's'}`;
  }

  const legendEl = document.getElementById('chart-legend');
  if (legendEl) {
    const activeGrades = grades.filter(g => counts[g] > 0);
    legendEl.innerHTML = activeGrades.map(g => `
      <span class="legend-tag">
        <span class="legend-color-dot" style="background: ${GRADE_COLORS[g]};"></span>
        <strong>${g}</strong>: ${counts[g]}
      </span>
    `).join('');
  }
}

// Call renderGradeDistributionChart on window resize
window.addEventListener('resize', () => {
  renderGradeDistributionChart();
  updateAcademicAdvisor();
});


/* =========================================================
   AIUB Academic Retake Recommendation Engine
   ========================================================= */
function updateAcademicAdvisor() {
  const advisorCard = document.getElementById('advisor-card');
  const advisorList = document.getElementById('advisor-list');
  const countBadge = document.getElementById('advisor-count-badge');
  if (!advisorCard || !advisorList) return;

  const lowGradeCourses = currentCourses.filter(c => c.gp <= 2.50);

  if (lowGradeCourses.length === 0) {
    advisorCard.style.display = 'none';
    return;
  }

  advisorCard.style.display = 'block';
  countBadge.textContent = `${lowGradeCourses.length} Alert${lowGradeCourses.length === 1 ? '' : 's'}`;

  advisorList.innerHTML = '';
  lowGradeCourses.forEach(c => {
    const isFailing = c.gp === 0.00;
    const item = document.createElement('div');
    item.className = `advisor-item ${isFailing ? '' : 'warning-item'}`;

    const boost = ((c.credits * (4.00 - c.gp)) / 98).toFixed(3); // Based on ~98 cr base

    item.innerHTML = `
      <div class="advisor-info">
        <span class="advisor-course-title">${c.title || 'Untitled Course'} (${c.grade} - ${c.gp.toFixed(2)} GP)</span>
        <span class="advisor-detail">
          ${isFailing 
            ? '🚨 <strong>Prerequisite Blocked:</strong> 0 credits earned. Course must be repeated to unlock future courses.' 
            : `⚠️ <strong>Marginal Passing:</strong> Retaking to A+ yields +${boost} boost to overall CGPA.`}
        </span>
      </div>
      <button class="simulate-retake-btn" data-title="${c.title}" data-credits="${c.credits}" data-gp="${c.gp}">
        Simulate Retake ➔
      </button>
    `;
    advisorList.appendChild(item);
  });

  // Attach simulator jump buttons
  advisorList.querySelectorAll('.simulate-retake-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cr = e.currentTarget.getAttribute('data-credits');
      const gp = e.currentTarget.getAttribute('data-gp');

      // Set values in Tab 3
      const courseCrInput = document.getElementById('retake-course-credits');
      const oldGradeSelect = document.getElementById('retake-old-grade');

      if (courseCrInput) courseCrInput.value = cr;
      if (oldGradeSelect) oldGradeSelect.value = parseFloat(gp).toFixed(2);

      // Jump to Tab 3
      document.getElementById('tab-retake-btn').click();
      calculateRetakeImpact();
    });
  });
}


/* =========================================================
   AIUB 148-Credit Degree Audit Engine
   Curriculum data sourced directly from G:\AIUB Course Plan
   ========================================================= */
const AIUB_DEGREE_CURRICULUM = [
  {
    group: 'General Education & Business (16 Cr)',
    requiredCr: 16,
    courses: [
      { code: 'ENG1101', title: 'English Reading & Composition', cr: 3, sem: 1 },
      { code: 'ACT1111', title: 'Financial & Managerial Accounting', cr: 3, sem: 1 },
      { code: 'ENG1202', title: 'English Writing & Speaking', cr: 3, sem: 2 },
      { code: 'BGS2101', title: 'Bangladesh Studies', cr: 3, sem: 5 },
      { code: 'ECO2102', title: 'Economics', cr: 2, sem: 5 },
      { code: 'ETH3101', title: 'Engineering Ethics', cr: 2, sem: 9 }
    ]
  },
  {
    group: 'Basic Science & Mathematics (28 Cr)',
    requiredCr: 28,
    courses: [
      { code: 'MAT1102', title: 'Differential Calculus & Geometry (Math 1)', cr: 3, sem: 1 },
      { code: 'PHY1101', title: 'Physics 1 (Theory)', cr: 3, sem: 1 },
      { code: 'PHY1102', title: 'Physics 1 (Laboratory)', cr: 1, sem: 2 },
      { code: 'MAT1203', title: 'Integral Calculus & Diff Equations (Math 2)', cr: 3, sem: 2 },
      { code: 'MAT2104', title: 'Complex Variables & Laplace (Math 3)', cr: 3, sem: 3 },
      { code: 'PHY2103', title: 'Physics 2 (Theory)', cr: 3, sem: 3 },
      { code: 'PHY2104', title: 'Physics 2 (Laboratory)', cr: 1, sem: 3 },
      { code: 'MAT2205', title: 'Matrices, Vectors & Fourier (Math 4)', cr: 3, sem: 4 },
      { code: 'MAT3106', title: 'Statistics & Probability (Math 5)', cr: 3, sem: 5 },
      { code: 'CHM2101', title: 'Chemistry (Theory & Lab)', cr: 3, sem: 6 },
      { code: 'MAT3207', title: 'Numerical Methods (Math 6)', cr: 2, sem: 4 }
    ]
  },
  {
    group: 'Core Computing & Engineering (86 Cr)',
    requiredCr: 86,
    courses: [
      { code: 'CSC1102', title: 'Introduction to Computer Studies', cr: 3, sem: 1 },
      { code: 'CSC1204', title: 'Discrete Mathematics', cr: 3, sem: 1 },
      { code: 'EEE1201', title: 'Electrical Circuits 1 (Theory)', cr: 3, sem: 2 },
      { code: 'EEE1202', title: 'Electrical Circuits 1 (Laboratory)', cr: 1, sem: 2 },
      { code: 'CSC1205', title: 'Introduction to Programming (C++)', cr: 3, sem: 2 },
      { code: 'CSC1206', title: 'IP Laboratory', cr: 1, sem: 2 },
      { code: 'CSC2107', title: 'Object-Oriented Programming (Java)', cr: 3, sem: 3 },
      { code: 'CSC2108', title: 'Database Management Systems', cr: 3, sem: 4 },
      { code: 'CSC2109', title: 'Data Structures (Theory)', cr: 3, sem: 4 },
      { code: 'CSC2110', title: 'Data Structures (Laboratory)', cr: 1, sem: 4 },
      { code: 'EEE2105', title: 'Electronic Devices (Theory)', cr: 3, sem: 4 },
      { code: 'EEE2106', title: 'Electronic Devices (Laboratory)', cr: 1, sem: 4 },
      { code: 'CSC3111', title: 'Algorithms (Theory & Lab)', cr: 3, sem: 5 },
      { code: 'EEE3107', title: 'Digital Logic Circuits (Theory)', cr: 3, sem: 5 },
      { code: 'EEE3108', title: 'Digital Logic Circuits (Laboratory)', cr: 1, sem: 5 },
      { code: 'CSC3112', title: 'Object-Oriented Analysis & Design', cr: 3, sem: 5 },
      { code: 'CSC3213', title: 'C# and .NET Framework', cr: 3, sem: 6 },
      { code: 'CSC3214', title: 'Theory of Computation', cr: 3, sem: 6 },
      { code: 'CSC3215', title: 'Compiler Design', cr: 3, sem: 7 },
      { code: 'EEE3209', title: 'Microprocessors & Embedded Systems', cr: 3, sem: 7 },
      { code: 'CSC3216', title: 'Software Engineering', cr: 3, sem: 7 },
      { code: 'COE3210', title: 'Computer-Aided Design & Drafting (CAD)', cr: 1, sem: 7 },
      { code: 'CSC4117', title: 'Artificial Intelligence & Expert Systems', cr: 3, sem: 8 },
      { code: 'CSC4118', title: 'Computer Graphics', cr: 3, sem: 8 },
      { code: 'CSC4119', title: 'Computer Organization & Architecture', cr: 3, sem: 8 },
      { code: 'CSC4120', title: 'Data Communication', cr: 3, sem: 8 },
      { code: 'CSC4121', title: 'Web Technologies', cr: 3, sem: 8 },
      { code: 'CSC4222', title: 'Operating Systems (Theory & Lab)', cr: 3, sem: 9 },
      { code: 'CSC4223', title: 'Computer Networks (Theory & Lab)', cr: 3, sem: 9 }
    ]
  },
  {
    group: 'Major Specialization Electives (9 Cr)',
    requiredCr: 9,
    courses: [
      { code: 'CSC4260', title: 'Machine Learning (Major 1)', cr: 3, sem: 9 },
      { code: 'CSC4261', title: 'Deep Learning / NLP (Major 2)', cr: 3, sem: 10 },
      { code: 'CSC4262', title: 'Cloud Computing / Cybersecurity (Major 3)', cr: 3, sem: 11 }
    ]
  },
  {
    group: 'Capstone Design & Practical Work (9 Cr)',
    requiredCr: 9,
    courses: [
      { code: 'CSC4298', title: 'Research Methodology', cr: 3, sem: 9 },
      { code: 'CSC4299', title: 'Senior Thesis / Capstone Project', cr: 3, sem: 10 },
      { code: 'CSC4300', title: 'Professional Internship / Practical Training', cr: 3, sem: 11 }
    ]
  }
];

let completedAuditCodes = new Set();

function initDegreeAudit() {
  const container = document.getElementById('audit-categories-container');
  if (!container) return;

  // Load saved audit states
  const saved = localStorage.getItem('aiub-audit-completed');
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) completedAuditCodes = new Set(arr);
    } catch(e) {}
  } else {
    // Default preset: ~98 credits completed through Semester 7
    AIUB_DEGREE_CURRICULUM.forEach(group => {
      group.courses.forEach(c => {
        if (c.sem && c.sem <= 7) completedAuditCodes.add(c.code);
      });
    });
  }

  renderDegreeAudit();

  document.getElementById('audit-select-all-btn')?.addEventListener('click', () => {
    completedAuditCodes.clear();
    AIUB_DEGREE_CURRICULUM.forEach(group => {
      group.courses.forEach(c => {
        if (c.sem && c.sem <= 7) completedAuditCodes.add(c.code);
      });
    });
    saveAuditProgress();
    renderDegreeAudit();
  });

  document.getElementById('audit-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset all degree audit checklist items?')) {
      completedAuditCodes.clear();
      saveAuditProgress();
      renderDegreeAudit();
    }
  });
}

function renderDegreeAudit() {
  const container = document.getElementById('audit-categories-container');
  if (!container) return;

  container.innerHTML = '';
  let totalEarnedCr = 0;
  let totalCoursesDone = 0;
  const groupStatus = [];

  AIUB_DEGREE_CURRICULUM.forEach((group, gIdx) => {
    const groupCard = document.createElement('div');
    groupCard.className = 'audit-group';

    let groupEarnedCr = 0;
    const coursesHtml = group.courses.map(c => {
      const isDone = completedAuditCodes.has(c.code);
      if (isDone) {
        groupEarnedCr += c.cr;
        totalEarnedCr += c.cr;
        totalCoursesDone++;
      }
      return `
        <div class="audit-course-item ${isDone ? 'completed' : ''}">
          <label class="audit-course-label">
            <input type="checkbox" class="audit-checkbox" data-code="${c.code}" ${isDone ? 'checked' : ''}>
            <span>${c.code} - ${c.title}</span>
          </label>
          <span class="audit-cr-tag">${c.cr.toFixed(1)} Cr</span>
        </div>
      `;
    }).join('');

    groupStatus.push({
      name: group.group,
      earned: groupEarnedCr,
      required: group.requiredCr
    });

    groupCard.innerHTML = `
      <div class="audit-group-header">
        <span class="audit-group-title">${group.group}</span>
        <span class="audit-group-credits">${groupEarnedCr.toFixed(1)} / ${group.requiredCr.toFixed(1)} Cr</span>
      </div>
      <div class="audit-courses-grid">
        ${coursesHtml}
      </div>
    `;
    container.appendChild(groupCard);
  });

  // Attach checkbox listeners
  container.querySelectorAll('.audit-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const code = e.target.getAttribute('data-code');
      if (e.target.checked) {
        completedAuditCodes.add(code);
      } else {
        completedAuditCodes.delete(code);
      }
      saveAuditProgress();
      renderDegreeAudit();
    });
  });

  // Update Summary Metrics
  const remainingCr = Math.max(0, 148 - totalEarnedCr);
  const percent = Math.min(100, (totalEarnedCr / 148) * 100);

  document.getElementById('audit-completed-cr-val').textContent = totalEarnedCr.toFixed(1);
  document.getElementById('audit-percent-sub').textContent = `${percent.toFixed(1)}% of 148.0 Total Credits`;
  document.getElementById('audit-progress-fill').style.width = `${percent}%`;
  document.getElementById('audit-remaining-cr-val').textContent = remainingCr.toFixed(1);
  document.getElementById('audit-completed-courses-val').textContent = totalCoursesDone;

  const estSemesters = Math.ceil(remainingCr / 15);
  document.getElementById('audit-semesters-left-val').textContent = remainingCr === 0 ? '0 (Graduate!)' : `~${estSemesters} Sem`;

  const thesisStatus = document.getElementById('audit-thesis-status');
  if (totalEarnedCr >= 105) {
    thesisStatus.textContent = '✅ Eligible';
    thesisStatus.style.color = 'var(--success)';
  } else {
    thesisStatus.textContent = `${(105 - totalEarnedCr).toFixed(1)} Cr to go`;
    thesisStatus.style.color = 'var(--text-secondary)';
  }

  const badge = document.getElementById('audit-status-badge');
  if (totalEarnedCr >= 148) {
    badge.textContent = '🎓 Degree Clearance Approved';
    badge.className = 'badge';
  } else if (totalEarnedCr >= 105) {
    badge.textContent = 'Senior Standing (Final Year)';
    badge.className = 'badge badge-accent';
  } else {
    badge.textContent = 'Undergraduate In-Progress';
    badge.className = 'badge';
  }

  // Update breakdown pills
  const pillGrid = document.getElementById('cat-pill-grid');
  if (pillGrid) {
    pillGrid.innerHTML = groupStatus.map(g => `
      <div class="cat-pill">
        <span>${g.name.split(' (')[0]}</span>
        <strong>${g.earned.toFixed(1)} / ${g.required.toFixed(1)} Cr</strong>
      </div>
    `).join('');
  }
}

function saveAuditProgress() {
  localStorage.setItem('aiub-audit-completed', JSON.stringify(Array.from(completedAuditCodes)));
}
