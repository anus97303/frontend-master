import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Badge from '@/components/ui/badge/Badge';
import { useTranslation } from 'react-i18next';

interface SubjectItem {
  _id: string;
  name: string;
  code: string;
}

interface StudentItem {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  rollNumber: string;
}

interface MarkInput {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
}

interface MarkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    studentId: string;
    marks: MarkInput[];
    remarks: string;
  }) => Promise<void>;
  student: StudentItem | null;
  subjects: SubjectItem[];
  existingMarks?: MarkInput[];
  existingRemarks?: string;
  isLoading?: boolean;
}

const getGradeBadge = (pct: number) => {
  if (pct >= 90) return { grade: 'A+', color: 'success' as const };
  if (pct >= 80) return { grade: 'A', color: 'success' as const };
  if (pct >= 70) return { grade: 'B', color: 'primary' as const };
  if (pct >= 60) return { grade: 'C', color: 'warning' as const };
  if (pct >= 50) return { grade: 'D', color: 'warning' as const };
  return { grade: 'F', color: 'error' as const };
};

export const MarkEntryModal: React.FC<MarkEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  subjects,
  existingMarks = [],
  existingRemarks = '',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [marks, setMarks] = useState<MarkInput[]>([]);
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    if (student && subjects.length > 0) {
      const initial: MarkInput[] = subjects.map((sub) => {
        const found = existingMarks.find((m) => m.subjectId === sub._id);
        return {
          subjectId: sub._id,
          subjectName: sub.name,
          marksObtained: found ? found.marksObtained : 0,
          totalMarks: found ? found.totalMarks : 100,
        };
      });
      setMarks(initial);
      setRemarks(existingRemarks || '');
    }
  }, [student, subjects, existingMarks, existingRemarks, isOpen]);

  const handleMarkChange = (index: number, value: number) => {
    setMarks((prev) => {
      const updated = [...prev];
      const max = updated[index].totalMarks || 100;
      updated[index] = {
        ...updated[index],
        marksObtained: Math.min(max, Math.max(0, value)),
      };
      return updated;
    });
  };

  const totalObtained = marks.reduce((sum, item) => sum + (Number(item.marksObtained) || 0), 0);
  const totalPossible = marks.reduce((sum, item) => sum + (Number(item.totalMarks) || 100), 0);
  const percentage = totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : '0.0';
  const gradeInfo = getGradeBadge(Number(percentage));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    await onSubmit({
      studentId: student._id,
      marks,
      remarks,
    });
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            {t('school.recordMarks', 'Record Subject Marks')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {student.firstName} {student.lastName} ({student.studentId}) — Roll #{student.rollNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Grade:</span>
          <Badge variant="solid" color={gradeInfo.color} size="sm">
            {gradeInfo.grade} ({percentage}%)
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="max-h-[350px] space-y-3 overflow-y-auto pe-1">
          {marks.map((item, idx) => (
            <div
              key={item.subjectId}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
            >
              <div className="flex-1">
                <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.subjectName}
                </span>
                <span className="text-xs text-gray-400">Max: {item.totalMarks} marks</span>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min={0}
                  max={item.totalMarks}
                  value={item.marksObtained}
                  onChange={(e) => handleMarkChange(idx, Number(e.target.value))}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="remarks">Teacher Remarks / Notes</Label>
          <Input
            id="remarks"
            name="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Excellent conceptual grasp, active classroom participation"
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Total: {totalObtained} / {totalPossible} ({percentage}%)
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              {t('school.cancel', 'Cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? t('common.saving', 'Saving...') : t('school.save', 'Save Marks')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MarkEntryModal;
