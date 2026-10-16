import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useTranslation } from 'react-i18next';

export interface TeacherFormData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  qualification: string;
  designation: string;
  department: string;
  salary: number;
  assignedClasses: string[];
}

interface ClassOption {
  _id: string;
  name: string;
  section: string;
}

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  initialData?: TeacherFormData | null;
  classes: ClassOption[];
  isLoading?: boolean;
}

const defaultState: TeacherFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: 'Female',
  qualification: 'B.Ed., M.Sc.',
  designation: 'Subject Teacher',
  department: 'General',
  salary: 55000,
  assignedClasses: [],
};

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  classes,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TeacherFormData>(defaultState);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedClasses.includes(classId);
      return {
        ...prev,
        assignedClasses: exists
          ? prev.assignedClasses.filter((id) => id !== classId)
          : [...prev.assignedClasses, classId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {initialData ? t('school.editTeacher', 'Edit Teacher') : t('school.addTeacher', 'Add Faculty Member')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">{t('school.name', 'First Name')} *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Sarah"
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
              placeholder="e.g. Johnson"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">{t('school.email', 'Email Address')} *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah.johnson@school.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">{t('school.phone', 'Phone Number')} *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555-0123"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="gender">{t('school.gender', 'Gender')} *</Label>
            <Select
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              defaultValue={formData.gender}
              onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
            />
          </div>
          <div>
            <Label htmlFor="department">{t('school.department', 'Department')}</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <Label htmlFor="designation">{t('school.designation', 'Designation')}</Label>
            <Input
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Senior Faculty"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="qualification">{t('school.qualification', 'Qualification')}</Label>
            <Input
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. M.Sc., B.Ed."
            />
          </div>
          <div>
            <Label htmlFor="salary">{t('school.amount', 'Salary / Compensation')}</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData((prev) => ({ ...prev, salary: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
          <Label>{t('school.classes', 'Assign Classes')}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {classes.map((cls) => {
              const isSelected = formData.assignedClasses.includes(cls._id);
              return (
                <button
                  type="button"
                  key={cls._id}
                  onClick={() => handleClassToggle(cls._id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {cls.name} ({cls.section})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('school.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? t('common.saving', 'Saving...') : t('school.save', 'Save Teacher')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeacherModal;
