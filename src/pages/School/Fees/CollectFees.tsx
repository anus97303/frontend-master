import { useState, useMemo } from 'react';
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

interface FeeCollectRecord {
  id: string;
  grNo: string;
  studentName: string;
  fatherName: string;
  session: string;
  campus: string;
  system: string;
  className: string;
  section: string;
  group: string;
  monthlyTuition: number;
  arrears: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  lastPaymentDate?: string;
  contactPhone: string;
}

const INITIAL_FEE_COLLECTION: FeeCollectRecord[] = [
  {
    id: '1',
    grNo: 'GR-2024-001',
    studentName: 'Zainab Ahmed',
    fatherName: 'Ahmed Bilal',
    session: '2024-2025',
    campus: 'Main Campus',
    system: 'Matric',
    className: 'Grade 9',
    section: 'A',
    group: 'Science',
    monthlyTuition: 4500,
    arrears: 0,
    paidAmount: 4500,
    status: 'Paid',
    lastPaymentDate: '2024-04-05',
    contactPhone: '+92 300 1122334',
  },
  {
    id: '2',
    grNo: 'GR-2024-002',
    studentName: 'Muhammad Hamza',
    fatherName: 'Tariq Mahmood',
    session: '2024-2025',
    campus: 'Main Campus',
    system: 'Cambridge (O/A Levels)',
    className: 'Grade 9',
    section: 'B',
    group: 'Science',
    monthlyTuition: 7500,
    arrears: 7500,
    paidAmount: 0,
    status: 'Pending',
    contactPhone: '+92 321 9988776',
  },
  {
    id: '3',
    grNo: 'GR-2024-003',
    studentName: 'Ayesha Khan',
    fatherName: 'Kamran Khan',
    session: '2024-2025',
    campus: 'City Campus',
    system: 'Matric',
    className: 'Grade 10',
    section: 'A',
    group: 'Computer Science',
    monthlyTuition: 4800,
    arrears: 2400,
    paidAmount: 2400,
    status: 'Partial',
    lastPaymentDate: '2024-04-10',
    contactPhone: '+92 333 4455667',
  },
  {
    id: '4',
    grNo: 'GR-2024-004',
    studentName: 'Bilal Hassan',
    fatherName: 'Hassan Raza',
    session: '2024-2025',
    campus: 'North Campus',
    system: 'Federal Board',
    className: 'Grade 8',
    section: 'A',
    group: 'General',
    monthlyTuition: 4200,
    arrears: 0,
    paidAmount: 4200,
    status: 'Paid',
    lastPaymentDate: '2024-04-02',
    contactPhone: '+92 345 5566778',
  },
  {
    id: '5',
    grNo: 'GR-2024-005',
    studentName: 'Danyal Siddiqui',
    fatherName: 'Naveed Siddiqui',
    session: '2024-2025',
    campus: 'Main Campus',
    system: 'Cambridge (O/A Levels)',
    className: 'Grade 10',
    section: 'A',
    group: 'Pre-Medical',
    monthlyTuition: 8000,
    arrears: 16000,
    paidAmount: 0,
    status: 'Pending',
    contactPhone: '+92 300 7766554',
  },
];

export default function CollectFees() {
  const { settings } = useSchool();

  const [records, setRecords] = useState<FeeCollectRecord[]>(() => {
    const saved = localStorage.getItem('school_fee_collection');
    return saved ? JSON.parse(saved) : INITIAL_FEE_COLLECTION;
  });

  // Filter bar matching Screenshot 1 & 2
  const [sessionFilter, setSessionFilter] = useState(settings.currentSession);
  const [campusFilter, setCampusFilter] = useState(settings.currentCampus);
  const [systemFilter, setSystemFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Collect Fee Modal
  const payModal = useModal();
  const challanModal = useModal();
  const [selectedStudent, setSelectedStudent] = useState<FeeCollectRecord | null>(null);
  const [successToast, setSuccessToast] = useState('');

  // Payment form state
  const [payForm, setPayForm] = useState({
    feeMonth: 'October 2026',
    tuitionFee: 0,
    admissionFee: 0,
    examFee: 0,
    transportFee: 0,
    lateFine: 0,
    discountConcession: 0,
    amountPaying: 0,
    paymentMethod: 'Cash',
    remarks: '',
  });

  const saveRecords = (newList: FeeCollectRecord[]) => {
    setRecords(newList);
    localStorage.setItem('school_fee_collection', JSON.stringify(newList));
  };

  const openCollectModal = (student: FeeCollectRecord) => {
    setSelectedStudent(student);
    const totalDue = student.monthlyTuition + student.arrears;
    setPayForm({
      feeMonth: 'October 2026',
      tuitionFee: student.monthlyTuition,
      admissionFee: 0,
      examFee: 0,
      transportFee: 0,
      lateFine: 0,
      discountConcession: 0,
      amountPaying: totalDue,
      paymentMethod: 'Cash',
      remarks: 'Monthly tuition challan',
    });
    payModal.openModal();
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const totalInvoice =
      payForm.tuitionFee +
      payForm.admissionFee +
      payForm.examFee +
      payForm.transportFee +
      payForm.lateFine -
      payForm.discountConcession;

    const remaining = totalInvoice - payForm.amountPaying;
    const newStatus: FeeCollectRecord['status'] =
      remaining <= 0 ? 'Paid' : payForm.amountPaying > 0 ? 'Partial' : 'Pending';

    const updated: FeeCollectRecord = {
      ...selectedStudent,
      paidAmount: selectedStudent.paidAmount + payForm.amountPaying,
      arrears: Math.max(0, remaining),
      status: newStatus,
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };

    saveRecords(records.map((r) => (r.id === updated.id ? updated : r)));
    payModal.closeModal();
    setSuccessToast(`Payment of ${settings.currencySymbol} ${payForm.amountPaying} recorded for ${selectedStudent.studentName}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSession = sessionFilter === 'All' || r.session === sessionFilter;
      const matchCampus = campusFilter === 'All' || r.campus === campusFilter;
      const matchSystem = systemFilter === 'All' || r.system === systemFilter;
      const matchClass = classFilter === 'All' || r.className === classFilter;
      const matchSection = sectionFilter === 'All' || r.section === sectionFilter;
      const matchGroup = groupFilter === 'All' || r.group === groupFilter;
      const matchSearch =
        !searchQuery ||
        r.grNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSession && matchCampus && matchSystem && matchClass && matchSection && matchGroup && matchSearch;
    });
  }, [records, sessionFilter, campusFilter, systemFilter, classFilter, sectionFilter, groupFilter, searchQuery]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRecords.slice(start, start + entriesPerPage);
  }, [filteredRecords, currentPage, entriesPerPage]);

  const statusBadge = (status: FeeCollectRecord['status']) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warning';
      case 'Pending':
        return 'error';
    }
  };

  return (
    <>
      <PageMeta
        title={`Collect Fees (POS) | ${settings.schoolName}`}
        description="POS Student Fee Collection, Fee Challan Printing, and Fee Records"
      />
      <PageBreadcrumb pageTitle="Collect Fees (POS)" />

      {successToast && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Section matching Screenshot 1 & 2 */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          <div>
            <Label>Session</Label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Sessions</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
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
            <Label>System</Label>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Systems</option>
              {settings.systems.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <option value="Play Group">Play Group</option>
              <option value="Nursery">Nursery</option>
              <option value="Prep">Prep</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
            </select>
          </div>

          <div>
            <Label>Section</Label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <Label>Group</Label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Groups</option>
              <option value="General">General</option>
              <option value="Science">Science</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Pre-Engineering">Pre-Engineering</option>
              <option value="Pre-Medical">Pre-Medical</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                // Trigger refresh / filter
              }}
            >
              🔍 Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Card matching Screenshot 1: COLLECT FEES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 uppercase dark:text-white">
              COLLECT FEES
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Students roster with fee accounts, pending dues, and challan generation.
            </p>
          </div>
        </div>

        {/* Entries & Search Controls matching screenshot */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="GR No, student name, father name..."
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Data Table with exact columns from Screenshot 1 */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">GR NO.</th>
                <th className="px-4 py-3 text-start">STUDENT NAME</th>
                <th className="px-4 py-3 text-start">FATHER NAME</th>
                <th className="px-4 py-3 text-start">SESSION</th>
                <th className="px-4 py-3 text-start">CAMPUS ( SYSTEM )</th>
                <th className="px-4 py-3 text-start">CLASS ( SECTION )</th>
                <th className="px-4 py-3 text-start">GROUP</th>
                <th className="px-4 py-3 text-start">STATUS</th>
                <th className="px-4 py-3 text-end">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {item.grNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {item.studentName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.fatherName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.session}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.campus} ({item.system})
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.className} ({item.section})
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.group}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="solid" color={statusBadge(item.status)} size="sm">
                        {item.status}
                      </Badge>
                      {item.arrears > 0 && (
                        <div className="mt-0.5 text-theme-xs font-bold text-error-600">
                          Due: {settings.currencySymbol} {item.arrears}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(item);
                            challanModal.openModal();
                          }}
                        >
                          📄 Challan
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openCollectModal(item)}
                        >
                          💳 Collect Fee
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row dark:text-gray-400">
          <span>
            Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{' '}
            {Math.min(currentPage * entriesPerPage, filteredRecords.length)} of {filteredRecords.length} entries
          </span>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage * entriesPerPage >= filteredRecords.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* POS Fee Collection Modal */}
      <Modal isOpen={payModal.isOpen} onClose={payModal.closeModal} className="max-w-2xl p-6">
        {selectedStudent && (
          <div>
            <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                POS Fee Collection — {selectedStudent.studentName}
              </h3>
              <p className="text-xs text-gray-500">
                GR No: <span className="font-semibold text-brand-600">{selectedStudent.grNo}</span> · Class: {selectedStudent.className} ({selectedStudent.section}) · Campus: {selectedStudent.campus}
              </p>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Fee Month / Term *</Label>
                  <Input
                    value={payForm.feeMonth}
                    onChange={(e) => setPayForm({ ...payForm, feeMonth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Payment Method *</Label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Cash">Cash (Counter)</option>
                    <option value="Bank Transfer">Bank Transfer / Challan</option>
                    <option value="Debit/Credit Card">POS Terminal Card</option>
                    <option value="EasyPaisa / JazzCash">Mobile Wallet (EasyPaisa/JazzCash)</option>
                  </select>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Fee Breakdown ({settings.currencySymbol})
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Monthly Tuition</Label>
                    <Input
                      type="number"
                      value={payForm.tuitionFee}
                      onChange={(e) => setPayForm({ ...payForm, tuitionFee: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Admission / Annual</Label>
                    <Input
                      type="number"
                      value={payForm.admissionFee}
                      onChange={(e) => setPayForm({ ...payForm, admissionFee: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Exam / Lab Fee</Label>
                    <Input
                      type="number"
                      value={payForm.examFee}
                      onChange={(e) => setPayForm({ ...payForm, examFee: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Transport Charges</Label>
                    <Input
                      type="number"
                      value={payForm.transportFee}
                      onChange={(e) => setPayForm({ ...payForm, transportFee: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Late Payment Fine</Label>
                    <Input
                      type="number"
                      value={payForm.lateFine}
                      onChange={(e) => setPayForm({ ...payForm, lateFine: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Concession / Discount</Label>
                    <Input
                      type="number"
                      value={payForm.discountConcession}
                      onChange={(e) => setPayForm({ ...payForm, discountConcession: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-bold dark:border-gray-700">
                  <span>Net Payable Amount:</span>
                  <span className="text-brand-600">
                    {settings.currencySymbol}{' '}
                    {payForm.tuitionFee +
                      payForm.admissionFee +
                      payForm.examFee +
                      payForm.transportFee +
                      payForm.lateFine -
                      payForm.discountConcession}
                  </span>
                </div>
              </div>

              <div>
                <Label>Amount Received Now ({settings.currencySymbol}) *</Label>
                <Input
                  type="number"
                  value={payForm.amountPaying}
                  onChange={(e) => setPayForm({ ...payForm, amountPaying: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Payment Remarks</Label>
                <Input
                  value={payForm.remarks}
                  onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                  placeholder="Receipt note or bank transaction ID..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={payModal.closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Confirm & Receive Fee
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* 3-Copy Fee Challan Modal (Student, Bank, School Copies) */}
      <Modal isOpen={challanModal.isOpen} onClose={challanModal.closeModal} className="max-w-4xl p-6">
        {selectedStudent && (
          <div className="text-gray-900 dark:text-white">
            <div className="border-b-2 border-brand-500 pb-3 text-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">{settings.schoolName}</h2>
              <p className="text-xs text-gray-500">{settings.currentCampus} · Official Fee Deposit Challan</p>
            </div>

            {/* 3-Column Voucher: Bank Copy, School Copy, Student Copy */}
            <div className="my-6 grid grid-cols-1 gap-4 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-gray-200 dark:divide-gray-700">
              {['BANK COPY', 'SCHOOL / ACCOUNTS COPY', 'STUDENT / PARENT COPY'].map((copyTitle, idx) => (
                <div key={copyTitle} className={`p-3 text-xs ${idx > 0 ? 'sm:ps-4' : ''}`}>
                  <div className="mb-2 text-center font-bold uppercase tracking-wider text-brand-600">
                    {copyTitle}
                  </div>

                  <div className="space-y-1.5 border-b border-gray-200 pb-3 text-theme-xs dark:border-gray-700">
                    <div>Challan No: <strong>CH-{selectedStudent.grNo}</strong></div>
                    <div>Due Date: <strong>10th of Month</strong></div>
                    <div>GR No: <strong>{selectedStudent.grNo}</strong></div>
                    <div>Name: <strong>{selectedStudent.studentName}</strong></div>
                    <div>Father: <strong>{selectedStudent.fatherName}</strong></div>
                    <div>Class: <strong>{selectedStudent.className} ({selectedStudent.section})</strong></div>
                  </div>

                  <div className="my-3 space-y-1 text-theme-xs">
                    <div className="flex justify-between">
                      <span>Tuition Fee:</span>
                      <span>{settings.currencySymbol} {selectedStudent.monthlyTuition}</span>
                    </div>
                    {selectedStudent.arrears > 0 && (
                      <div className="flex justify-between font-bold text-error-600">
                        <span>Previous Dues:</span>
                        <span>{settings.currencySymbol} {selectedStudent.arrears}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-1 font-bold dark:border-gray-700">
                      <span>Total Amount:</span>
                      <span>{settings.currencySymbol} {selectedStudent.monthlyTuition + selectedStudent.arrears}</span>
                    </div>
                  </div>

                  <div className="mt-8 text-center text-theme-xs text-gray-400">
                    <div className="h-8"></div>
                    <div>Cashier / Bank Stamp</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <Button size="sm" variant="outline" onClick={challanModal.closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                🖨️ Print 3-Copy Challan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
