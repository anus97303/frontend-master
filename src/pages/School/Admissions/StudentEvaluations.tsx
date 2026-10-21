import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
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

interface PreAdmissionCandidate {
  id: string;
  tokenNo: string;
  candidateName: string;
  fatherName: string;
  contactPhone: string;
  appliedClass: string;
  system: string;
  campus: string;
  testDate: string;
  // Test scores
  englishMarks: number;
  mathMarks: number;
  scienceMarks: number;
  urduMarks: number;
  totalMarks: number;
  testPercentage: number;
  // Interview scores
  interviewScore: number; // out of 30
  parentInterviewScore: number; // out of 10
  evaluatorRemarks: string;
  decision: 'Pending Test' | 'Test Passed' | 'Interview Cleared' | 'Recommended' | 'Admitted' | 'Not Qualified';
  admittedStudentId?: string;
}

const INITIAL_CANDIDATES: PreAdmissionCandidate[] = [
  {
    id: '1',
    tokenNo: 'ADM-TEST-2024-001',
    candidateName: 'Zainab Ahmed',
    fatherName: 'Ahmed Bilal',
    contactPhone: '+92 300 1122334',
    appliedClass: 'Grade 9',
    system: 'Matric',
    campus: 'Main Campus',
    testDate: '2024-04-20',
    englishMarks: 22,
    mathMarks: 20,
    scienceMarks: 23,
    urduMarks: 21,
    totalMarks: 86,
    testPercentage: 86,
    interviewScore: 26,
    parentInterviewScore: 9,
    evaluatorRemarks: 'Excellent spoken communication and analytical mindset. Highly recommended.',
    decision: 'Recommended',
  },
  {
    id: '2',
    tokenNo: 'ADM-TEST-2024-002',
    candidateName: 'Muhammad Hamza',
    fatherName: 'Tariq Mahmood',
    contactPhone: '+92 321 9988776',
    appliedClass: 'Grade 9',
    system: 'Cambridge (O/A Levels)',
    campus: 'Main Campus',
    testDate: '2024-04-20',
    englishMarks: 18,
    mathMarks: 24,
    scienceMarks: 21,
    urduMarks: 17,
    totalMarks: 80,
    testPercentage: 80,
    interviewScore: 24,
    parentInterviewScore: 8,
    evaluatorRemarks: 'Strong mathematical aptitude. Cleared Cambridge entry standards.',
    decision: 'Interview Cleared',
  },
  {
    id: '3',
    tokenNo: 'ADM-TEST-2024-003',
    candidateName: 'Ayesha Khan',
    fatherName: 'Kamran Khan',
    contactPhone: '+92 333 4455667',
    appliedClass: 'Grade 10',
    system: 'Matric',
    campus: 'City Campus',
    testDate: '2024-04-22',
    englishMarks: 14,
    mathMarks: 12,
    scienceMarks: 15,
    urduMarks: 16,
    totalMarks: 57,
    testPercentage: 57,
    interviewScore: 18,
    parentInterviewScore: 7,
    evaluatorRemarks: 'Needs remedial assistance in Mathematics. Recommended with foundation classes.',
    decision: 'Test Passed',
  },
  {
    id: '4',
    tokenNo: 'ADM-TEST-2024-004',
    candidateName: 'Bilal Hassan',
    fatherName: 'Hassan Raza',
    contactPhone: '+92 345 5566778',
    appliedClass: 'Grade 8',
    system: 'Federal Board',
    campus: 'North Campus',
    testDate: '2024-04-18',
    englishMarks: 23,
    mathMarks: 22,
    scienceMarks: 24,
    urduMarks: 20,
    totalMarks: 89,
    testPercentage: 89,
    interviewScore: 28,
    parentInterviewScore: 10,
    evaluatorRemarks: 'Outstanding performance in entrance examination. Admitted to Section A.',
    decision: 'Admitted',
    admittedStudentId: 'STU-2024-0042',
  },
];

export default function StudentEvaluations() {
  const { settings } = useSchool();
  const [searchParams] = useSearchParams();
  const candidateParam = searchParams.get('candidate') || '';

  const [candidates, setCandidates] = useState<PreAdmissionCandidate[]>(() => {
    const saved = localStorage.getItem('pre_admission_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [searchQuery, setSearchQuery] = useState(candidateParam);
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [campusFilter, setCampusFilter] = useState('All');

  // Modals
  const evalModal = useModal();
  const slipModal = useModal();
  const [selectedCandidate, setSelectedCandidate] = useState<PreAdmissionCandidate | null>(null);
  const [admitSuccessMsg, setAdmitSuccessMsg] = useState('');

  // Form state for evaluating candidate
  const [evalForm, setEvalForm] = useState({
    englishMarks: 0,
    mathMarks: 0,
    scienceMarks: 0,
    urduMarks: 0,
    interviewScore: 0,
    parentInterviewScore: 0,
    evaluatorRemarks: '',
    decision: 'Pending Test' as PreAdmissionCandidate['decision'],
  });

  const saveCandidates = (newList: PreAdmissionCandidate[]) => {
    setCandidates(newList);
    localStorage.setItem('pre_admission_candidates', JSON.stringify(newList));
  };

  const openEvaluation = (candidate: PreAdmissionCandidate) => {
    setSelectedCandidate(candidate);
    setEvalForm({
      englishMarks: candidate.englishMarks,
      mathMarks: candidate.mathMarks,
      scienceMarks: candidate.scienceMarks,
      urduMarks: candidate.urduMarks,
      interviewScore: candidate.interviewScore,
      parentInterviewScore: candidate.parentInterviewScore,
      evaluatorRemarks: candidate.evaluatorRemarks,
      decision: candidate.decision,
    });
    evalModal.openModal();
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const total = Number(evalForm.englishMarks) + Number(evalForm.mathMarks) + Number(evalForm.scienceMarks) + Number(evalForm.urduMarks);
    const percentage = Math.round((total / 100) * 100);

    const updated: PreAdmissionCandidate = {
      ...selectedCandidate,
      englishMarks: Number(evalForm.englishMarks),
      mathMarks: Number(evalForm.mathMarks),
      scienceMarks: Number(evalForm.scienceMarks),
      urduMarks: Number(evalForm.urduMarks),
      totalMarks: total,
      testPercentage: percentage,
      interviewScore: Number(evalForm.interviewScore),
      parentInterviewScore: Number(evalForm.parentInterviewScore),
      evaluatorRemarks: evalForm.evaluatorRemarks,
      decision: evalForm.decision,
    };

    saveCandidates(candidates.map((c) => (c.id === updated.id ? updated : c)));
    evalModal.closeModal();
  };

  const handleEnrollStudent = (candidate: PreAdmissionCandidate) => {
    const studentId = `STU-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const updated: PreAdmissionCandidate = {
      ...candidate,
      decision: 'Admitted',
      admittedStudentId: studentId,
    };

    saveCandidates(candidates.map((c) => (c.id === candidate.id ? updated : c)));
    setAdmitSuccessMsg(`Student ${candidate.candidateName} successfully enrolled with GR No. ${studentId}!`);
    setTimeout(() => setAdmitSuccessMsg(''), 5000);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tokenNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDecision = decisionFilter === 'All' || c.decision === decisionFilter;
      const matchCampus = campusFilter === 'All' || c.campus === campusFilter;
      return matchSearch && matchDecision && matchCampus;
    });
  }, [candidates, searchQuery, decisionFilter, campusFilter]);

  const badgeColor = (decision: PreAdmissionCandidate['decision']) => {
    switch (decision) {
      case 'Admitted':
        return 'success';
      case 'Recommended':
      case 'Interview Cleared':
        return 'primary';
      case 'Test Passed':
        return 'warning';
      case 'Not Qualified':
        return 'error';
      default:
        return 'light';
    }
  };

  return (
    <>
      <PageMeta
        title={`Pre-Admission Test & Interview | ${settings.schoolName}`}
        description="Entrance test scores, interview evaluations, and admission approval management"
      />
      <PageBreadcrumb pageTitle="Pre-Admission Test & Interview" />

      {admitSuccessMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>{admitSuccessMsg}</span>
        </div>
      )}

      {/* Header and stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Total Applicants</span>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{candidates.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Entrance Test Cleared</span>
          <p className="mt-1 text-2xl font-bold text-brand-600">
            {candidates.filter((c) => c.testPercentage >= 50).length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Recommended for Admission</span>
          <p className="mt-1 text-2xl font-bold text-warning-600">
            {candidates.filter((c) => c.decision === 'Recommended' || c.decision === 'Interview Cleared').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-400 uppercase">Admitted & Enrolled</span>
          <p className="mt-1 text-2xl font-bold text-success-600">
            {candidates.filter((c) => c.decision === 'Admitted').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, token, father name..."
            className="w-full sm:max-w-xs"
          />

          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Evaluation Statuses</option>
            <option value="Pending Test">Pending Test</option>
            <option value="Test Passed">Test Passed</option>
            <option value="Interview Cleared">Interview Cleared</option>
            <option value="Recommended">Recommended</option>
            <option value="Admitted">Admitted</option>
            <option value="Not Qualified">Not Qualified</option>
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
      </div>

      {/* Candidates Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-start text-xs dark:divide-gray-800">
            <thead className="bg-gray-50 font-bold uppercase text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-start">TOKEN / SLIP NO.</th>
                <th className="px-4 py-3 text-start">CANDIDATE & FATHER</th>
                <th className="px-4 py-3 text-start">APPLIED CLASS</th>
                <th className="px-4 py-3 text-start">CAMPUS (SYSTEM)</th>
                <th className="px-4 py-3 text-center">TEST SCORE (/100)</th>
                <th className="px-4 py-3 text-center">INTERVIEW (/40)</th>
                <th className="px-4 py-3 text-start">STATUS</th>
                <th className="px-4 py-3 text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No candidates found matching the selected evaluation filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {candidate.tokenNo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {candidate.candidateName}
                      </div>
                      <div className="text-theme-xs text-gray-500">S/D/O {candidate.fatherName}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {candidate.appliedClass}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {candidate.campus} · {candidate.system}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {candidate.totalMarks} / 100
                      </div>
                      <span className="text-theme-xs font-semibold text-brand-600">
                        ({candidate.testPercentage}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-200">
                      {candidate.interviewScore + candidate.parentInterviewScore} / 40
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="solid" color={badgeColor(candidate.decision)} size="sm">
                        {candidate.decision}
                      </Badge>
                      {candidate.admittedStudentId && (
                        <div className="mt-1 text-theme-xs font-bold text-success-600">
                          {candidate.admittedStudentId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            slipModal.openModal();
                          }}
                        >
                          📄 Slip
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openEvaluation(candidate)}
                        >
                          Evaluate
                        </Button>
                        {candidate.decision === 'Recommended' && (
                          <Button
                            size="sm"
                            className="bg-success-600 hover:bg-success-700"
                            onClick={() => handleEnrollStudent(candidate)}
                          >
                            ✓ Admit
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

      {/* Evaluation Modal */}
      <Modal isOpen={evalModal.isOpen} onClose={evalModal.closeModal} className="max-w-2xl p-6">
        {selectedCandidate && (
          <div>
            <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Entrance Test & Interview Evaluation
              </h3>
              <p className="text-xs text-gray-500">
                Candidate: <span className="font-semibold text-brand-600">{selectedCandidate.candidateName}</span> ({selectedCandidate.tokenNo}) · Applied for {selectedCandidate.appliedClass}
              </p>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Written Entrance Test Marks (Max 25 each, Total: 100)
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <Label>English (25)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={25}
                      value={evalForm.englishMarks}
                      onChange={(e) => setEvalForm({ ...evalForm, englishMarks: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Math (25)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={25}
                      value={evalForm.mathMarks}
                      onChange={(e) => setEvalForm({ ...evalForm, mathMarks: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Science (25)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={25}
                      value={evalForm.scienceMarks}
                      onChange={(e) => setEvalForm({ ...evalForm, scienceMarks: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Urdu / GK (25)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={25}
                      value={evalForm.urduMarks}
                      onChange={(e) => setEvalForm({ ...evalForm, urduMarks: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Panel Interview & Guardian Evaluation
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Candidate Interview (out of 30)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={evalForm.interviewScore}
                      onChange={(e) => setEvalForm({ ...evalForm, interviewScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Parent Interview (out of 10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={evalForm.parentInterviewScore}
                      onChange={(e) => setEvalForm({ ...evalForm, parentInterviewScore: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Evaluator Committee Remarks</Label>
                  <Input
                    value={evalForm.evaluatorRemarks}
                    onChange={(e) => setEvalForm({ ...evalForm, evaluatorRemarks: e.target.value })}
                    placeholder="Candidate communication skills, academic readiness notes..."
                  />
                </div>
              </div>

              <div>
                <Label>Admission Committee Final Decision</Label>
                <select
                  value={evalForm.decision}
                  onChange={(e) => setEvalForm({ ...evalForm, decision: e.target.value as PreAdmissionCandidate['decision'] })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Pending Test">Pending Test</option>
                  <option value="Test Passed">Test Passed</option>
                  <option value="Interview Cleared">Interview Cleared</option>
                  <option value="Recommended">Recommended for Admission</option>
                  <option value="Not Qualified">Not Qualified</option>
                  <option value="Admitted">Admitted & Enrolled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={evalModal.closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Evaluation
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Printable Admit Card / Evaluation Slip */}
      <Modal isOpen={slipModal.isOpen} onClose={slipModal.closeModal} className="max-w-xl p-6">
        {selectedCandidate && (
          <div className="text-gray-900 dark:text-white">
            <div className="border-b-2 border-brand-500 pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">{settings.schoolName}</h2>
              <p className="text-xs text-gray-500">{settings.currentCampus} · Admissions Department</p>
              <h3 className="mt-2 inline-block rounded-md bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                ENTRANCE TEST & INTERVIEW SLIP
              </h3>
            </div>

            <div className="my-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Slip / Token No:</span>
                <p className="font-bold text-brand-600">{selectedCandidate.tokenNo}</p>
              </div>
              <div>
                <span className="text-gray-500">Test Date:</span>
                <p className="font-bold">{selectedCandidate.testDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Candidate Name:</span>
                <p className="font-bold">{selectedCandidate.candidateName}</p>
              </div>
              <div>
                <span className="text-gray-500">Father Name:</span>
                <p className="font-bold">{selectedCandidate.fatherName}</p>
              </div>
              <div>
                <span className="text-gray-500">Applied Class:</span>
                <p className="font-bold">{selectedCandidate.appliedClass} ({selectedCandidate.system})</p>
              </div>
              <div>
                <span className="text-gray-500">Contact Number:</span>
                <p className="font-bold">{selectedCandidate.contactPhone}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs dark:border-gray-800 dark:bg-gray-800">
              <span className="font-bold">Evaluation Summary:</span>
              <div className="mt-2 flex justify-between">
                <span>Written Entrance Test Score:</span>
                <span className="font-bold text-brand-600">{selectedCandidate.totalMarks} / 100 ({selectedCandidate.testPercentage}%)</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Interview & Guardian Score:</span>
                <span className="font-bold text-brand-600">{selectedCandidate.interviewScore + selectedCandidate.parentInterviewScore} / 40</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-success-600">{selectedCandidate.decision}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
              <div>
                <div className="h-10"></div>
                <span>Candidate / Parent Signature</span>
              </div>
              <div className="text-end">
                <div className="h-10"></div>
                <span>Admissions In-charge Signature</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <Button size="sm" variant="outline" onClick={slipModal.closeModal}>
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
