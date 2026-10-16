import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Select from '@/components/form/Select';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import MarkEntryModal from '@/components/school/MarkEntryModal';
import ReportCardModal from '@/components/school/ReportCardModal';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PencilIcon, EyeIcon } from '@/icons';

interface ExamItem {
  _id: string;
  title: string;
  term: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  classes: Array<{
    _id: string;
    name: string;
    section: string;
  }>;
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

interface SubjectItem {
  _id: string;
  name: string;
  code: string;
}

interface StudentExamRow {
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
  };
  result: {
    _id: string;
    marks: Array<{
      subjectId: string;
      subjectName: string;
      marksObtained: number;
      totalMarks: number;
      grade: string;
    }>;
    totalMarksObtained: number;
    totalMarksMax: number;
    percentage: number;
    overallGrade: string;
    remarks: string;
    createdAt: string;
  } | null;
  isRecorded: boolean;
}

export default function ExamList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [sheetData, setSheetData] = useState<StudentExamRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const { isOpen: isMarkModalOpen, openModal: openMarkModal, closeModal: closeMarkModal } = useModal();
  const { isOpen: isReportCardOpen, openModal: openReportCard, closeModal: closeReportCard } = useModal();
  const [activeStudent, setActiveStudent] = useState<StudentExamRow['student'] | null>(null);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [isSavingMarks, setIsSavingMarks] = useState<boolean>(false);

  // Fetch initial exams and classes
  useEffect(() => {
    const fetchExamsAndClasses = async () => {
      try {
        const [examsData, classesData] = await Promise.all([
          api.get<ExamItem[]>('/exams'),
          api.get<ClassItem[]>('/classes'),
        ]);

        setExams(examsData);
        setClasses(classesData);

        if (examsData.length > 0) setSelectedExam(examsData[0]._id);
        if (classesData.length > 0) setSelectedClass(classesData[0]._id);
      } catch (err) {
        console.error('Failed to load exams and classes', err);
      }
    };
    fetchExamsAndClasses();
  }, []);

  // Fetch class subjects
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      try {
        const subs = await api.get<SubjectItem[]>(`/subjects?classId=${selectedClass}`);
        setSubjects(subs);
      } catch (err) {
        console.error('Failed to load class subjects', err);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  // Fetch class results sheet
  const fetchSheet = useCallback(async () => {
    if (!selectedExam || !selectedClass) return;
    setIsLoading(true);
    try {
      const res = await api.get<{
        students: StudentExamRow[];
        subjects: SubjectItem[];
      }>(`/exams/results/class?examId=${selectedExam}&classId=${selectedClass}`);
      setSheetData(res.students);
    } catch (err) {
      console.error('Failed to load exam results sheet', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExam, selectedClass]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const handleOpenMarks = (row: StudentExamRow) => {
    setActiveStudent(row.student);
    setActiveResult(row.result);
    openMarkModal();
  };

  const handleOpenReportCard = (row: StudentExamRow) => {
    if (!row.result) return;
    const curExam = exams.find((e) => e._id === selectedExam);
    const curClass = classes.find((c) => c._id === selectedClass);

    setActiveResult({
      ...row.result,
      studentId: row.student,
      examId: {
        title: curExam?.title || 'Examination',
        term: curExam?.term || 'Term 1',
        academicYear: curExam?.academicYear || '2025-2026',
      },
      classId: {
        name: curClass?.name || 'Grade 9',
        section: curClass?.section || 'A',
      },
    });
    openReportCard();
  };

  const handleSaveMarks = async (payload: {
    studentId: string;
    marks: any[];
    remarks: string;
  }) => {
    setIsSavingMarks(true);
    try {
      await api.post('/exams/results', {
        examId: selectedExam,
        classId: selectedClass,
        studentId: payload.studentId,
        marks: payload.marks,
        remarks: payload.remarks,
      });
      closeMarkModal();
      fetchSheet();
    } catch (err) {
      console.error('Failed to save student marks', err);
    } finally {
      setIsSavingMarks(false);
    }
  };

  const examOptions = exams.map((e) => ({
    value: e._id,
    label: `${e.title} (${e.term})`,
  }));

  const classOptions = classes.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.section})`,
  }));

  const gradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'success' as const;
    if (grade === 'B') return 'primary' as const;
    if (grade === 'C' || grade === 'D') return 'warning' as const;
    return 'error' as const;
  };

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <>
      <PageMeta
        title="Exams & Grading Matrix | TailAdmin - School Management"
        description="Exam terms, subject marks entry, GPA calculations, and printable report cards"
      />
      <PageBreadcrumb pageTitle={t('school.exams', 'Exams & Performance Results')} />

      {/* Selectors Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-64">
            <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Examination Term:
            </span>
            <Select
              options={examOptions}
              defaultValue={selectedExam}
              onChange={(val) => setSelectedExam(val)}
            />
          </div>
          <div className="w-full sm:w-56">
            <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Class Section:
            </span>
            <Select
              options={classOptions}
              defaultValue={selectedClass}
              onChange={(val) => setSelectedClass(val)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-end">
            <span className="block text-theme-xs text-gray-400">Grading Scale</span>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              A+ (90%) • A (80%) • B (70%) • C (60%) • D (50%)
            </span>
          </div>
        </div>
      </div>

      {/* Marksheet Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : sheetData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No students found"
              description="No students enrolled in this class to display marksheet."
            />
          </div>
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[750px] text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 text-start">Roll #</th>
                  <th className="px-5 py-3.5 text-start">Student ID</th>
                  <th className="px-5 py-3.5 text-start">Student Name</th>
                  <th className="px-5 py-3.5 text-center">Marks Obtained</th>
                  <th className="px-5 py-3.5 text-center">Percentage</th>
                  <th className="px-5 py-3.5 text-center">Grade</th>
                  <th className="px-5 py-3.5 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sheetData.map((row) => (
                  <tr
                    key={row.student._id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-5 py-3.5 font-bold text-gray-700 dark:text-gray-300">
                      #{row.student.rollNumber || '-'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-600 dark:text-brand-400">
                      {row.student.studentId}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-white/90">
                      {row.student.firstName} {row.student.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-gray-800 dark:text-white">
                      {row.isRecorded
                        ? `${row.result?.totalMarksObtained} / ${row.result?.totalMarksMax}`
                        : <span className="text-gray-400">Unrecorded</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-gray-800 dark:text-white">
                      {row.isRecorded ? `${row.result?.percentage}%` : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.isRecorded ? (
                        <Badge
                          variant="solid"
                          color={gradeColor(row.result?.overallGrade || 'F')}
                          size="sm"
                        >
                          Grade {row.result?.overallGrade}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<PencilIcon className="size-3.5" />}
                            onClick={() => handleOpenMarks(row)}
                          >
                            {row.isRecorded ? 'Edit Marks' : 'Record'}
                          </Button>
                        )}
                        {row.isRecorded && (
                          <Button
                            size="sm"
                            variant="primary"
                            startIcon={<EyeIcon className="size-3.5" />}
                            onClick={() => handleOpenReportCard(row)}
                          >
                            Report Card
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Marks Entry Modal */}
      <MarkEntryModal
        isOpen={isMarkModalOpen}
        onClose={closeMarkModal}
        onSubmit={handleSaveMarks}
        student={activeStudent}
        subjects={subjects}
        existingMarks={activeResult?.marks || []}
        existingRemarks={activeResult?.remarks || ''}
        isLoading={isSavingMarks}
      />

      {/* Printable Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={closeReportCard}
        result={activeResult}
      />
    </>
  );
}
