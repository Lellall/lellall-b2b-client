import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

// Hosts and hostesses work the floor: they check people in and out, take orders and handle walk-ins
// and one-time passes. The accountant only reads, so the reports can be tied to the people behind
// them. Editing members, stock, staff and billing is for management. The server enforces the same
// rules; this only hides what a role cannot use.
export const useLoungeRole = () => {
  const role = (useSelector((state: RootState) => state.auth.user)?.role || '').toUpperCase();
  const isFrontOfHouse = role === 'HOST' || role === 'HOSTESS';
  const isAccountant = role === 'ACCOUNTANT';
  return {
    isFrontOfHouse,
    isAccountant,
    // Check people in and out, take orders, settle tabs
    canOperate: !isAccountant,
    // Change members, stock and settings
    canManage: !isFrontOfHouse && !isAccountant,
  };
};
