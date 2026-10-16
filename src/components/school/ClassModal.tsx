import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useTranslation } from 'react-i18next';

export interface ClassFormData {
  _id?: string;
  name: string;
  grade: string;
  section: string;
  classTeacher?: string | null;
  roomNumber: string;
  capacity: number;
  academicYear: string;
}

interface TeacherOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => Promise<void>;
  initialData?: ClassFormData | null;
  teachers: TeacherOption[];
  isLoading?: boolean;
}

const defaultState: ClassFormData = {
  name: 'Grade 9',
  grade: '9',
  section: 'A',
  classTeacher: '',
  roomNumber: 'Room 101',
  capacity: 35,
  academicYear: '2025-2026',
};

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teachers,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ClassFormData>(defaultState);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const teacherOptions = [
    { value: '', label: 'None (Unassigned)' },
    ...teachers.map((tch) => ({
      value: tch._id,
      label: `${tch.firstName} ${tch.lastName}`,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {initialData ? t('school.editClass', 'Edit Classroom') : t('school.addClass', 'Add New Classroom')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{t('school.class', 'Class Display Name')} *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Grade 9 - A"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="grade">{t('school.grade', 'Grade Level')} *</Label>
            <Input
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="e.g. 9"
              required
            />
          </div>
          <div>
            <Label htmlFor="section">{t('school.section', 'Section')} *</Label>
            <Input
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. A"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="classTeacher">{t('school.teachers', 'Class Teacher (Incharge)')}</Label>
          <Select
            options={teacherOptions}
            defaultValue={formData.classTeacher || ''}
            onChange={(val) => setFormData((prev) => ({ ...prev, classTeacher: val || null }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roomNumber">{t('school.roomNumber', 'Room Number')}</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="Room 101"
            />
          </div>
          <div>
            <Label htmlFor="capacity">{t('school.capacity', 'Max Capacity')}</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('school.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? t('common.saving', 'Saving...') : t('school.save', 'Save Class')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassModal;
