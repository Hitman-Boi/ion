"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UserRoleForm, EnrollmentRoleForm } from './role-forms';

// Mock actions
const mockUpdateUserGlobalRole = vi.fn();
const mockUpdateCourseEnrollmentRole = vi.fn();

vi.mock('@/app/actions/admin.actions', () => ({
    updateUserGlobalRole: (...args: any[]) => mockUpdateUserGlobalRole(...args),
    updateCourseEnrollmentRole: (...args: any[]) => mockUpdateCourseEnrollmentRole(...args),
}));

// Mock requestSubmit on HTMLFormElement prototype since jsdom doesn't implement it fully
HTMLFormElement.prototype.requestSubmit = vi.fn();

describe('RoleForms', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('UserRoleForm', () => {
        it('renders with correct default role', () => {
            render(<UserRoleForm userId="user-1" currentRole="INSTRUCTOR" />);
            const select = screen.getByRole('combobox');
            expect(select).toHaveValue('INSTRUCTOR');
        });

        it('calls requestSubmit on change', () => {
            render(<UserRoleForm userId="user-1" currentRole="USER" />);
            const select = screen.getByRole('combobox');

            fireEvent.change(select, { target: { value: 'ADMIN' } });

            expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled();
        });
    });

    describe('EnrollmentRoleForm', () => {
        it('renders with correct default role', () => {
            render(<EnrollmentRoleForm courseId="course-1" userId="user-1" currentRole="STUDENT" />);
            const select = screen.getByRole('combobox');
            expect(select).toHaveValue('STUDENT');
        });

        it('calls requestSubmit on change', () => {
            render(<EnrollmentRoleForm courseId="course-1" userId="user-1" currentRole="STUDENT" />);
            const select = screen.getByRole('combobox');

            fireEvent.change(select, { target: { value: 'INSTRUCTOR' } });

            expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled();
        });
    });
});
