import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import ClassModal, { type ClassFormData } from '@/components/school/ClassModal';
import DeleteConfirmModal from '@/components/school/DeleteConfirmModal';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlusIcon, PencilIcon, TrashBinIcon, UserIcon } from '@/icons';

interface ClassItem {
  _id: string;
  name: string;
  grade: string;
  section: string;
  roomNumber: string;
  capacity: number;
  academicYear: string;
  classTeacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  studentCount?: number;
  subjectCount?: number;
}

interface TeacherOption {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function ClassList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const [selectedClass, setSelectedClass] = useState<ClassFormData | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ClassItem[]>('/classes');
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();

    // Fetch teachers for dropdown
    const fetchTeachers = async () => {
      try {
        const res = await api.get<{ teachers: TeacherOption[] }>('/teachers?limit=100');
        setTeachers(res.teachers);
      } catch (err) {
        console.error('Failed to load teachers', err);
      }
    };
    fetchTeachers();
  }, [fetchClasses]);

  const handleOpenAdd = () => {
    setSelectedClass(null);
    openForm();
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setSelectedClass({
      _id: cls._id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      classTeacher: cls.classTeacher?._id || null,
      roomNumber: cls.roomNumber,
      capacity: cls.capacity,
      academicYear: cls.academicYear,
    });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setClassToDelete(id);
    openDelete();
  };

  const handleSaveClass = async (formData: ClassFormData) => {
    setIsSubmitting(true);
    try {
      if (formData._id) {
        await api.put(`/classes/${formData._id}`, formData);
      } else {
        await api.post('/classes', formData);
      }
      closeForm();
      fetchClasses();
    } catch (err) {
      console.error('Error saving class', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/classes/${classToDelete}`);
      closeDelete();
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManage = user?.role === 'admin';

  return (
    <>
      <PageMeta
        title="Classrooms & Sections | TailAdmin - School Management"
        description="Manage school grades, sections, room assignments, and class in-charges"
      />
      <PageBreadcrumb pageTitle={t('school.classes', 'Classrooms & Sections')} />

      {/* Control bar */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
            Active Classes ({classes.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Current academic session: 2025-2026
          </p>
        </div>

        {canManage && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={handleOpenAdd}>
            {t('school.addClass', 'Add Classroom')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="p-6">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes created"
          description="Create school grade sections to enroll students and assign instructors."
          actionLabel={canManage ? t('school.addClass', 'Add Classroom') : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="solid" color="primary" size="sm">
                    Grade {cls.grade}
                  </Badge>
                  <h3 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">
                    {cls.name}
                  </h3>
                  <span className="text-xs text-gray-400">Section {cls.section} • {cls.roomNumber || 'Room N/A'}</span>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      title="Edit Class"
                      className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(cls._id)}
                      title="Delete Class"
                      className="flex size-7 items-center justify-center rounded-lg border border-error-200 text-error-500 hover:bg-error-50 dark:border-error-500/20"
                    >
                      <TrashBinIcon className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <UserIcon className="size-4 shrink-0" />
                  <span>Teacher: </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {cls.classTeacher
                      ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                      : 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-2.5 text-center text-xs dark:bg-gray-800">
                <div>
                  <span className="block text-gray-400">Students</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {cls.studentCount ?? 0} / {cls.capacity}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400">Subjects</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {cls.subjectCount ?? 0} Core
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Form Modal */}
      <ClassModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSaveClass}
        initialData={selectedClass}
        teachers={teachers}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Classroom"
        message="Are you sure you want to deactivate this class? Enrolled students will remain intact."
        isDeleting={isSubmitting}
      />
    </>
  );
}
