export const TEST_USERS = {
    ADMIN: {
        email: 'admin@learning-hub.iongroup.com',
        password: 'admin',
        name: 'Admin User',
        role: 'ADMIN' as const,
    },
    INSTRUCTOR: {
        email: 'instructor@learning-hub.iongroup.com',
        password: 'instructor',
        name: 'Instructor User',
        role: 'INSTRUCTOR' as const,
    },
    STUDENT: {
        email: 'test@learning-hub.iongroup.com',
        password: 'test',
        name: 'Test User',
        role: 'STUDENT' as const,
    },
};
