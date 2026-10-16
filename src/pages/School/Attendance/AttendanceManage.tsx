import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { CheckCircleIcon } from '@/icons';

interface ClassItem {
  _id: string;
  name: string;
  grade: string;
  section: string;
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

interface AttendanceRow {
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    avatar?: string;
  };
  attendanceId?: string | null;
  status: AttendanceStatus;
  remarks: string;
  isMarked: boolean;
}

export default function AttendanceManage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const clsData = await api.get<ClassItem[]>('/classes');
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClass(clsData[0]._id);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchClasses();
  }, []);

  // Load attendance sheet for class and date
  const fetchAttendanceSheet = useCallback(async () => {
    if (!selectedClass || !selectedDate) return;
    setIsLoading(true);
    setSavedSuccess(false);
    try {
      const res = await api.get<{
        records: AttendanceRow[];
      }>(`/attendance?classId=${selectedClass}&date=${selectedDate}`);
      setRecords(res.records);
    } catch (err) {
      console.error('Failed to load attendance sheet', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    fetchAttendanceSheet();
  }, [fetchAttendanceSheet]);

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((row) =>
        row.student._id === studentId ? { ...row, status: newStatus } : row
      )
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((row) => ({ ...row, status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate || records.length === 0) return;
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await api.post('/attendance', {
        classId: selectedClass,
        date: selectedDate,
        records: records.map((r) => ({
          studentId: r.student._id,
          status: r.status,
          remarks: r.remarks,
        })),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Summaries
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;

  const classOptions = classes.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.section})`,
  }));

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <>
      <PageMeta
        title="Daily Attendance Register | TailAdmin - School Management"
        description="Mark and monitor daily student attendance, absences, and attendance trends"
      />
      <PageBreadcrumb pageTitle={t('school.attendance', 'Daily Attendance Register')} />

      {/* Control & Filter Strip */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-60">
            <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Select Classroom:
            </span>
            <Select
              options={classOptions}
              defaultValue={selectedClass}
              onChange={(val) => setSelectedClass(val)}
            />
          </div>
          <div className="w-full sm:w-52">
            <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Attendance Date:
            </span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {canEdit && records.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700 hover:bg-success-100 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400"
            >
              Mark All Present
            </button>
            <Button
              size="sm"
              onClick={handleSaveAttendance}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : t('school.saveAttendance', 'Save Register')}
            </Button>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>Attendance registered successfully for {selectedDate}!</span>
        </div>
      )}

      {/* Counter widgets */}
      {records.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-success-100 bg-success-50/50 p-3 text-center dark:border-success-500/20 dark:bg-success-500/10">
            <span className="block text-xs font-medium text-success-600 dark:text-success-400">Present</span>
            <span className="text-xl font-bold text-success-700 dark:text-success-300">{presentCount}</span>
          </div>
          <div className="rounded-xl border border-warning-100 bg-warning-50/50 p-3 text-center dark:border-warning-500/20 dark:bg-warning-500/10">
            <span className="block text-xs font-medium text-warning-600 dark:text-orange-400">Late</span>
            <span className="text-xl font-bold text-warning-700 dark:text-orange-300">{lateCount}</span>
          </div>
          <div className="rounded-xl border border-error-100 bg-error-50/50 p-3 text-center dark:border-error-500/20 dark:bg-error-500/10">
            <span className="block text-xs font-medium text-error-600 dark:text-error-400">Absent</span>
            <span className="text-xl font-bold text-error-700 dark:text-error-300">{absentCount}</span>
          </div>
          <div className="rounded-xl border border-blue-light-100 bg-blue-light-50/50 p-3 text-center dark:border-blue-light-500/20 dark:bg-blue-light-500/10">
            <span className="block text-xs font-medium text-blue-light-600 dark:text-blue-light-400">Leave</span>
            <span className="text-xl font-bold text-blue-light-700 dark:text-blue-light-300">{leaveCount}</span>
          </div>
        </div>
      )}

      {/* Main Attendance Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No students in this class"
              description="Enroll students into this class section to register daily attendance."
            />
          </div>
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[700px] text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 text-start">Roll #</th>
                  <th className="px-5 py-3.5 text-start">Student ID</th>
                  <th className="px-5 py-3.5 text-start">Student Name</th>
                  <th className="px-5 py-3.5 text-center">Status Selection</th>
                  <th className="px-5 py-3.5 text-end">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {records.map((row) => (
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
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
                        {(['Present', 'Late', 'Absent', 'Leave'] as AttendanceStatus[]).map((st) => {
                          const isActive = row.status === st;
                          let activeClass = '';
                          if (isActive) {
                            if (st === 'Present') activeClass = 'bg-success-500 text-white';
                            if (st === 'Late') activeClass = 'bg-warning-500 text-white';
                            if (st === 'Absent') activeClass = 'bg-error-500 text-white';
                            if (st === 'Leave') activeClass = 'bg-blue-light-500 text-white';
                          } else {
                            activeClass = 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';
                          }

                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={!canEdit}
                              onClick={() => handleStatusChange(row.student._id, st)}
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${activeClass}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <Badge
                        variant="solid"
                        color={
                          row.status === 'Present'
                            ? 'success'
                            : row.status === 'Late'
                            ? 'warning'
                            : row.status === 'Absent'
                            ? 'error'
                            : 'info'
                        }
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
