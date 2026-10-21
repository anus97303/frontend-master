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
import { CheckCircleIcon, PlusIcon } from '@/icons';

interface TeacherApplicant {
  id: string;
  applicantNo: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  subjectSpecialization: string;
  experienceYears: number;
  expectedSalary: number;
  campus: string;
  demoDate: string;
  demoTopic: string;
  // Demo evaluation scores (out of 10 each, total 40)
  subjectKnowledgeScore: number;
  whiteboardSkillsScore: number;
  studentEngagementScore: number;
  communicationScore: number;
  totalDemoScore: number;
  // Panel Interview scores (out of 20)
  panelInterviewScore: number;
  evaluatorRemarks: string;
  status: 'Applied' | 'Demo Scheduled' | 'Demo Passed' | 'Offer Extended' | 'Hired as Faculty' | 'Rejected';
  hiredTeacherId?: string;
}

const INITIAL_APPLICANTS: TeacherApplicant[] = [
  {
    id: '1',
    applicantNo: 'FAC-APP-2024-01',
    fullName: 'Dr. Arsalan Rafiq',
    email: 'arsalan.rafiq@gmail.com',
    phone: '+92 301 2345678',
    qualification: 'Ph.D. / M.Phil Physics',
    subjectSpecialization: 'Physics & Applied Science',
    experienceYears: 6,
    expectedSalary: 85000,
    campus: 'Main Campus',
    demoDate: '2024-04-18',
    demoTopic: 'Electromagnetic Induction & Faraday’s Laws',
    subjectKnowledgeScore: 10,
    whiteboardSkillsScore: 9,
    studentEngagementScore: 9,
    communicationScore: 10,
    totalDemoScore: 38,
    panelInterviewScore: 19,
    evaluatorRemarks: 'Exceptional conceptual clarity, engaging demo lecture. Highly suitable for Senior Cambridge & Matric sections.',
    status: 'Hired as Faculty',
    hiredTeacherId: 'TCH-2024-0015',
  },
  {
    id: '2',
    applicantNo: 'FAC-APP-2024-02',
    fullName: 'Ms. Fatima Noor',
    email: 'fatima.noor@outlook.com',
    phone: '+92 322 8765432',
    qualification: 'M.Sc. Mathematics, B.Ed',
    subjectSpecialization: 'Pure & Applied Mathematics',
    experienceYears: 4,
    expectedSalary: 65000,
    campus: 'Main Campus',
    demoDate: '2024-04-21',
    demoTopic: 'Quadratic Equations & Trigonometric Identities',
    subjectKnowledgeScore: 9,
    whiteboardSkillsScore: 9,
    studentEngagementScore: 8,
    communicationScore: 9,
    totalDemoScore: 35,
    panelInterviewScore: 18,
    evaluatorRemarks: 'Methodical teaching approach, structured whiteboard layout, strong rapport with students.',
    status: 'Demo Passed',
  },
  {
    id: '3',
    applicantNo: 'FAC-APP-2024-03',
    fullName: 'Syed Hamza Ali',
    email: 'hamza.ali.cs@gmail.com',
    phone: '+92 334 1122334',
    qualification: 'BS Computer Science',
    subjectSpecialization: 'Computer Science & ICT',
    experienceYears: 2,
    expectedSalary: 55000,
    campus: 'City Campus',
    demoDate: '2024-04-24',
    demoTopic: 'Object-Oriented Programming Concepts in Python',
    subjectKnowledgeScore: 8,
    whiteboardSkillsScore: 7,
    studentEngagementScore: 8,
    communicationScore: 8,
    totalDemoScore: 31,
    panelInterviewScore: 16,
    evaluatorRemarks: 'Good technical proficiency. Recommend appointing as Junior/Middle School CS teacher.',
    status: 'Offer Extended',
  },
];

export default function TeacherRecruitment() {
  const { settings } = useSchool();

  const [applicants, setApplicants] = useState<TeacherApplicant[]>(() => {
    const saved = localStorage.getItem('teacher_recruitment_applicants');
    return saved ? JSON.parse(saved) : INITIAL_APPLICANTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campusFilter, setCampusFilter] = useState('All');

  // Modals
  const evalModal = useModal();
  const addModal = useModal();
  const printModal = useModal();
  const [selectedApplicant, setSelectedApplicant] = useState<TeacherApplicant | null>(null);
  const [successToast, setSuccessToast] = useState('');

  // New applicant form
  const [newForm, setNewForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    subjectSpecialization: '',
    experienceYears: 1,
    expectedSalary: 50000,
    campus: settings.currentCampus,
    demoTopic: '',
    demoDate: new Date().toISOString().split('T')[0],
  });

  // Demo evaluation form
  const [evalForm, setEvalForm] = useState({
    subjectKnowledgeScore: 0,
    whiteboardSkillsScore: 0,
    studentEngagementScore: 0,
    communicationScore: 0,
    panelInterviewScore: 0,
    evaluatorRemarks: '',
    status: 'Demo Scheduled' as TeacherApplicant['status'],
  });

  const saveApplicants = (newList: TeacherApplicant[]) => {
    setApplicants(newList);
    localStorage.setItem('teacher_recruitment_applicants', JSON.stringify(newList));
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: TeacherApplicant = {
      id: Date.now().toString(),
      applicantNo: `FAC-APP-${new Date().getFullYear()}-${String(applicants.length + 1).padStart(2, '0')}`,
      ...newForm,
      experienceYears: Number(newForm.experienceYears),
      expectedSalary: Number(newForm.expectedSalary),
      subjectKnowledgeScore: 0,
      whiteboardSkillsScore: 0,
      studentEngagementScore: 0,
      communicationScore: 0,
      totalDemoScore: 0,
      panelInterviewScore: 0,
      evaluatorRemarks: '',
      status: 'Demo Scheduled',
    };

    saveApplicants([newRecord, ...applicants]);
    addModal.closeModal();
    setSuccessToast(`Applicant ${newRecord.fullName} registered for recruitment demo & interview!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const openEvaluation = (applicant: TeacherApplicant) => {
    setSelectedApplicant(applicant);
    setEvalForm({
      subjectKnowledgeScore: applicant.subjectKnowledgeScore,
      whiteboardSkillsScore: applicant.whiteboardSkillsScore,
      studentEngagementScore: applicant.studentEngagementScore,
      communicationScore: applicant.communicationScore,
      panelInterviewScore: applicant.panelInterviewScore,
      evaluatorRemarks: applicant.evaluatorRemarks,
      status: applicant.status,
    });
    evalModal.openModal();
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    const totalDemo =
      Number(evalForm.subjectKnowledgeScore) +
      Number(evalForm.whiteboardSkillsScore) +
      Number(evalForm.studentEngagementScore) +
      Number(evalForm.communicationScore);

    const updated: TeacherApplicant = {
      ...selectedApplicant,
      subjectKnowledgeScore: Number(evalForm.subjectKnowledgeScore),
      whiteboardSkillsScore: Number(evalForm.whiteboardSkillsScore),
      studentEngagementScore: Number(evalForm.studentEngagementScore),
      communicationScore: Number(evalForm.communicationScore),
      totalDemoScore: totalDemo,
      panelInterviewScore: Number(evalForm.panelInterviewScore),
      evaluatorRemarks: evalForm.evaluatorRemarks,
      status: evalForm.status,
    };

    saveApplicants(applicants.map((a) => (a.id === updated.id ? updated : a)));
    evalModal.closeModal();
    setSuccessToast(`Demo score & interview evaluated for ${updated.fullName}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleHireTeacher = (applicant: TeacherApplicant) => {
    const teacherId = `TCH-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const updated: TeacherApplicant = {
      ...applicant,
      status: 'Hired as Faculty',
      hiredTeacherId: teacherId,
    };

    saveApplicants(applicants.map((a) => (a.id === applicant.id ? updated : a)));
    setSuccessToast(`Congratulations! ${applicant.fullName} officially appointed with Faculty ID: ${teacherId}`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchSearch =
        !searchQuery ||
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subjectSpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.applicantNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchCampus = campusFilter === 'All' || a.campus === campusFilter;
      return matchSearch && matchStatus && matchCampus;
    });
  }, [applicants, searchQuery, statusFilter, campusFilter]);

  const badgeColor = (status: TeacherApplicant['status']) => {
    switch (status) {
      case 'Hired as Faculty':
        return 'success';
      case 'Demo Passed':
      case 'Offer Extended':
        return 'primary';
      case 'Demo Scheduled':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'light';
    }
  };

  return (
    <>
      <PageMeta
        title={`Teacher Recruitment & Demo Interview | ${settings.schoolName}`}
        description="Faculty candidate assessment, demo lecture scoring, and hiring process"
      />
      <PageBreadcrumb pageTitle="Teacher Recruitment & Demo Interview" />

      {successToast && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Applicants</span>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{applicants.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Demo Scheduled</span>
          <p className="mt-1 text-2xl font-bold text-warning-600">
            {applicants.filter((a) => a.status === 'Demo Scheduled').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Demo Cleared / Selected</span>
          <p className="mt-1 text-2xl font-bold text-brand-600">
            {applicants.filter((a) => a.status === 'Demo Passed' || a.status === 'Offer Extended').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Hired as Faculty</span>
          <p className="mt-1 text-2xl font-bold text-success-600">
            {applicants.filter((a) => a.status === 'Hired as Faculty').length}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, subject specialization..."
            className="w-full sm:max-w-xs"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Recruitment Stages</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Demo Passed">Demo Passed</option>
            <option value="Offer Extended">Offer Extended</option>
            <option value="Hired as Faculty">Hired as Faculty</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Campuses</option>
            {settings.campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={addModal.openModal}>
          Add Teacher Candidate
        </Button>
      </div>

      {/* Applicants Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">APP NO.</th>
                <th className="px-4 py-3 text-start">CANDIDATE NAME</th>
                <th className="px-4 py-3 text-start">SUBJECT & DEGREE</th>
                <th className="px-4 py-3 text-start">EXPERIENCE</th>
                <th className="px-4 py-3 text-center">DEMO SCORE (/40)</th>
                <th className="px-4 py-3 text-center">INTERVIEW (/20)</th>
                <th className="px-4 py-3 text-start">STATUS</th>
                <th className="px-4 py-3 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No teacher applicants found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {applicant.applicantNo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {applicant.fullName}
                      </div>
                      <div className="text-theme-xs text-gray-500">{applicant.email} · {applicant.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {applicant.subjectSpecialization}
                      </div>
                      <div className="text-theme-xs text-gray-500">{applicant.qualification}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {applicant.experienceYears} Years
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {applicant.totalDemoScore} / 40
                      </div>
                      <span className="text-theme-xs text-gray-500">{applicant.demoTopic}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">
                      {applicant.panelInterviewScore} / 20
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="solid" color={badgeColor(applicant.status)} size="sm">
                        {applicant.status}
                      </Badge>
                      {applicant.hiredTeacherId && (
                        <div className="mt-1 text-theme-xs font-bold text-success-600">
                          {applicant.hiredTeacherId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            printModal.openModal();
                          }}
                        >
                          📄 Form
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openEvaluation(applicant)}
                        >
                          Demo Score
                        </Button>
                        {applicant.status !== 'Hired as Faculty' && (
                          <Button
                            size="sm"
                            className="bg-success-600 hover:bg-success-700"
                            onClick={() => handleHireTeacher(applicant)}
                          >
                            ✓ Hire
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluate Demo & Interview Modal */}
      <Modal isOpen={evalModal.isOpen} onClose={evalModal.closeModal} className="max-w-2xl p-6">
        {selectedApplicant && (
          <div>
            <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Teacher Demo Lecture & Interview Assessment
              </h3>
              <p className="text-xs text-gray-500">
                Candidate: <span className="font-semibold text-brand-600">{selectedApplicant.fullName}</span> ({selectedApplicant.subjectSpecialization})
              </p>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Demo Lecture Assessment Criteria (Score 1 - 10 Each)
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <Label>Subject Command (10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={evalForm.subjectKnowledgeScore}
                      onChange={(e) => setEvalForm({ ...evalForm, subjectKnowledgeScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Whiteboard Skills (10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={evalForm.whiteboardSkillsScore}
                      onChange={(e) => setEvalForm({ ...evalForm, whiteboardSkillsScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Class Engagement (10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={evalForm.studentEngagementScore}
                      onChange={(e) => setEvalForm({ ...evalForm, studentEngagementScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Communication (10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={evalForm.communicationScore}
                      onChange={(e) => setEvalForm({ ...evalForm, communicationScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Panel Interview & Evaluator Recommendations
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Interview Score (out of 20)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={evalForm.panelInterviewScore}
                      onChange={(e) => setEvalForm({ ...evalForm, panelInterviewScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Recruitment Status</Label>
                    <select
                      value={evalForm.status}
                      onChange={(e) => setEvalForm({ ...evalForm, status: e.target.value as TeacherApplicant['status'] })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Demo Scheduled">Demo Scheduled</option>
                      <option value="Demo Passed">Demo Passed</option>
                      <option value="Offer Extended">Offer Extended</option>
                      <option value="Hired as Faculty">Hired as Faculty</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Evaluator Panel Remarks & Pedagogical Assessment</Label>
                  <Input
                    value={evalForm.evaluatorRemarks}
                    onChange={(e) => setEvalForm({ ...evalForm, evaluatorRemarks: e.target.value })}
                    placeholder="Pedagogy, class control, subject depth, salary recommendations..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={evalModal.closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Assessment
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Add New Teacher Candidate Modal */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.closeModal} className="max-w-2xl p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          Register New Teacher Candidate for Recruitment
        </h3>

        <form onSubmit={handleCreateApplicant} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Candidate Full Name *</Label>
              <Input
                value={newForm.fullName}
                onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                placeholder="e.g. Dr. Arsalan Rafiq"
                required
              />
            </div>
            <div>
              <Label>Contact Phone *</Label>
              <Input
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                placeholder="+92 300 1234567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                placeholder="applicant@domain.com"
                required
              />
            </div>
            <div>
              <Label>Highest Qualification *</Label>
              <Input
                value={newForm.qualification}
                onChange={(e) => setNewForm({ ...newForm, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Mathematics, M.Phil, B.Ed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Subject Specialization *</Label>
              <Input
                value={newForm.subjectSpecialization}
                onChange={(e) => setNewForm({ ...newForm, subjectSpecialization: e.target.value })}
                placeholder="e.g. Physics, Chemistry, English"
                required
              />
            </div>
            <div>
              <Label>Teaching Experience (Years)</Label>
              <Input
                type="number"
                min={0}
                value={newForm.experienceYears}
                onChange={(e) => setNewForm({ ...newForm, experienceYears: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Expected Salary ({settings.currencySymbol})</Label>
              <Input
                type="number"
                value={newForm.expectedSalary}
                onChange={(e) => setNewForm({ ...newForm, expectedSalary: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Demo Lecture Topic *</Label>
              <Input
                value={newForm.demoTopic}
                onChange={(e) => setNewForm({ ...newForm, demoTopic: e.target.value })}
                placeholder="e.g. Thermodynamics, Linear Equations"
                required
              />
            </div>
            <div>
              <Label>Demo Lecture Date</Label>
              <Input
                type="date"
                value={newForm.demoDate}
                onChange={(e) => setNewForm({ ...newForm, demoDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={addModal.closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              Register Applicant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Evaluation & Appointment Slip */}
      <Modal isOpen={printModal.isOpen} onClose={printModal.closeModal} className="max-w-xl p-6">
        {selectedApplicant && (
          <div className="text-gray-900 dark:text-white">
            <div className="border-b-2 border-brand-500 pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">{settings.schoolName}</h2>
              <p className="text-xs text-gray-500">{settings.currentCampus} · Human Resources & Faculty Recruitment</p>
              <h3 className="mt-2 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                TEACHER DEMO LECTURE & INTERVIEW ASSESSMENT SHEET
              </h3>
            </div>

            <div className="my-5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Applicant No:</span>
                <p className="font-bold text-brand-600">{selectedApplicant.applicantNo}</p>
              </div>
              <div>
                <span className="text-gray-500">Demo Date:</span>
                <p className="font-bold">{selectedApplicant.demoDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Candidate Name:</span>
                <p className="font-bold">{selectedApplicant.fullName}</p>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <p className="font-bold">{selectedApplicant.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">Qualification:</span>
                <p className="font-bold">{selectedApplicant.qualification}</p>
              </div>
              <div>
                <span className="text-gray-500">Subject:</span>
                <p className="font-bold">{selectedApplicant.subjectSpecialization}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs dark:border-gray-800 dark:bg-gray-800">
              <span className="font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Demo Evaluation Breakdown:</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>Subject Command: <strong>{selectedApplicant.subjectKnowledgeScore}/10</strong></div>
                <div>Whiteboard Skills: <strong>{selectedApplicant.whiteboardSkillsScore}/10</strong></div>
                <div>Student Engagement: <strong>{selectedApplicant.studentEngagementScore}/10</strong></div>
                <div>Communication: <strong>{selectedApplicant.communicationScore}/10</strong></div>
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-2 font-bold dark:border-gray-700">
                <span>Total Demo Score:</span>
                <span className="text-brand-600">{selectedApplicant.totalDemoScore} / 40</span>
              </div>
              <div className="mt-1 flex justify-between font-bold">
                <span>Interview Score:</span>
                <span className="text-brand-600">{selectedApplicant.panelInterviewScore} / 20</span>
              </div>
              <div className="mt-1 flex justify-between font-bold">
                <span>Current Status:</span>
                <span className="text-success-600">{selectedApplicant.status}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
              <div>
                <div className="h-10"></div>
                <span>Evaluator / Senior Teacher Signature</span>
              </div>
              <div className="text-end">
                <div className="h-10"></div>
                <span>Principal / Director Signature</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <Button size="sm" variant="outline" onClick={printModal.closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                🖨️ Print Form
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
