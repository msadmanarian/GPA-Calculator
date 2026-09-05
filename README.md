# GPA-Calculator

An interactive, accurate, and comprehensive **Academic GPA & CGPA Planning Suite** custom-engineered for students of the **American International University-Bangladesh (AIUB)**. 

Developed as **Day 01** of the **30-Day AIUB GitHub Project Challenge**, directly grounded in the official academic regulations, degree plan, and coursework found in `G:\AIUB`.

---

## Academic Concept

- **Course:** Academic Planning / Introduction to Computer Studies (ICS)
- **Topic:** Academic Grading Framework & Weighted Quality Point Calculation
- **Academic Source:** `G:\AIUB\Course Plan\Course.docx` & AIUB Semester Course Catalog

### Theory & Mathematical Foundation

In the American International University-Bangladesh academic system, student performance is quantified on a **4.00 Grade Point scale**. Every letter grade corresponds directly to an earned Grade Point (GP) and percentage mark range:

| Marks (%) | Letter Grade | Grade Point (GP) | Qualitative Standing |
|:---:|:---:|:---:|:---|
| 90% – 100% | **A+** | 4.00 | Outstanding |
| 85% – 89% | **A** | 3.75 | Excellent |
| 80% – 84% | **B+** | 3.50 | Very Good |
| 75% – 79% | **B** | 3.25 | Good |
| 70% – 74% | **C+** | 3.00 | Satisfactory |
| 65% – 69% | **C** | 2.75 | Pass |
| 60% – 64% | **D+** | 2.50 | Passing |
| 50% – 59% | **D** | 2.25 | Conditional Passing |
| 0% – 49% | **F** | 0.00 | Failing |

#### 1. Term Grade Point Average (GPA)
The Term GPA measures performance over a single academic semester:
$$\text{Term GPA} = \frac{\sum_{i=1}^{N} (\text{Credits}_i \times \text{Grade Point}_i)}{\sum_{i=1}^{N} \text{Credits}_i}$$

#### 2. Cumulative Grade Point Average (CGPA)
The overall academic standing across all semesters attempted:
$$\text{CGPA} = \frac{\text{Total Quality Points Earned}}{\text{Total Credits Attempted}} = \frac{(\text{Previous CGPA} \times \text{Previous Credits}) + (\text{Term GPA} \times \text{Term Credits})}{\text{Previous Credits} + \text{Term Credits}}$$

#### 3. Target GPA Requirement Formula
To attain a desired graduation CGPA with $R$ remaining credits:
$$\text{Required Future GPA} = \frac{\text{Desired CGPA} \times (E + R) - (\text{Current CGPA} \times E)}{R}$$
*(where $E = \text{Earned Credits}$, $R = \text{Remaining Credits}$)*

#### 4. Course Retake Policy Impact
When retaking a course at AIUB, the previous lower grade is superseded by the new grade without duplicating the course credits:
$$\text{New Quality Points} = \text{Current Total QP} + [\text{Course Credits} \times (\text{GP}_{\text{new}} - \text{GP}_{\text{old}})]$$

---

## Features

- **Semester GPA Calculator**:
  - Dynamic table supporting addition/removal of unlimited course rows.
  - Dual input modes: direct Letter Grade dropdown or auto-grade conversion from raw exam marks (0-100%).
  - Live calculation of Term GPA, Total Credits, Passing Credits, and Total Quality Points.
  - Automatic Academic Standing badge detection (*Dean's Honor List, High Standing, Good Standing, Academic Warning, Academic Probation*).
- **Cumulative CGPA Forecaster**:
  - Seamlessly bridges past transcript history with current semester projections.
  - One-click synchronization from the active semester course list.
  - Degree completion progress bar benchmarked against the standard AIUB 148-credit BSc degree.
- **Target CGPA & Retake Impact Simulator**:
  - Calculates the exact future GPA needed across remaining semesters to hit graduation honors.
  - Real-time retake impact simulator showing instantaneous CGPA boost when replacing a D or C grade with an A/A+.
- **Official AIUB Grading Scale & Honors Reference**:
  - Complete matrix with criteria for *Summa Cum Laude* (&ge;3.90), *Magna Cum Laude* (&ge;3.75), *Cum Laude* (&ge;3.65), and *Dean's Honor List* (Term GPA &ge; 3.75, &ge; 12 credits).
- **AIUB Weekly Class Routine & Timetable Scheduler**:
  - Interactive weekly schedule builder supporting Sunday through Thursday timetable slots and campus room allocations (e.g., Building 1, 2, 3, Annex, DS0108).
  - Real-time time-overlap conflict detection (schedule clash alert system).
  - Pre-loaded with official AIUB Semester 8 course routine from `G:\AIUB`.
- **148-Credit AIUB Degree Audit & Graduation Clearance Checklist**:
  - Full catalog of B.Sc. in CSE courses divided into academic groups (*General Education, Basic Sciences & Math, Core Computing, Major Electives, and Capstone/Thesis*).
  - Dynamic graduation progress bar with real-time remaining credits, estimated semesters to completion, and senior thesis eligibility tracking (>= 105 credits).
  - Persistent state saved locally in the user's browser.
- **Academic Retake Recommendation Engine & Advisory Alerts**:
  - Automatically identifies D (2.25) or F (0.00) courses according to AIUB academic standing guidelines.
  - Warns about blocked prerequisite paths for failing courses and calculates exact CGPA gain for retakes.
  - One-click transfer into the Course Retake Simulator to evaluate potential grade replacements.
- **Interactive Grade Distribution Visualizer (HTML5 Canvas)**:
  - Custom pure HTML5 Canvas bar chart rendering the exact frequency distribution of letter grades (A+, A, B+, B, C+, C, D+, D, F) for the semester.
  - Automatically adapts to light/dark themes with dynamic scaling, custom high-DPI canvas handling, and dynamic color legend.
- **Student Profile & Official Grade Slip Export**:
  - Configurable student credentials (Name, Student ID, Department/Program, and Academic Session).
  - One-click "Export Grade Slip" generating an official-style academic grade sheet slip formatted with university headers, course metrics, and advisor signature lines for print or PDF export.
- **CSV Data Import & Export**:
  - Full semester course backup to `.csv` and instant bulk course restoration from CSV files.
- **Offline LocalStorage Persistence**:
  - Auto-saves student profile details and active course records to browser local storage.
- **Curriculum Presets**:
  - Pre-loaded with actual AIUB semester curricula from `G:\AIUB` (Semester 1 Foundation, Semester 4 Core CS, Semester 8 Advanced CS).
- **Modern User Experience**:
  - 100% responsive, dark mode and light mode with persistent local storage.
  - Pure Vanilla web technology (zero dependencies, zero build steps, completely offline).

---

## Technologies

- **HTML5**: Semantic document structure with accessible ARIA tab patterns.
- **CSS3**: Modern CSS variables, flexbox, CSS grid, glassmorphism card surfaces, and dark/light mode transitions.
- **Vanilla JavaScript (ES6+)**: Pure algorithmic calculations, DOM event delegation, local storage caching.
- **Python 3**: Automated unit test suite verifying mathematical correctness.

---

## Project Structure

```text
01-GPA-Calculator/
│
├── index.html          # Semantic HTML structure & accessible tab navigation
├── style.css           # Modern design system, responsive grid & dark mode
├── script.js           # Core GPA/CGPA algorithms & interactive UI controller
├── .gitignore          # Standard repository exclusions
├── README.md           # Comprehensive academic & operational documentation
└── tests/
    └── test_gpa.py     # Automated unit test suite verifying formulas & edge cases
```

---

## How to Run

### Option 1: Direct Browser Launch
Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari):
- Double-click `index.html` in Windows Explorer, OR
- Run via PowerShell:
```powershell
Start-Process "index.html"
```

### Option 2: Local HTTP Server (Python)
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## Running the Automated Tests

A Python unit test suite is included in `tests/test_gpa.py` to mathematically verify the calculation logic against AIUB edge cases:

```bash
python tests/test_gpa.py
```

Expected Output:
```text
test_aiub_grading_scale (__main__.TestAIUBGPACalculator.test_aiub_grading_scale) ... ok
test_dean_honor_list_qualification (__main__.TestAIUBGPACalculator.test_dean_honor_list_qualification) ... ok
test_retake_impact (__main__.TestAIUBGPACalculator.test_retake_impact) ... ok
test_semester_gpa_calculation (__main__.TestAIUBGPACalculator.test_semester_gpa_calculation) ... ok
test_target_cgpa_calculation (__main__.TestAIUBGPACalculator.test_target_cgpa_calculation) ... ok

----------------------------------------------------------------------
Ran 5 tests in 0.002s

OK
```

---

## Example Calculation

### Semester 8 Scenario:
- **Artificial Intelligence (3 Cr):** A+ (4.00) &rarr; $3 \times 4.00 = 12.00$ QP
- **Computer Graphics (3 Cr):** A (3.75) &rarr; $3 \times 3.75 = 11.25$ QP
- **Computer Architecture (3 Cr):** A (3.75) &rarr; $3 \times 3.75 = 11.25$ QP
- **Data Communication (3 Cr):** B+ (3.50) &rarr; $3 \times 3.50 = 10.50$ QP
- **Web Technologies (3 Cr):** A+ (4.00) &rarr; $3 \times 4.00 = 12.00$ QP

- **Total Credits:** $15.0$
- **Total Quality Points:** $57.00$
- **Term GPA:** $57.00 / 15.0 = 3.80$
- **Academic Standing:** **Dean's Honor List Eligible** (Term GPA $\ge 3.75$, Credits $\ge 12$).

---

## What I Learned

1. Deepened practical understanding of university degree progression mechanics and credit-weighted GPA algorithms.
2. Modeled edge-case scenarios including course retakes where previous grades are supplanted without inflating total credits completed.
3. Implemented a responsive multi-tab interface with zero framework overhead using clean Vanilla Web standards.

---

## Source

This project was developed as part of the **Antigravity 30-Day AIUB GitHub Project Challenge**, formulated directly from academic records and curriculum structures in `G:\AIUB`.
