import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import { useTranslation } from 'react-i18next';

export interface NoticeFormData {
  title: string;
  content: string;
  targetRole: string;
  priority: string;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => Promise<void>;
  isLoading?: boolean;
}

const defaultState: NoticeFormData = {
  title: '',
  content: '',
  targetRole: 'all',
  priority: 'medium',
};

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<NoticeFormData>(defaultState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData(defaultState);
  };

  const targetRoles = [
    { value: 'all', label: 'Everyone (All Roles)' },
    { value: 'teacher', label: 'Faculty & Teachers Only' },
    { value: 'student', label: 'Students Only' },
    { value: 'parent', label: 'Parents Only' },
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High / Urgent Priority' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {t('school.postNotice', 'Create School Notice')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="noticeTitle">{t('school.noticeTitle', 'Notice Headline')} *</Label>
          <Input
            id="noticeTitle"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Schedule for Annual Examinations"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('school.targetAudience', 'Audience')}</Label>
            <Select
              options={targetRoles}
              defaultValue={formData.targetRole}
              onChange={(val) => setFormData((prev) => ({ ...prev, targetRole: val }))}
            />
          </div>
          <div>
            <Label>{t('school.priority', 'Priority Level')}</Label>
            <Select
              options={priorities}
              defaultValue={formData.priority}
              onChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="content">Notice Content / Body *</Label>
          <TextArea
            rows={5}
            value={formData.content}
            onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
            placeholder="Type notice message, instructions, and dates here..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('school.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? t('common.saving', 'Posting...') : t('school.postNotice', 'Publish Notice')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeModal;
