import { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { useSchool } from '@/context/SchoolContext';

interface TCData {
  tcNumber: string;
  grNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  admissionDate: string;
  leavingDate: string;
  classLeaving: string;
  reasonForLeaving: string;
  moralConduct: string;
  duesCleared: boolean;
  remarks: string;
}

const SAMPLE_TC: TCData = {
  tcNumber: 'TC-2024-0089',
  grNo: 'GR-2024-001',
  studentName: 'Zainab Ahmed',
  fatherName: 'Ahmed Bilal',
  motherName: 'Saima Ahmed',
  dateOfBirth: '2008-05-14',
  admissionDate: '2021-08-15',
  leavingDate: '2024-04-20',
  classLeaving: 'Grade 9 (Passed into Grade 10)',
  reasonForLeaving: 'Parent Relocation / Transfer to another city',
  moralConduct: 'Exemplary / Very Good',
  duesCleared: true,
  remarks: 'Possesses good moral character and demonstrated satisfactory academic aptitude throughout tenure.',
};

export default function TransferCertificate() {
  const { settings } = useSchool();
  const [tcData, setTcData] = useState<TCData>(SAMPLE_TC);
  const printModal = useModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTcData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <PageMeta
        title={`Transfer Certificate (TC) | ${settings.schoolName}`}
        description="Generate and issue official school leaving and transfer certificates"
      />
      <PageBreadcrumb pageTitle="Transfer Certificate (TC)" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Generator Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Issue School Leaving / Transfer Certificate
            </h3>
            <p className="text-xs text-gray-500">
              Enter student credentials to prepare official certificate.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              printModal.openModal();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>TC Number</Label>
                <Input
                  name="tcNumber"
                  value={tcData.tcNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Student GR / Admission No *</Label>
                <Input
                  name="grNo"
                  value={tcData.grNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Student Full Name *</Label>
                <Input
                  name="studentName"
                  value={tcData.studentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Father Name *</Label>
                <Input
                  name="fatherName"
                  value={tcData.fatherName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={tcData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Date of Admission</Label>
                <Input
                  type="date"
                  name="admissionDate"
                  value={tcData.admissionDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Date of Leaving School</Label>
                <Input
                  type="date"
                  name="leavingDate"
                  value={tcData.leavingDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Class from which Leaving</Label>
                <Input
                  name="classLeaving"
                  value={tcData.classLeaving}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Moral Conduct & Character</Label>
                <Input
                  name="moralConduct"
                  value={tcData.moralConduct}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Reason for Leaving Institute</Label>
              <Input
                name="reasonForLeaving"
                value={tcData.reasonForLeaving}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>General Remarks</Label>
              <Input
                name="remarks"
                value={tcData.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                🖨️ Generate & Preview Certificate
              </Button>
            </div>
          </form>
        </div>

        {/* Info card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
            Document Policy Guidelines
          </h3>
          <ul className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
            <li>
              • <strong>Audit Log:</strong> Every issued transfer certificate is stamped with an immutable serial number.
            </li>
            <li>
              • <strong>Dues Clearance:</strong> Verify through the Accounts Department that all tuition fees, library books, and laboratory equipment have been reconciled.
            </li>
            <li>
              • <strong>Archival:</strong> Student status will automatically transition to <em>Transferred / Withdrawn</em> upon physical issuance.
            </li>
          </ul>
        </div>
      </div>

      {/* Printable TC Modal */}
      <Modal isOpen={printModal.isOpen} onClose={printModal.closeModal} className="max-w-2xl p-8">
        <div className="border-4 border-double border-brand-900 p-8 text-gray-900 dark:border-white/20 dark:text-white">
          <div className="border-b-2 border-brand-500 pb-4 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight">{settings.schoolName}</h1>
            <p className="text-xs text-gray-500">{settings.address}, {settings.city}</p>
            <p className="text-xs text-gray-500">Contact: {settings.schoolPhone} · {settings.schoolEmail}</p>
            <h2 className="mt-4 inline-block border-y-2 border-brand-600 px-6 py-1 text-sm font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
              SCHOOL LEAVING / TRANSFER CERTIFICATE
            </h2>
          </div>

          <div className="my-6 flex justify-between text-xs font-semibold">
            <span>Certificate No: <strong className="text-brand-600">{tcData.tcNumber}</strong></span>
            <span>GR / Admission No: <strong>{tcData.grNo}</strong></span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <p>
              This is to certify that <strong>{tcData.studentName}</strong>, son / daughter of Mr. <strong>{tcData.fatherName}</strong>, was a bonafide student of this institution.
            </p>
            <p>
              Date of Birth (according to school admission register): <strong>{tcData.dateOfBirth}</strong>.
            </p>
            <p>
              He / She was admitted to this institution on <strong>{tcData.admissionDate}</strong> and left the institution on <strong>{tcData.leavingDate}</strong>.
            </p>
            <p>
              Class at the time of leaving: <strong>{tcData.classLeaving}</strong>.
            </p>
            <p>
              Reason for leaving the school: <strong>{tcData.reasonForLeaving}</strong>.
            </p>
            <p>
              Institutional dues up to the date of leaving have been <strong>fully cleared and settled</strong>.
            </p>
            <p>
              Conduct and moral character: <strong>{tcData.moralConduct}</strong>.
            </p>
            <p className="italic text-gray-600 dark:text-gray-400">
              Remarks: {tcData.remarks}
            </p>
          </div>

          <div className="mt-14 flex justify-between text-xs pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-gray-400 pt-1">Class Teacher</div>
            </div>
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-gray-400 pt-1">Administrative Officer</div>
            </div>
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-gray-400 pt-1 font-bold">Principal / Headmaster</div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 print:hidden">
            <Button size="sm" variant="outline" onClick={printModal.closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              🖨️ Print Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
