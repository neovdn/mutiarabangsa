export const COLORS = {
  PRIMARY: '#00FFFF',
  ACCENT: '#FF00FF',
  YELLOW: '#FFFF00',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#808080',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_DASHBOARD: '/dashboard/admin',
  CUSTOMER_DASHBOARD: '/dashboard/customer',
} as const;
