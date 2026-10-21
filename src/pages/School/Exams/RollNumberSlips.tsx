import { useState, useMemo } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { useSchool } from '@/context/SchoolContext';

interface StudentSlipData {
  id: string;
  grNo: string;
  rollNo: string;
  name: string;
  fatherName: string;
  className: string;
  section: string;
  examTerm: string;
  center: string;
  schedule: Array<{
    date: string;
    day: string;
    subject: string;
    time: string;
  }>;
}

const SAMPLE_SLIPS: StudentSlipData[] = [
  {
    id: '1',
    grNo: 'GR-2024-001',
    rollNo: 'RL-901',
    name: 'Zainab Ahmed',
    fatherName: 'Ahmed Bilal',
    className: 'Grade 9',
    section: 'A',
    examTerm: 'Midterm Examination 2024',
    center: 'Main Campus - Hall A',
    schedule: [
      { date: '2024-05-02', day: 'Thursday', subject: 'Mathematics', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-04', day: 'Saturday', subject: 'Physics', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-06', day: 'Monday', subject: 'Chemistry', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-08', day: 'Wednesday', subject: 'English Language', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-10', day: 'Friday', subject: 'Urdu Literature', time: '09:00 AM - 12:00 PM' },
    ],
  },
  {
    id: '2',
    grNo: 'GR-2024-002',
    rollNo: 'RL-902',
    name: 'Muhammad Hamza',
    fatherName: 'Tariq Mahmood',
    className: 'Grade 9',
    section: 'B',
    examTerm: 'Midterm Examination 2024',
    center: 'Main Campus - Hall A',
    schedule: [
      { date: '2024-05-02', day: 'Thursday', subject: 'Mathematics', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-04', day: 'Saturday', subject: 'Physics', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-06', day: 'Monday', subject: 'Chemistry', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-08', day: 'Wednesday', subject: 'English Language', time: '09:00 AM - 12:00 PM' },
    ],
  },
  {
    id: '3',
    grNo: 'GR-2024-003',
    rollNo: 'RL-1001',
    name: 'Ayesha Khan',
    fatherName: 'Kamran Khan',
    className: 'Grade 10',
    section: 'A',
    examTerm: 'Final Term Examination 2024',
    center: 'City Campus - Hall B',
    schedule: [
      { date: '2024-05-03', day: 'Friday', subject: 'Computer Science', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-05', day: 'Sunday', subject: 'Mathematics', time: '09:00 AM - 12:00 PM' },
      { date: '2024-05-07', day: 'Tuesday', subject: 'English', time: '09:00 AM - 12:00 PM' },
    ],
  },
];

export default function RollNumberSlips() {
  const { settings } = useSchool();
  const [slips] = useState<StudentSlipData[]>(SAMPLE_SLIPS);
  const [classFilter, setClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const printModal = useModal();
  const [activeSlip, setActiveSlip] = useState<StudentSlipData | null>(null);

  const filteredSlips = useMemo(() => {
    return slips.filter((s) => {
      const matchClass = classFilter === 'All' || s.className === classFilter;
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [slips, classFilter, searchQuery]);

  return (
    <>
      <PageMeta
        title={`Roll Number Slips | ${settings.schoolName}`}
        description="Generate and print examination roll number slips and candidate admit cards"
      />
      <PageBreadcrumb pageTitle="Roll Number Slips / Admit Cards" />

      {/* Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, GR No, roll no..."
            className="w-full sm:max-w-xs"
          />

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Classes</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
          </select>
        </div>
      </div>

      {/* List Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">ROLL NO</th>
                <th className="px-4 py-3 text-start">GR NO</th>
                <th className="px-4 py-3 text-start">STUDENT NAME</th>
                <th className="px-4 py-3 text-start">FATHER NAME</th>
                <th className="px-4 py-3 text-start">CLASS (SECTION)</th>
                <th className="px-4 py-3 text-start">EXAM TERM</th>
                <th className="px-4 py-3 text-end">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {filteredSlips.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">
                    {item.rollNo}
                  </td>
                  <td className="px-4 py-3 font-semibold">{item.grNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.fatherName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.className} ({item.section})
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.examTerm}</td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveSlip(item);
                        printModal.openModal();
                      }}
                    >
                      🖨️ View & Print Slip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Slip Modal */}
      <Modal isOpen={printModal.isOpen} onClose={printModal.closeModal} className="max-w-2xl p-6">
        {activeSlip && (
          <div className="text-gray-900 dark:text-white">
            <div className="border-b-2 border-brand-500 pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">{settings.schoolName}</h2>
              <p className="text-xs text-gray-500">{settings.currentCampus} · Controller of Examinations</p>
              <h3 className="mt-2 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                OFFICIAL EXAMINATION ROLL NUMBER SLIP
              </h3>
            </div>

            <div className="my-5 grid grid-cols-2 gap-3 text-xs">
              <div>Roll Number: <strong className="text-brand-600 font-bold">{activeSlip.rollNo}</strong></div>
              <div>GR Number: <strong>{activeSlip.grNo}</strong></div>
              <div>Candidate Name: <strong>{activeSlip.name}</strong></div>
              <div>Father Name: <strong>{activeSlip.fatherName}</strong></div>
              <div>Class / Section: <strong>{activeSlip.className} ({activeSlip.section})</strong></div>
              <div>Examination Center: <strong>{activeSlip.center}</strong></div>
            </div>

            {/* Subject Schedule */}
            <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 text-xs dark:divide-gray-700">
                <thead className="bg-gray-50 font-bold dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-start">Date</th>
                    <th className="px-3 py-2 text-start">Day</th>
                    <th className="px-3 py-2 text-start">Subject</th>
                    <th className="px-3 py-2 text-end">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeSlip.schedule.map((row) => (
                    <tr key={row.subject}>
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2">{row.day}</td>
                      <td className="px-3 py-2 font-bold">{row.subject}</td>
                      <td className="px-3 py-2 text-end text-brand-600">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <strong>Instructions:</strong> Candidates must bring this original roll number slip and institutional ID card to every examination paper. Mobile phones and unauthorized materials are strictly prohibited.
            </div>

            <div className="mt-8 flex justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
              <div>
                <div className="h-8"></div>
                <span>Candidate Signature</span>
              </div>
              <div className="text-end">
                <div className="h-8"></div>
                <span>Controller of Examinations</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <Button size="sm" variant="outline" onClick={printModal.closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                🖨️ Print Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
