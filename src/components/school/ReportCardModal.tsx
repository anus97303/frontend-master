import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useTranslation } from 'react-i18next';

interface SubjectMark {
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

interface ResultData {
  _id: string;
  examId: {
    title: string;
    term: string;
    academicYear: string;
  };
  studentId: {
    studentId: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
  };
  classId: {
    name: string;
    section: string;
  };
  marks: SubjectMark[];
  totalMarksObtained: number;
  totalMarksMax: number;
  percentage: number;
  overallGrade: string;
  remarks?: string;
  createdAt: string;
}

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultData | null;
  schoolName?: string;
}

const getGradeColor = (grade: string) => {
  if (grade === 'A+' || grade === 'A') return 'success' as const;
  if (grade === 'B') return 'primary' as const;
  if (grade === 'C' || grade === 'D') return 'warning' as const;
  return 'error' as const;
};

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  result,
  schoolName = 'Horizon International Academy',
}) => {
  const { t } = useTranslation();

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6 sm:p-10">
      <div id="printable-report-card" className="bg-white p-2 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b-2 border-brand-500 pb-5 text-center">
          <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
            {schoolName}
          </h2>
          <p className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Official Academic Progress Report
          </p>
          <div className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {result.examId?.title} — {result.examId?.term} ({result.examId?.academicYear})
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="my-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/60 sm:grid-cols-4">
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Student Name</span>
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {result.studentId?.firstName} {result.studentId?.lastName}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Student ID</span>
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {result.studentId?.studentId}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Class & Section</span>
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {result.classId?.name} ({result.classId?.section})
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Roll Number</span>
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {result.studentId?.rollNumber || 'N/A'}
            </span>
          </div>
        </div>

        {/* Marks Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-start text-sm">
            <thead className="bg-gray-100/75 text-xs uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-start">Subject</th>
                <th className="px-4 py-3 text-center">Max Marks</th>
                <th className="px-4 py-3 text-center">Marks Obtained</th>
                <th className="px-4 py-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {result.marks?.map((sub, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                    {sub.subjectName}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    {sub.totalMarks}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-white/90">
                    {sub.marksObtained}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="light" color={getGradeColor(sub.grade)} size="sm">
                      {sub.grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-700 dark:bg-gray-800/50">
              <tr>
                <td className="px-4 py-3 text-start text-gray-800 dark:text-white/90">
                  Total Aggregate
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                  {result.totalMarksMax}
                </td>
                <td className="px-4 py-3 text-center text-brand-600 dark:text-brand-400">
                  {result.totalMarksObtained}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="solid" color={getGradeColor(result.overallGrade)} size="sm">
                    {result.overallGrade} ({result.percentage}%)
                  </Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarks and Signatures */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
          <span className="block text-xs font-semibold uppercase text-gray-400">
            Instructor Remarks
          </span>
          <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-300">
            "{result.remarks || 'Commendable performance throughout the academic session.'}"
          </p>
        </div>

        <div className="mt-12 flex justify-between px-6 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <div className="border-t border-gray-300 pt-2 dark:border-gray-700">
            <span className="block font-semibold">Class Teacher Signature</span>
          </div>
          <div className="border-t border-gray-300 pt-2 dark:border-gray-700">
            <span className="block font-semibold">Principal / Controller of Exams</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 print:hidden">
        <Button variant="outline" size="sm" onClick={onClose}>
          {t('school.cancel', 'Close')}
        </Button>
        <Button size="sm" onClick={handlePrint}>
          {t('school.print', 'Print Report Card')}
        </Button>
      </div>
    </Modal>
  );
};

export default ReportCardModal;
