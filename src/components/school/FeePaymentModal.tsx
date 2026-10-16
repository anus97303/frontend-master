import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useTranslation } from 'react-i18next';

export interface FeePaymentFormData {
  studentId: string;
  classId: string;
  title: string;
  feeType: string;
  amount: number;
  discount: number;
  paidAmount: number;
  paymentMethod: string;
  dueDate: string;
  remarks: string;
}

interface StudentOption {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  classId: {
    _id: string;
    name: string;
    section: string;
  };
}

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeePaymentFormData) => Promise<void>;
  students: StudentOption[];
  isLoading?: boolean;
}

const defaultState: FeePaymentFormData = {
  studentId: '',
  classId: '',
  title: 'Term 1 Tuition Fee',
  feeType: 'Tuition',
  amount: 1200,
  discount: 0,
  paidAmount: 1200,
  paymentMethod: 'Cash',
  dueDate: new Date().toISOString().split('T')[0],
  remarks: '',
};

export const FeePaymentModal: React.FC<FeePaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FeePaymentFormData>(defaultState);

  useEffect(() => {
    if (students.length > 0 && !formData.studentId) {
      const firstStu = students[0];
      setFormData((prev) => ({
        ...prev,
        studentId: firstStu._id,
        classId: firstStu.classId?._id || '',
      }));
    }
  }, [students, formData.studentId, isOpen]);

  const handleStudentSelect = (id: string) => {
    const found = students.find((s) => s._id === id);
    setFormData((prev) => ({
      ...prev,
      studentId: id,
      classId: found?.classId?._id || prev.classId,
    }));
  };

  const handleAmountChange = (field: 'amount' | 'discount' | 'paidAmount', val: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: Math.max(0, val) };
      if (field === 'amount' && updated.paidAmount > updated.amount) {
        updated.paidAmount = updated.amount;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const payable = Math.max(0, (formData.amount || 0) - (formData.discount || 0));
  const balance = Math.max(0, payable - (formData.paidAmount || 0));

  const studentOptions = students.map((s) => ({
    value: s._id,
    label: `${s.firstName} ${s.lastName} (${s.studentId}) - ${s.classId?.name || ''}`,
  }));

  const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Card', label: 'Credit / Debit Card' },
    { value: 'Online', label: 'Online / Gateway' },
  ];

  const feeTypes = [
    { value: 'Tuition', label: 'Tuition Fee' },
    { value: 'Admission', label: 'Admission Fee' },
    { value: 'Exam', label: 'Exam Fee' },
    { value: 'Transport', label: 'Transport Fee' },
    { value: 'Library', label: 'Library Fee' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {t('school.collectFee', 'Record Fee Collection')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>{t('school.students', 'Select Student')} *</Label>
          <Select
            options={studentOptions}
            defaultValue={formData.studentId}
            onChange={handleStudentSelect}
            placeholder="Select Student"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">{t('school.feeType', 'Fee Description')} *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Term 1 Tuition"
              required
            />
          </div>
          <div>
            <Label>{t('school.feeType', 'Category')}</Label>
            <Select
              options={feeTypes}
              defaultValue={formData.feeType}
              onChange={(val) => setFormData((prev) => ({ ...prev, feeType: val }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="amount">{t('school.amount', 'Billed ($)')} *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleAmountChange('amount', Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="discount">{t('school.discount', 'Discount ($)')}</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleAmountChange('discount', Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="paidAmount">{t('school.paid', 'Paid Now ($)')} *</Label>
            <Input
              id="paidAmount"
              type="number"
              value={formData.paidAmount}
              onChange={(e) => handleAmountChange('paidAmount', Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('school.paymentMethod', 'Payment Mode')}</Label>
            <Select
              options={paymentMethods}
              defaultValue={formData.paymentMethod}
              onChange={(val) => setFormData((prev) => ({ ...prev, paymentMethod: val }))}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">{t('school.dueDate', 'Due Date')}</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="remarks">Notes / Transaction Reference</Label>
          <Input
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="e.g. Paid in full via cash desk"
          />
        </div>

        {/* Calculation summary banner */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Payable: </span>
            <span className="font-bold text-gray-800 dark:text-white">${payable}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Paid: </span>
            <span className="font-bold text-success-600 dark:text-success-400">${formData.paidAmount}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Balance Remaining: </span>
            <span className={`font-bold ${balance > 0 ? 'text-error-500' : 'text-gray-600'}`}>
              ${balance}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('school.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? t('common.saving', 'Processing...') : t('school.save', 'Collect Fee')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FeePaymentModal;
