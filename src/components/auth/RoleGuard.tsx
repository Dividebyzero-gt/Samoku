import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'vendor' | 'customer')[];
  fallback?: React.ReactNode;
  requireApproval?: boolean; // For vendors who need store approval
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null,
  requireApproval = false 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check vendor approval if required
  if (requireApproval && user.role === 'vendor' && !user.vendorInfo?.approved) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Store Approval Pending</h3>
        <p className="text-yellow-700">
          Your vendor application is under review. You'll receive access once approved by our admin team.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;