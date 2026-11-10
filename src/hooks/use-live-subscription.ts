import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { getSubdomainFromUrl } from '@/utils/config';
import { useGetCurrentSubscriptionQuery } from '@/redux/api/subscriptions/subscriptions.api';

/**
 * The restaurant's subscription as it is right now, from the server.
 *
 * Login hands the app a copy of the subscription that is kept in the browser and can be weeks old, so a
 * restaurant that stopped paying (or one that has just paid) would not be noticed until the staff logged in
 * again. This asks the server on every page load and every two minutes. `loaded` is false until the server
 * has answered (or if it cannot be reached), and then the caller keeps using the stored copy.
 */
export function useLiveSubscription(): { loaded: boolean; subscription: any | null } {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const role = String(user?.role || '').toUpperCase();
  const isRestaurantUser =
    !!isAuthenticated && role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN' && !user?.privateLoungeId && !user?.perfumeStoreId;
  const subdomain = getSubdomainFromUrl() || user?.ownedRestaurant?.subdomain || user?.restaurant?.subdomain || '';

  const { currentData } = useGetCurrentSubscriptionQuery(subdomain, {
    skip: !isRestaurantUser || !subdomain,
    pollingInterval: 120000,
    refetchOnMountOrArgChange: true,
  });

  if (!currentData || !('subscription' in currentData)) return { loaded: false, subscription: null };
  return { loaded: true, subscription: currentData.subscription ?? null };
}
