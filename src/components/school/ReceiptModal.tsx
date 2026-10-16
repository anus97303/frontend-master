import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useTranslation } from 'react-i18next';

export interface FeeReceiptData {
  _id: string;
  receiptNo: string;
  title: string;
  feeType: string;
  amount: number;
  discount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Cancelled';
  remarks?: string;
  cancelReason?: string;
  studentId: {
    studentId: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    guardianName: string;
    guardianPhone: string;
  };
  classId: {
    name: string;
    section: string;
  };
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: FeeReceiptData | null;
  schoolName?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  schoolName = 'Horizon International Academy',
}) => {
  const { t } = useTranslation();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusColorMap = {
    Paid: 'success' as const,
    Partial: 'warning' as const,
    Pending: 'error' as const,
    Cancelled: 'dark' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-10">
      <div id="printable-receipt" className="bg-white p-2 dark:bg-gray-900">
        {/* Receipt Header */}
        <div className="border-b-2 border-brand-500 pb-5 text-center">
          <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
            {schoolName}
          </h2>
          <p className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Official Fee Payment Receipt
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Receipt No: <strong className="text-gray-800 dark:text-white">{receipt.receiptNo}</strong>
            </span>
            <span>
              Date:{' '}
              <strong className="text-gray-800 dark:text-white">
                {receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}
              </strong>
            </span>
          </div>
        </div>

        {/* Student Bio */}
        <div className="my-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-xs dark:bg-gray-800/60 sm:grid-cols-3">
          <div>
            <span className="block text-gray-400">Student Name</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {receipt.studentId?.firstName} {receipt.studentId?.lastName}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Student ID</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {receipt.studentId?.studentId}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Class & Section</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {receipt.classId?.name} ({receipt.classId?.section})
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Guardian</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {receipt.studentId?.guardianName}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Payment Mode</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {receipt.paymentMethod}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Payment Status</span>
            <Badge variant="solid" color={statusColorMap[receipt.status]} size="sm">
              {receipt.status}
            </Badge>
          </div>
        </div>

        {/* Payment Line Items */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-start text-sm">
            <thead className="bg-gray-100/75 text-xs uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-start">Particulars / Description</th>
                <th className="px-4 py-3 text-end">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                  {receipt.title} ({receipt.feeType})
                </td>
                <td className="px-4 py-3 text-end font-semibold text-gray-800 dark:text-white">
                  ${receipt.amount.toFixed(2)}
                </td>
              </tr>
              {receipt.discount > 0 && (
                <tr className="text-xs text-success-600 dark:text-success-400">
                  <td className="px-4 py-2 text-start">Waiver / Scholarship Discount</td>
                  <td className="px-4 py-2 text-end">-${receipt.discount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50 text-sm font-bold dark:border-gray-700 dark:bg-gray-800/50">
              <tr>
                <td className="px-4 py-2 text-start text-gray-700 dark:text-gray-300">Net Payable</td>
                <td className="px-4 py-2 text-end text-gray-900 dark:text-white">
                  ${(receipt.amount - receipt.discount).toFixed(2)}
                </td>
              </tr>
              <tr className="text-brand-600 dark:text-brand-400">
                <td className="px-4 py-2 text-start">Amount Paid</td>
                <td className="px-4 py-2 text-end">${receipt.paidAmount.toFixed(2)}</td>
              </tr>
              <tr className={receipt.balance > 0 ? 'text-error-500' : 'text-gray-500'}>
                <td className="px-4 py-2 text-start">Outstanding Balance</td>
                <td className="px-4 py-2 text-end">${receipt.balance.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {receipt.status === 'Cancelled' && (
          <div className="mt-4 rounded-xl border border-error-200 bg-error-50 p-3 text-xs text-error-700 dark:border-error-800/40 dark:bg-error-500/10 dark:text-error-400">
            <strong>NOTICE:</strong> This receipt was cancelled. Reason: {receipt.cancelReason || 'Cancelled by admin'}.
          </div>
        )}

        {/* Cashier signature */}
        <div className="mt-10 flex justify-between px-4 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <div className="border-t border-gray-300 pt-2 dark:border-gray-700">
            <span className="block font-semibold">Student / Guardian Signature</span>
          </div>
          <div className="border-t border-gray-300 pt-2 dark:border-gray-700">
            <span className="block font-semibold">Authorized Accounts Officer</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 print:hidden">
        <Button variant="outline" size="sm" onClick={onClose}>
          {t('school.cancel', 'Close')}
        </Button>
        <Button size="sm" onClick={handlePrint}>
          {t('school.print', 'Print Receipt')}
        </Button>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
