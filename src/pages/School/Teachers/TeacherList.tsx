import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import TeacherModal, { type TeacherFormData } from '@/components/school/TeacherModal';
import DeleteConfirmModal from '@/components/school/DeleteConfirmModal';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlusIcon, PencilIcon, TrashBinIcon } from '@/icons';

interface TeacherItem {
  _id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  qualification: string;
  designation: string;
  department: string;
  salary: number;
  assignedClasses: Array<{
    _id: string;
    name: string;
    grade: string;
    section: string;
  }>;
  isActive: boolean;
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

export default function TeacherList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherFormData | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const clsData = await api.get<ClassItem[]>('/classes');
        setClasses(clsData);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchClasses();
  }, []);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = '/teachers?limit=50';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.get<{ teachers: TeacherItem[] }>(query);
      setTeachers(res.teachers);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleOpenAdd = () => {
    setSelectedTeacher(null);
    openForm();
  };

  const handleOpenEdit = (tch: TeacherItem) => {
    setSelectedTeacher({
      _id: tch._id,
      firstName: tch.firstName,
      lastName: tch.lastName,
      email: tch.email,
      phone: tch.phone,
      gender: tch.gender,
      qualification: tch.qualification,
      designation: tch.designation,
      department: tch.department,
      salary: tch.salary,
      assignedClasses: tch.assignedClasses.map((c) => c._id),
    });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setTeacherToDelete(id);
    openDelete();
  };

  const handleSaveTeacher = async (formData: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      if (formData._id) {
        await api.put(`/teachers/${formData._id}`, formData);
      } else {
        await api.post('/teachers', formData);
      }
      closeForm();
      fetchTeachers();
    } catch (err) {
      console.error('Error saving teacher', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/teachers/${teacherToDelete}`);
      closeDelete();
      fetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManage = user?.role === 'admin';

  return (
    <>
      <PageMeta
        title="Teachers & Faculty | TailAdmin - School Management"
        description="Faculty directory, class assignments, and teacher credentials"
      />
      <PageBreadcrumb pageTitle={t('school.teachers', 'Faculty & Teachers')} />

      {/* Control bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder={t('school.searchPlaceholder', 'Search by name or department...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {canManage && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={handleOpenAdd}>
            {t('school.addTeacher', 'Add Faculty Member')}
          </Button>
        )}
      </div>

      {/* Teachers Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={t('school.noData', 'No teachers found')}
              description="No faculty members found matching your search."
              actionLabel={canManage ? t('school.addTeacher', 'Add Teacher') : undefined}
              onAction={canManage ? handleOpenAdd : undefined}
            />
          </div>
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[700px] text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t('school.teacherId', 'Teacher ID')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.name', 'Faculty Name')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.department', 'Department')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.qualification', 'Qualification')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.classes', 'Assigned Classes')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.phone', 'Contact')}</th>
                  {canManage && <th className="px-5 py-3.5 text-end">{t('school.actions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {teachers.map((tch) => (
                  <tr
                    key={tch._id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-5 py-3.5 font-bold text-brand-600 dark:text-brand-400">
                      {tch.teacherId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        {tch.firstName} {tch.lastName}
                      </div>
                      <span className="text-theme-xs text-gray-400">{tch.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="light" color="primary" size="sm">
                        {tch.department || 'General'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                      {tch.qualification || '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {tch.assignedClasses && tch.assignedClasses.length > 0 ? (
                          tch.assignedClasses.map((c) => (
                            <span
                              key={c._id}
                              className="rounded bg-gray-100 px-2 py-0.5 text-theme-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                              {c.name} ({c.section})
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                      {tch.phone}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tch)}
                            title="Edit Teacher"
                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(tch._id)}
                            title="Delete Teacher"
                            className="flex size-8 items-center justify-center rounded-lg border border-error-200 text-error-500 hover:bg-error-50 dark:border-error-500/20 dark:hover:bg-error-500/10"
                          >
                            <TrashBinIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher Form Modal */}
      <TeacherModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSaveTeacher}
        initialData={selectedTeacher}
        classes={classes}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        title={t('school.editTeacher', 'Delete Teacher Record')}
        message={t(
          'school.confirmDelete',
          'Are you sure you want to deactivate this faculty member? Their login account will also be disabled.'
        )}
        isDeleting={isSubmitting}
      />
    </>
  );
}
