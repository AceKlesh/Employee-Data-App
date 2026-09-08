// Mirrors the backend's requireRole(...) rules exactly, so the UI never
// shows an action that the API would reject.
export const ROLES = {
  ADMIN: 'Admin',
  HR_MANAGER: 'HR Manager',
  DEPARTMENT_MANAGER: 'Department Manager',
  EMPLOYEE: 'Employee',
};

export const canManageEmployees = (role) => [ROLES.ADMIN, ROLES.HR_MANAGER].includes(role);
export const canDeleteEmployees = (role) => role === ROLES.ADMIN;
export const canManageDepartments = (role) => [ROLES.ADMIN, ROLES.HR_MANAGER].includes(role);
export const canDeleteDepartments = (role) => role === ROLES.ADMIN;
export const canMarkAttendance = (role) =>
  [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_MANAGER].includes(role);
export const canReviewLeaves = (role) =>
  [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_MANAGER].includes(role);