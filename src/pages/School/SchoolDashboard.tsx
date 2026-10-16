import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/school/StatCard';
import AttendanceChart from '@/components/school/AttendanceChart';
import { CardSkeleton } from '@/components/school/LoadingSkeleton';
import Badge from '@/components/ui/badge/Badge';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  GroupIcon,
  UserIcon,
  DollarLineIcon,
  CalenderIcon,
  TaskIcon,
} from '@/icons';

interface DashboardData {
  totals: {
    students: number;
    teachers: number;
    classes: number;
    feeCollected: number;
    feePending: number;
  };
  attendanceTimeline: Array<{
    date: string;
    Present: number;
    Absent: number;
    Late: number;
  }>;
  recentStudents: Array<{
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    gender: string;
    admissionDate: string;
    classId: {
      name: string;
      section: string;
    };
  }>;
  upcomingExams: Array<{
    _id: string;
    title: string;
    term: string;
    startDate: string;
    endDate: string;
  }>;
  recentNotices: Array<{
    _id: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    date: string;
    targetRole: string;
  }>;
  studentSpecific?: {
    student?: {
      firstName: string;
      lastName: string;
      studentId: string;
      classId?: { name: string; section: string };
    };
    attendancePercentage: string;
    pendingFees: number;
  } | null;
}

export default function SchoolDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<DashboardData>('/dashboard/stats');
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const priorityColor = (p: string) => {
    if (p === 'high') return 'error' as const;
    if (p === 'medium') return 'warning' as const;
    return 'info' as const;
  };

  return (
    <>
      <PageMeta
        title="School Dashboard | TailAdmin - School Management"
        description="Comprehensive School Management System Dashboard overview"
      />
      <PageBreadcrumb pageTitle={t('school.dashboard', 'School Dashboard')} />

      {/* Role welcome alert */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Role: <span className="font-semibold uppercase text-brand-600 dark:text-brand-400">{user?.role}</span> • Academic Year 2025-2026
          </p>
        </div>
        {user?.role === 'student' && data?.studentSpecific && (
          <div className="flex gap-4">
            <div className="rounded-xl bg-white px-3 py-2 shadow-theme-xs dark:bg-gray-800">
              <span className="block text-theme-xs text-gray-400">My Attendance</span>
              <span className="text-sm font-bold text-success-600 dark:text-success-400">
                {data.studentSpecific.attendancePercentage}%
              </span>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 shadow-theme-xs dark:bg-gray-800">
              <span className="block text-theme-xs text-gray-400">My Pending Fees</span>
              <span className="text-sm font-bold text-error-600 dark:text-error-400">
                ${data.studentSpecific.pendingFees}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <StatCard
            title={t('school.totalStudents', 'Total Students')}
            value={data?.totals.students ?? 0}
            subtitle="Enrolled across all classes"
            icon={<GroupIcon className="size-6" />}
            variant="brand"
          />
          <StatCard
            title={t('school.totalTeachers', 'Faculty Members')}
            value={data?.totals.teachers ?? 0}
            subtitle="Active academic staff"
            icon={<UserIcon className="size-6" />}
            variant="info"
          />
          <StatCard
            title={t('school.feeCollected', 'Fee Collected')}
            value={`$${(data?.totals.feeCollected ?? 0).toLocaleString()}`}
            subtitle="Current academic session"
            icon={<DollarLineIcon className="size-6" />}
            variant="success"
          />
          <StatCard
            title={t('school.feePending', 'Fee Pending')}
            value={`$${(data?.totals.feePending ?? 0).toLocaleString()}`}
            subtitle="Outstanding dues"
            icon={<CalenderIcon className="size-6" />}
            variant="warning"
          />
        </div>
      )}

      {/* Middle row: Attendance Chart & Upcoming Exams */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceChart data={data?.attendanceTimeline || []} />
        </div>

        {/* Upcoming Exams Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {t('school.upcomingExams', 'Upcoming Exams')}
            </h3>
            <Link
              to="/school/exams"
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              {t('common.viewMore', 'View all')}
            </Link>
          </div>

          <div className="space-y-3">
            {data?.upcomingExams && data.upcomingExams.length > 0 ? (
              data.upcomingExams.map((exam) => (
                <div
                  key={exam._id}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <TaskIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.term}
                    </p>
                    <span className="mt-1 block text-theme-xs font-medium text-brand-600 dark:text-brand-400">
                      {new Date(exam.startDate).toLocaleDateString()} -{' '}
                      {new Date(exam.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-gray-400">
                No upcoming exams scheduled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Admissions & School Notices */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Admissions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {t('school.recentAdmissions', 'Recent Admissions')}
            </h3>
            <Link
              to="/school/students"
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              {t('school.students', 'All Students')}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
                <tr>
                  <th className="pb-3 text-start">{t('school.studentId', 'ID')}</th>
                  <th className="pb-3 text-start">{t('school.name', 'Student')}</th>
                  <th className="pb-3 text-start">{t('school.class', 'Class')}</th>
                  <th className="pb-3 text-end">{t('school.actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data?.recentStudents && data.recentStudents.length > 0 ? (
                  data.recentStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-3 font-semibold text-brand-600 dark:text-brand-400">
                        {s.studentId}
                      </td>
                      <td className="py-3 font-medium text-gray-800 dark:text-white/90">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {s.classId?.name} ({s.classId?.section})
                      </td>
                      <td className="py-3 text-end">
                        <Link
                          to={`/school/students/${s._id}`}
                          className="text-xs font-semibold text-brand-500 hover:underline"
                        >
                          Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-gray-400">
                      No recent student admissions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notices Board */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {t('school.announcements', 'Notice Board')}
            </h3>
            <Link
              to="/school/notices"
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              {t('common.viewMore', 'View all')}
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentNotices && data.recentNotices.length > 0 ? (
              data.recentNotices.map((notice) => (
                <div
                  key={notice._id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 transition hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {notice.title}
                    </h4>
                    <Badge variant="light" color={priorityColor(notice.priority)} size="sm">
                      {notice.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {notice.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-theme-xs text-gray-400">
                    <span>Audience: {notice.targetRole}</span>
                    <span>{new Date(notice.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-gray-400">
                No active notices posted.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
