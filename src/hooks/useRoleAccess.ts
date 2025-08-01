import { useAuth } from '../contexts/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isCustomer = user?.role === 'customer';
  const isApprovedVendor = isVendor && user?.vendorInfo?.approved;

  const canManageDropshipping = isAdmin;
  const canManageAllProducts = isAdmin;
  const canManageOwnProducts = isVendor && isApprovedVendor;
  const canViewAllOrders = isAdmin;
  const canViewOwnOrders = isVendor || isCustomer;
  const canManageUsers = isAdmin;
  const canApproveVendors = isAdmin;
  const canViewAnalytics = isAdmin || (isVendor && isApprovedVendor);
  const canManageCommissions = isAdmin;

  return {
    user,
    isAdmin,
    isVendor,
    isCustomer,
    isApprovedVendor,
    canManageDropshipping,
    canManageAllProducts,
    canManageOwnProducts,
    canViewAllOrders,
    canViewOwnOrders,
    canManageUsers,
    canApproveVendors,
    canViewAnalytics,
    canManageCommissions,
  };
};