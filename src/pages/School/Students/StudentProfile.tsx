import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import ReportCardModal from '@/components/school/ReportCardModal';
import ReceiptModal, { type FeeReceiptData } from '@/components/school/ReceiptModal';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import { useModal } from '@/hooks/useModal';
import { api } from '@/services/api';
import {
  UserCircleIcon,
  CalenderIcon,
  TaskIcon,
  DollarLineIcon,
  ChevronLeftIcon,
} from '@/icons';

interface StudentProfileResponse {
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dob: string;
    bloodGroup: string;
    admissionDate: string;
    rollNumber: string;
    classId: {
      _id: string;
      name: string;
      grade: string;
      section: string;
      roomNumber: string;
    };
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    guardianEmail: string;
    guardianOccupation: string;
    address: string;
    isActive: boolean;
  };
  attendanceStats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    rate: string;
    recent: Array<{
      _id: string;
      date: string;
      status: 'Present' | 'Absent' | 'Late' | 'Leave';
      remarks: string;
    }>;
  };
  results: Array<{
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
    marks: Array<{
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
  }>;
  fees: FeeReceiptData[];
  feeSummary: {
    totalBilled: number;
    totalPaid: number;
    totalBalance: number;
  };
}

export default function StudentProfile() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StudentProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees'>('overview');

  // Modals for printable views
  const { isOpen: isReportCardOpen, openModal: openReportCard, closeModal: closeReportCard } = useModal();
  const { isOpen: isReceiptOpen, openModal: openReceipt, closeModal: closeReceipt } = useModal();
  const [selectedResult, setSelectedResult] = useState<StudentProfileResponse['results'][0] | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeReceiptData | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<StudentProfileResponse>(`/students/${id}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load student profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="p-12 text-center text-sm text-gray-500">
        Student record not found.
      </div>
    );
  }

  const { student, attendanceStats, results, fees, feeSummary } = data;

  const handleViewReportCard = (resItem: StudentProfileResponse['results'][0]) => {
    setSelectedResult({
      ...resItem,
      studentId: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber,
      },
      classId: {
        name: student.classId?.name,
        section: student.classId?.section,
      },
    });
    openReportCard();
  };

  const handleViewReceipt = (feeItem: FeeReceiptData) => {
    setSelectedReceipt({
      ...feeItem,
      studentId: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
      },
      classId: {
        name: student.classId?.name,
        section: student.classId?.section,
      },
    });
    openReceipt();
  };

  const statusColor = (s: string) => {
    if (s === 'Present' || s === 'Paid') return 'success' as const;
    if (s === 'Late' || s === 'Partial') return 'warning' as const;
    return 'error' as const;
  };

  return (
    <>
      <PageMeta
        title={`${student.firstName} ${student.lastName} | Student Profile`}
        description="Detailed student academic, attendance, and fee record profile"
      />
      <PageBreadcrumb pageTitle={t('school.viewProfile', 'Student Profile')} />

      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeftIcon className="size-4 rtl:rotate-180" />
          {t('school.students', 'Back to Students Directory')}
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <UserCircleIcon className="size-12" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {student.firstName} {student.lastName}
                </h2>
                <Badge variant="light" color={student.isActive ? 'success' : 'error'} size="sm">
                  {student.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                {student.studentId} • Roll #{student.rollNumber || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Class: {student.classId?.name} ({student.classId?.section}) • {student.gender} • Blood Group: {student.bloodGroup}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:border-0 sm:pt-0">
            <div className="rounded-xl bg-gray-50 px-4 py-2.5 text-center dark:bg-gray-800">
              <span className="block text-theme-xs text-gray-400">Attendance Rate</span>
              <span className="text-base font-bold text-success-600 dark:text-success-400">
                {attendanceStats.rate}%
              </span>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-2.5 text-center dark:bg-gray-800">
              <span className="block text-theme-xs text-gray-400">Fee Balance</span>
              <span className={`text-base font-bold ${feeSummary.totalBalance > 0 ? 'text-error-500' : 'text-gray-700 dark:text-gray-300'}`}>
                ${feeSummary.totalBalance}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <UserCircleIcon className="size-4" />
            Overview & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'attendance'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <CalenderIcon className="size-4" />
            Attendance ({attendanceStats.rate}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'results'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <TaskIcon className="size-4" />
            Exams & Results ({results.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'fees'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <DollarLineIcon className="size-4" />
            Fee Transactions ({fees.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-white/90">
              Personal Information
            </h3>
            <div className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {new Date(student.dob).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.gender}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Blood Group:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.bloodGroup}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Student Email:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Admission Date:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {new Date(student.admissionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.address || 'Springfield'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-white/90">
              Guardian & Emergency Contact
            </h3>
            <div className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Guardian Name:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.guardianName}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Relationship:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.guardianRelation}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Contact Phone:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.guardianPhone}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Guardian Email:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.guardianEmail || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Class Room:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{student.classId?.roomNumber || 'Room 101'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
              <span className="block text-xs text-gray-400">Total Days</span>
              <span className="text-xl font-bold text-gray-800 dark:text-white">{attendanceStats.total}</span>
            </div>
            <div className="rounded-xl bg-success-50/50 p-4 text-center dark:bg-success-500/10">
              <span className="block text-xs text-success-600 dark:text-success-400">Present</span>
              <span className="text-xl font-bold text-success-600 dark:text-success-400">{attendanceStats.present}</span>
            </div>
            <div className="rounded-xl bg-warning-50/50 p-4 text-center dark:bg-warning-500/10">
              <span className="block text-xs text-warning-600 dark:text-warning-400">Late</span>
              <span className="text-xl font-bold text-warning-600 dark:text-warning-400">{attendanceStats.late}</span>
            </div>
            <div className="rounded-xl bg-error-50/50 p-4 text-center dark:bg-error-500/10">
              <span className="block text-xs text-error-600 dark:text-error-400">Absent</span>
              <span className="text-xl font-bold text-error-600 dark:text-error-400">{attendanceStats.absent}</span>
            </div>
            <div className="rounded-xl bg-blue-light-50/50 p-4 text-center dark:bg-blue-light-500/10">
              <span className="block text-xs text-blue-light-600 dark:text-blue-light-400">Leave</span>
              <span className="text-xl font-bold text-blue-light-600 dark:text-blue-light-400">{attendanceStats.leave}</span>
            </div>
          </div>

          <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recent Attendance Log
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400 dark:border-gray-800 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-start">Date</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3 text-start">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendanceStats.recent.map((rec) => (
                  <tr key={rec._id}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="solid" color={statusColor(rec.status)} size="sm">
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {rec.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Exam Results */}
      {activeTab === 'results' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-white/90">
            Examination Results & Report Cards
          </h3>
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No exam results published yet.</p>
          ) : (
            <div className="space-y-4">
              {results.map((resItem) => (
                <div
                  key={resItem._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                      {resItem.examId?.title} ({resItem.examId?.term})
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total: {resItem.totalMarksObtained} / {resItem.totalMarksMax} • Percentage: {resItem.percentage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="solid" color="success" size="md">
                      Grade {resItem.overallGrade}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewReportCard(resItem)}>
                      View Report Card
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Fee Transactions */}
      {activeTab === 'fees' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-white/90">
            Fee Invoices & Payment Receipts
          </h3>
          {fees.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No fee records found for this student.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400 dark:border-gray-800 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-start">Receipt No</th>
                    <th className="px-4 py-3 text-start">Title</th>
                    <th className="px-4 py-3 text-end">Amount</th>
                    <th className="px-4 py-3 text-end">Paid</th>
                    <th className="px-4 py-3 text-end">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                        {fee.receiptNo}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                        {fee.title}
                      </td>
                      <td className="px-4 py-3 text-end font-medium text-gray-700 dark:text-gray-300">
                        ${fee.amount}
                      </td>
                      <td className="px-4 py-3 text-end font-semibold text-success-600 dark:text-success-400">
                        ${fee.paidAmount}
                      </td>
                      <td className="px-4 py-3 text-end text-error-500 font-semibold">
                        ${fee.balance}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="light" color={statusColor(fee.status)} size="sm">
                          {fee.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button size="sm" variant="outline" onClick={() => handleViewReceipt(fee)}>
                          Receipt Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Printable Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={closeReportCard}
        result={selectedResult}
      />

      {/* Printable Fee Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={closeReceipt}
        receipt={selectedReceipt}
      />
    </>
  );
}
