import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useTranslation } from 'react-i18next';

export interface StudentFormData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  classId: string;
  section: string;
  rollNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
}

interface ClassOption {
  _id: string;
  name: string;
  grade: string;
  section: string;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  initialData?: StudentFormData | null;
  classes: ClassOption[];
  isLoading?: boolean;
}

const defaultState: StudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  gender: 'Male',
  dob: '2010-01-01',
  bloodGroup: 'Unknown',
  classId: '',
  section: 'A',
  rollNumber: '',
  guardianName: '',
  guardianRelation: 'Father',
  guardianPhone: '',
  guardianEmail: '',
  address: '',
};

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  classes,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<StudentFormData>(defaultState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dob: initialData.dob ? initialData.dob.split('T')[0] : '2010-01-01',
      });
    } else {
      setFormData({
        ...defaultState,
        classId: classes[0]?._id || '',
      });
    }
  }, [initialData, classes, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const classOptions = classes.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.section})`,
  }));

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {initialData ? t('school.editStudent', 'Edit Student') : t('school.addStudent', 'Add New Student')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">{t('school.name', 'First Name')} *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">{t('school.name', 'Last Name')} *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">{t('school.email', 'Student Email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@school.com"
            />
          </div>
          <div>
            <Label htmlFor="gender">{t('school.gender', 'Gender')} *</Label>
            <Select
              options={genderOptions}
              defaultValue={formData.gender}
              onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="dob">{t('school.dob', 'Date of Birth')} *</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="classId">{t('school.class', 'Assigned Class')} *</Label>
            <Select
              options={classOptions}
              defaultValue={formData.classId}
              onChange={(val) => setFormData((prev) => ({ ...prev, classId: val }))}
              placeholder="Select Class"
            />
          </div>
          <div>
            <Label htmlFor="rollNumber">{t('school.rollNumber', 'Roll Number')}</Label>
            <Input
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. 15"
            />
          </div>
        </div>

        {/* Guardian Info */}
        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
          <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('school.guardian', 'Guardian Details')}
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guardianName">{t('school.guardian', 'Guardian Name')} *</Label>
              <Input
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Parent / Guardian Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone">{t('school.guardianPhone', 'Guardian Phone')} *</Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="+1 555-0199"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="address">{t('school.address', 'Residential Address')}</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, City, State"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('school.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? t('common.saving', 'Saving...') : t('school.save', 'Save Student')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentModal;
