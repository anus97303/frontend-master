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
import { PlusIcon, EyeIcon, TrashBinIcon } from '@/icons';

interface RegistrationRecord {
  id: string;
  regNo: string;
  studentName: string;
  fatherName: string;
  session: string;
  campus: string;
  system: string;
  className: string;
  section: string;
  group: string;
  gender: string;
  phone: string;
  dateOfBirth: string;
  previousSchool: string;
  status: 'Inquiry' | 'Test Scheduled' | 'Interview Pending' | 'Admitted' | 'Cancelled';
  createdAt: string;
}

const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: '1',
    regNo: 'REG-2024-0101',
    studentName: 'Zainab Ahmed',
    fatherName: 'Ahmed Bilal',
    session: '2024-2025',
    campus: 'Main Campus',
    system: 'Matric',
    className: 'Play Group',
    section: 'A',
    group: 'General',
    gender: 'Female',
    phone: '+92 300 1122334',
    dateOfBirth: '2020-03-15',
    previousSchool: 'Little Angels Montessori',
    status: 'Inquiry',
    createdAt: '2024-04-10',
  },
  {
    id: '2',
    regNo: 'REG-2024-0102',
    studentName: 'Muhammad Hamza',
    fatherName: 'Tariq Mahmood',
    session: '2024-2025',
    campus: 'Main Campus',
    system: 'Cambridge (O/A Levels)',
    className: 'Grade 9',
    section: 'B',
    group: 'Science',
    gender: 'Male',
    phone: '+92 321 9988776',
    dateOfBirth: '2009-08-20',
    previousSchool: 'Beaconhouse School System',
    status: 'Test Scheduled',
    createdAt: '2024-04-12',
  },
  {
    id: '3',
    regNo: 'REG-2024-0103',
    studentName: 'Ayesha Khan',
    fatherName: 'Kamran Khan',
    session: '2024-2025',
    campus: 'City Campus',
    system: 'Matric',
    className: 'Grade 10',
    section: 'A',
    group: 'Computer Science',
    gender: 'Female',
    phone: '+92 333 4455667',
    dateOfBirth: '2008-11-05',
    previousSchool: 'City School Campus',
    status: 'Interview Pending',
    createdAt: '2024-04-14',
  },
  {
    id: '4',
    regNo: 'REG-2024-0104',
    studentName: 'Bilal Hassan',
    fatherName: 'Hassan Raza',
    session: '2024-2025',
    campus: 'North Campus',
    system: 'Federal Board',
    className: 'Grade 8',
    section: 'A',
    group: 'General',
    gender: 'Male',
    phone: '+92 345 5566778',
    dateOfBirth: '2010-06-12',
    previousSchool: 'Army Public School',
    status: 'Admitted',
    createdAt: '2024-04-15',
  },
];

export default function ManageRegistration() {
  const { settings } = useSchool();

  const [records, setRecords] = useState<RegistrationRecord[]>(() => {
    const saved = localStorage.getItem('school_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  // Filter Bar state matching screenshots
  const [sessionFilter, setSessionFilter] = useState(settings.currentSession);
  const [campusFilter, setCampusFilter] = useState(settings.currentCampus);
  const [systemFilter, setSystemFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    session: settings.currentSession,
    campus: settings.currentCampus,
    system: 'Matric',
    className: 'Play Group',
    section: 'A',
    group: 'General',
    gender: 'Male',
    phone: '',
    dateOfBirth: '',
    previousSchool: '',
  });

  const saveRecords = (newRecords: RegistrationRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('school_registrations', JSON.stringify(newRecords));
  };

  const handleCreateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: RegistrationRecord = {
      id: Date.now().toString(),
      regNo: `REG-${new Date().getFullYear()}-${String(records.length + 101).padStart(4, '0')}`,
      ...formData,
      status: 'Test Scheduled',
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveRecords([newRecord, ...records]);
    closeModal();
    setFormData({
      studentName: '',
      fatherName: '',
      session: settings.currentSession,
      campus: settings.currentCampus,
      system: 'Matric',
      className: 'Play Group',
      section: 'A',
      group: 'General',
      gender: 'Male',
      phone: '',
      dateOfBirth: '',
      previousSchool: '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this registration record?')) {
      saveRecords(records.filter((r) => r.id !== id));
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSession = sessionFilter === 'All' || r.session === sessionFilter;
      const matchCampus = campusFilter === 'All' || r.campus === campusFilter;
      const matchSystem = systemFilter === 'All' || r.system === systemFilter;
      const matchClass = classFilter === 'All' || r.className === classFilter;
      const matchGroup = groupFilter === 'All' || r.group === groupFilter;
      const matchSearch =
        !searchQuery ||
        r.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery);

      return matchSession && matchCampus && matchSystem && matchClass && matchGroup && matchSearch;
    });
  }, [records, sessionFilter, campusFilter, systemFilter, classFilter, groupFilter, searchQuery]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRecords.slice(start, start + entriesPerPage);
  }, [filteredRecords, currentPage, entriesPerPage]);

  const statusColor = (status: RegistrationRecord['status']) => {
    switch (status) {
      case 'Admitted':
        return 'success';
      case 'Test Scheduled':
      case 'Interview Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <>
      <PageMeta
        title={`Manage Registration | ${settings.schoolName}`}
        description="Pre-admission student registration, applicant records, and session enrollment"
      />
      <PageBreadcrumb pageTitle="Manage Registration" />

      {/* Filter Section matching Screenshot 4 */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Filter Registrations
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
            <Label>Group / Section</Label>
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
              <option value="Arts">Arts</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSessionFilter('All');
                setCampusFilter('All');
                setSystemFilter('All');
                setClassFilter('All');
                setGroupFilter('All');
                setSearchQuery('');
              }}
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Card matching Screenshot 4 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 uppercase dark:text-white">
              MANAGE REGISTRATION
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Applicants: <span className="font-semibold text-brand-600">{filteredRecords.length}</span>
            </p>
          </div>

          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={openModal}>
            Add Registration
          </Button>
        </div>

        {/* Controls: entries selector and search bar */}
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
              placeholder="Name, father name, reg no..."
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Data Table with exact columns from Screenshots 1 & 4 */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">GR / REG NO.</th>
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
                    No registration records available in table matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {item.regNo}
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
                      <Badge variant="solid" color={statusColor(item.status)} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/school/admissions/evaluations?candidate=${encodeURIComponent(item.studentName)}`}
                          className="rounded-lg bg-brand-50 p-1.5 text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                          title="Schedule Test / Interview"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg bg-error-50 p-1.5 text-error-600 transition hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                          title="Delete"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary */}
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

      {/* Add Registration Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          Add New Student Registration
        </h3>

        <form onSubmit={handleCreateRegistration} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Student Full Name *</Label>
              <Input
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Zainab Ahmed"
                required
              />
            </div>
            <div>
              <Label>Father / Guardian Name *</Label>
              <Input
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Ahmed Bilal"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Gender</Label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Campus *</Label>
              <select
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {settings.campuses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>System *</Label>
              <select
                value={formData.system}
                onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {settings.systems.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Desired Class *</Label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Play Group">Play Group</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Group / Stream</Label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="General">General</option>
                <option value="Science">Science</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Pre-Engineering">Pre-Engineering</option>
                <option value="Pre-Medical">Pre-Medical</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
            <div>
              <Label>Previous School / Institute</Label>
              <Input
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                placeholder="Name of previous school"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              Save Registration
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
