import { baseApi } from '../baseApi';

export type ActiveTabKind = 'MEMBER' | 'DESIGNATED_MEMBER' | 'GUEST_PASS' | 'WALK_IN';

export interface ActiveTab {
  kind: ActiveTabKind;
  id: string;
  customer: { type: 'member' | 'walkIn'; id: string };
  name: string;
  reference: string | null;
  tier: string | null;
  sponsorName: string | null;
  checkedInAt: string;
  orderCount: number;
  orderTotal: number;
  lastOrderAt: string | null;
  status: 'WAITING' | 'ATTENDED';
  // Walk-ins and pass guests only; null for members
  paymentConfirmed: boolean | null;
  // What is still owed when the tab is closed
  amountDue: number;
}

export interface ActiveTabsResponse {
  summary: { total: number; waiting: number; attended: number };
  tabs: ActiveTab[];
}

export const tabsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveTabs: builder.query<ActiveTabsResponse, string>({
      query: (loungeId) => ({
        url: `/private-lounge/admin/tabs/active?loungeId=${loungeId}`,
      }),
      providesTags: ['LOUNGE_TABS'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetActiveTabsQuery } = tabsApi;

// The key used to pick a customer: "member:<id>" or "walkIn:<id>"
export const tabKey = (tab: ActiveTab) => `${tab.customer.type}:${tab.customer.id}`;
