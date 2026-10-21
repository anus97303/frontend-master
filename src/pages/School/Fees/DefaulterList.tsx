import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { useSchool } from '@/context/SchoolContext';
import { CheckCircleIcon } from '@/icons';

interface DefaulterRecord {
  id: string;
  grNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  section: string;
  campus: string;
  system: string;
  phone: string;
  overdueAmount: number;
  monthsUnpaid: number;
  daysOverdue: number;
  lastReminderSent?: string;
}

const INITIAL_DEFAULTERS: DefaulterRecord[] = [
  {
    id: '1',
    grNo: 'GR-2024-005',
    studentName: 'Danyal Siddiqui',
    fatherName: 'Naveed Siddiqui',
    className: 'Grade 10',
    section: 'A',
    campus: 'Main Campus',
    system: 'Cambridge (O/A Levels)',
    phone: '+92 300 7766554',
    overdueAmount: 16000,
    monthsUnpaid: 2,
    daysOverdue: 62,
    lastReminderSent: '2024-04-10',
  },
  {
    id: '2',
    grNo: 'GR-2024-002',
    studentName: 'Muhammad Hamza',
    fatherName: 'Tariq Mahmood',
    className: 'Grade 9',
    section: 'B',
    campus: 'Main Campus',
    system: 'Cambridge (O/A Levels)',
    phone: '+92 321 9988776',
    overdueAmount: 7500,
    monthsUnpaid: 1,
    daysOverdue: 35,
  },
  {
    id: '3',
    grNo: 'GR-2024-003',
    studentName: 'Ayesha Khan',
    fatherName: 'Kamran Khan',
    className: 'Grade 10',
    section: 'A',
    campus: 'City Campus',
    system: 'Matric',
    phone: '+92 333 4455667',
    overdueAmount: 2400,
    monthsUnpaid: 1,
    daysOverdue: 25,
  },
  {
    id: '4',
    grNo: 'GR-2024-009',
    studentName: 'Usman Ali',
    fatherName: 'Ali Asghar',
    className: 'Grade 8',
    section: 'B',
    campus: 'North Campus',
    system: 'Federal Board',
    phone: '+92 301 9988112',
    overdueAmount: 12600,
    monthsUnpaid: 3,
    daysOverdue: 94,
    lastReminderSent: '2024-04-01',
  },
];

export default function DefaulterList() {
  const { settings } = useSchool();

  const [defaulters, setDefaulters] = useState<DefaulterRecord[]>(() => {
    const saved = localStorage.getItem('school_fee_defaulters');
    return saved ? JSON.parse(saved) : INITIAL_DEFAULTERS;
  });

  const [daysFilter, setDaysFilter] = useState('All');
  const [campusFilter, setCampusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reminder Modal
  const noticeModal = useModal();
  const [selectedStudent, setSelectedStudent] = useState<DefaulterRecord | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const openNoticeModal = (student: DefaulterRecord) => {
    setSelectedStudent(student);
    setNoticeMessage(
      `Dear Parent/Guardian of ${student.studentName} (GR No: ${student.grNo}), an outstanding fee balance of ${settings.currencySymbol} ${student.overdueAmount} is overdue by ${student.daysOverdue} days. Kindly settle dues at your earliest to avoid late suspension. Thank you, ${settings.schoolName}.`
    );
    noticeModal.openModal();
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updated = defaulters.map((d) =>
      d.id === selectedStudent.id
        ? { ...d, lastReminderSent: new Date().toISOString().split('T')[0] }
        : d
    );
    setDefaulters(updated);
    localStorage.setItem('school_fee_defaulters', JSON.stringify(updated));
    noticeModal.closeModal();
    setToastMsg(`SMS / WhatsApp fee reminder sent to ${selectedStudent.fatherName} (${selectedStudent.phone})!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      const matchSearch =
        !searchQuery ||
        d.grNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCampus = campusFilter === 'All' || d.campus === campusFilter;
      const matchClass = classFilter === 'All' || d.className === classFilter;

      let matchDays = true;
      if (daysFilter === '30+') matchDays = d.daysOverdue >= 30;
      else if (daysFilter === '60+') matchDays = d.daysOverdue >= 60;
      else if (daysFilter === '90+') matchDays = d.daysOverdue >= 90;

      return matchSearch && matchCampus && matchClass && matchDays;
    });
  }, [defaulters, searchQuery, campusFilter, classFilter, daysFilter]);

  const totalOverdue = useMemo(() => {
    return filteredDefaulters.reduce((acc, curr) => acc + curr.overdueAmount, 0);
  }, [filteredDefaulters]);

  return (
    <>
      <PageMeta
        title={`Fee Defaulter List | ${settings.schoolName}`}
        description="Monitor unpaid fees, overdue balances, and send automated fee reminders"
      />
      <PageBreadcrumb pageTitle="Fee Defaulter List" />

      {toastMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Defaulter Students</span>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{filteredDefaulters.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Total Outstanding Receivables</span>
          <p className="mt-1 text-2xl font-bold text-error-600">
            {settings.currencySymbol} {totalOverdue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Critical Defaulters (60+ Days)</span>
          <p className="mt-1 text-2xl font-bold text-warning-600">
            {defaulters.filter((d) => d.daysOverdue >= 60).length}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Label>Search Defaulter</Label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="GR No, student or father name..."
            />
          </div>

          <div>
            <Label>Overdue Duration</Label>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Overdue Ranges</option>
              <option value="30+">30+ Days Overdue</option>
              <option value="60+">60+ Days Overdue</option>
              <option value="90+">90+ Days Overdue</option>
            </select>
          </div>

          <div>
            <Label>Campus</Label>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Campuses</option>
              {settings.campuses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Class</Label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Classes</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">GR NO.</th>
                <th className="px-4 py-3 text-start">STUDENT NAME</th>
                <th className="px-4 py-3 text-start">FATHER & CONTACT</th>
                <th className="px-4 py-3 text-start">CLASS (SECTION)</th>
                <th className="px-4 py-3 text-start">CAMPUS</th>
                <th className="px-4 py-3 text-center">OVERDUE AMOUNT</th>
                <th className="px-4 py-3 text-center">DAYS OVERDUE</th>
                <th className="px-4 py-3 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No fee defaulters found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {item.grNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {item.studentName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white">{item.fatherName}</div>
                      <div className="text-theme-xs text-gray-500">{item.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.className} ({item.section})
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.campus}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-error-600">
                      {settings.currencySymbol} {item.overdueAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="solid"
                        color={item.daysOverdue >= 60 ? 'error' : 'warning'}
                        size="sm"
                      >
                        {item.daysOverdue} Days ({item.monthsUnpaid} Mo)
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openNoticeModal(item)}
                        >
                          📱 Send Notice
                        </Button>
                        <Link
                          to={`/school/fees/collect?search=${encodeURIComponent(item.grNo)}`}
                          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-theme-xs transition hover:bg-brand-600"
                        >
                          Collect Fee
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Notice Modal */}
      <Modal isOpen={noticeModal.isOpen} onClose={noticeModal.closeModal} className="max-w-lg p-6">
        {selectedStudent && (
          <div>
            <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Dispatch Overdue Fee Notice
              </h3>
              <p className="text-xs text-gray-500">
                To: <span className="font-semibold text-brand-600">{selectedStudent.fatherName}</span> ({selectedStudent.phone})
              </p>
            </div>

            <form onSubmit={handleSendReminder} className="space-y-4">
              <div>
                <Label>Notification Channel</Label>
                <div className="flex gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                    SMS Gateway
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                    WhatsApp Business API
                  </label>
                </div>
              </div>

              <div>
                <Label>Message Template</Label>
                <textarea
                  rows={4}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={noticeModal.closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Dispatch Reminder Notice
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
}
