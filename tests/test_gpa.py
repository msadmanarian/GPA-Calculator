import unittest

# AIUB Official Grading Matrix
AIUB_SCALE = [
    (90, 100, 'A+', 4.00),
    (85, 89,  'A',  3.75),
    (80, 84,  'B+', 3.50),
    (75, 79,  'B',  3.25),
    (70, 74,  'C+', 3.00),
    (65, 69,  'C',  2.75),
    (60, 64,  'D+', 2.50),
    (50, 59,  'D',  2.25),
    (0,  49,  'F',  0.00)
]

def marks_to_grade(marks):
    clamped = max(0, min(100, round(marks)))
    for min_m, max_m, letter, gp in AIUB_SCALE:
        if clamped >= min_m and clamped <= max_m:
            return letter, gp
    return 'F', 0.00

def calculate_term_gpa(courses):
    total_cr = sum(c['credits'] for c in courses)
    if total_cr == 0:
        return 0.0, 0.0
    total_qp = sum(c['credits'] * c['gp'] for c in courses)
    return round(total_qp / total_cr, 2), total_qp

def calculate_cumulative_cgpa(prev_cr, prev_cgpa, term_cr, term_gpa):
    new_cr = prev_cr + term_cr
    if new_cr == 0:
        return 0.0
    new_qp = (prev_cr * prev_cgpa) + (term_cr * term_gpa)
    return round(new_qp / new_cr, 2)

def calculate_target_required_gpa(current_cgpa, earned_cr, remaining_cr, desired_cgpa):
    if remaining_cr <= 0:
        return None
    total_cr = earned_cr + remaining_cr
    needed_qp = (desired_cgpa * total_cr) - (current_cgpa * earned_cr)
    return round(needed_qp / remaining_cr, 2)

def calculate_retake_impact(current_cgpa, total_cr, course_cr, old_gp, new_gp):
    if total_cr <= 0:
        return current_cgpa
    current_qp = current_cgpa * total_cr
    gain = course_cr * (new_gp - old_gp)
    new_qp = current_qp + gain
    return round(new_qp / total_cr, 2)

class TestAIUBGPACalculator(unittest.TestCase):

    def test_aiub_grading_scale(self):
        self.assertEqual(marks_to_grade(95), ('A+', 4.00))
        self.assertEqual(marks_to_grade(85), ('A', 3.75))
        self.assertEqual(marks_to_grade(82), ('B+', 3.50))
        self.assertEqual(marks_to_grade(76), ('B', 3.25))
        self.assertEqual(marks_to_grade(71), ('C+', 3.00))
        self.assertEqual(marks_to_grade(67), ('C', 2.75))
        self.assertEqual(marks_to_grade(61), ('D+', 2.50))
        self.assertEqual(marks_to_grade(52), ('D', 2.25))
        self.assertEqual(marks_to_grade(45), ('F', 0.00))

    def test_semester_gpa_calculation(self):
        courses = [
            {'title': 'AI', 'credits': 3, 'gp': 4.00},
            {'title': 'Graphics', 'credits': 3, 'gp': 3.75},
            {'title': 'COA', 'credits': 3, 'gp': 3.75},
            {'title': 'DataCom', 'credits': 3, 'gp': 3.50},
            {'title': 'WebTech', 'credits': 3, 'gp': 4.00}
        ]
        gpa, qp = calculate_term_gpa(courses)
        self.assertEqual(qp, 57.0)
        self.assertEqual(gpa, 3.80)

    def test_dean_honor_list_qualification(self):
        courses = [
            {'title': 'Course 1', 'credits': 3, 'gp': 3.75},
            {'title': 'Course 2', 'credits': 3, 'gp': 3.75},
            {'title': 'Course 3', 'credits': 3, 'gp': 4.00},
            {'title': 'Course 4', 'credits': 3, 'gp': 3.50}
        ]
        gpa, _ = calculate_term_gpa(courses)
        total_cr = sum(c['credits'] for c in courses)
        self.assertGreaterEqual(gpa, 3.75)
        self.assertGreaterEqual(total_cr, 12)

    def test_target_cgpa_calculation(self):
        # Current: 90 credits at 3.50. Remaining: 58 credits. Target: 3.75
        req_gpa = calculate_target_required_gpa(3.50, 90, 58, 3.75)
        # 3.75 * 148 = 555. 3.50 * 90 = 315. Needed = 240 / 58 = 4.14
        self.assertEqual(req_gpa, 4.14)

    def test_retake_impact(self):
        # Replacing a C (2.75) with an A+ (4.00) in a 3-credit course on 98 completed credits with 3.60 CGPA
        new_cgpa = calculate_retake_impact(3.60, 98, 3, 2.75, 4.00)
        # Gain: 3 * 1.25 = 3.75 QP. New QP: (3.60 * 98) + 3.75 = 352.8 + 3.75 = 356.55 / 98 = 3.638 -> 3.64
        self.assertEqual(new_cgpa, 3.64)

    def test_academic_advisor_alerts(self):
        # Test detection of low-grade courses requiring retake or blocking prerequisite
        courses = [
            {'title': 'Math 1', 'credits': 3, 'gp': 4.00},
            {'title': 'Physics', 'credits': 3, 'gp': 2.25},  # D - Marginal pass
            {'title': 'English', 'credits': 3, 'gp': 0.00}   # F - Failing / Prereq blocked
        ]
        low_grades = [c for c in courses if c['gp'] <= 2.50]
        self.assertEqual(len(low_grades), 2)
        failing = [c for c in low_grades if c['gp'] == 0.00]
        self.assertEqual(len(failing), 1)
        self.assertEqual(failing[0]['title'], 'English')

    def test_degree_audit_clearance(self):
        # AIUB B.Sc. in CSE requires 148 credits for graduation
        total_degree_credits = 148.0
        senior_thesis_threshold = 105.0
        
        # Test current senior status (e.g. 98 credits earned)
        earned = 98.0
        self.assertLess(earned, total_degree_credits)
        self.assertFalse(earned >= senior_thesis_threshold)
        
        # After completing semester 8 (15 credits) -> 113.0
        earned_after_sem8 = earned + 15.0
        self.assertTrue(earned_after_sem8 >= senior_thesis_threshold)
        self.assertEqual(total_degree_credits - earned_after_sem8, 35.0)

if __name__ == '__main__':
    unittest.main()
