export const ROLES = { STUDENT: 'student', COOK: 'cook', ADMIN: 'admin' }

export const MEAL_TYPES = { BREAKFAST: 'breakfast', LUNCH: 'lunch' }

export const PAYMENT_TYPES = { SINGLE: 'single', SUBSCRIPTION: 'subscription' }

export const PAYMENT_STATUS = { PENDING: 'pending', COMPLETED: 'completed', FAILED: 'failed' }

export const REQUEST_STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  STUDENT: { MENU: '/student/menu', ORDERS: '/student/orders', PAYMENTS: '/student/payments', PROFILE: '/student/profile', REVIEWS: '/student/reviews' },
  COOK: { MEALS: '/cook/meals', INVENTORY: '/cook/inventory', REQUESTS: '/cook/requests' },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    REQUESTS: '/admin/requests',
    REPORTS: '/admin/reports',
    MENU: '/admin/menu',
    TEMPLATES: '/admin/templates',
    TEMPLATE_GROUPS: '/admin/template-groups',
    WEEK_TEMPLATES: '/admin/week-templates',
    USERS: '/admin/users',
  },
}

export function getDefaultPathByRole(role) {
  switch (role) {
    case ROLES.STUDENT:
    case 'student':
      return ROUTES.STUDENT.MENU
    case ROLES.COOK:
    case 'cook':
      return ROUTES.COOK.MEALS
    case ROLES.ADMIN:
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD
    default:
      return ROUTES.LOGIN
  }
}

export * from './labels'
