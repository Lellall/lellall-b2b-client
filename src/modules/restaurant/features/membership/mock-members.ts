export type MembershipStatus = 'Active' | 'Expired' | 'Disabled';
export type MembershipPlan = 'Classic Monthly' | 'Gold Monthly' | 'Platinum Annual' | 'Founders Club';

export interface Member {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  membershipId: string;
  planType: MembershipPlan;
  status: MembershipStatus;
  startDate: string;
  expiryDate: string;
  notes: string;
  monthlyValue: number;
}

export const planValues: Record<MembershipPlan, number> = {
  'Classic Monthly': 45000,
  'Gold Monthly': 85000,
  'Platinum Annual': 180000,
  'Founders Club': 250000,
};

export const membershipPlans = Object.keys(planValues) as MembershipPlan[];

export const membershipMembers: Member[] = [
  {
    id: '1',
    fullName: 'Aisha Bello',
    phoneNumber: '+234 803 452 1190',
    email: 'aisha.bello@example.com',
    membershipId: 'LEL-CLUB-1001',
    planType: 'Gold Monthly',
    status: 'Active',
    startDate: '2026-01-05',
    expiryDate: '2026-07-05',
    notes: 'Prefers table service. Orders should be marked as subscription covered.',
    monthlyValue: planValues['Gold Monthly'],
  },
  {
    id: '2',
    fullName: 'Daniel Okafor',
    phoneNumber: '+234 812 908 3471',
    email: 'daniel.okafor@example.com',
    membershipId: 'LEL-CLUB-1002',
    planType: 'Platinum Annual',
    status: 'Active',
    startDate: '2026-02-12',
    expiryDate: '2027-02-12',
    notes: 'Annual subscription member. QR can be scanned from POS later.',
    monthlyValue: planValues['Platinum Annual'],
  },
  {
    id: '3',
    fullName: 'Fatima Usman',
    phoneNumber: '+234 909 118 6204',
    email: '',
    membershipId: 'LEL-CLUB-1003',
    planType: 'Classic Monthly',
    status: 'Expired',
    startDate: '2025-11-20',
    expiryDate: '2026-02-20',
    notes: 'Renewal pending. Keep order coverage disabled until renewal.',
    monthlyValue: planValues['Classic Monthly'],
  },
  {
    id: '4',
    fullName: 'Tunde Balogun',
    phoneNumber: '+234 701 770 5530',
    email: 'tunde.balogun@example.com',
    membershipId: 'LEL-CLUB-1004',
    planType: 'Founders Club',
    status: 'Disabled',
    startDate: '2026-03-01',
    expiryDate: '2026-09-01',
    notes: 'Temporarily disabled by manager. Keep membership ID for reactivation.',
    monthlyValue: planValues['Founders Club'],
  },
  {
    id: '5',
    fullName: 'Grace Eze',
    phoneNumber: '+234 818 444 9910',
    email: 'grace.eze@example.com',
    membershipId: 'LEL-CLUB-1005',
    planType: 'Gold Monthly',
    status: 'Active',
    startDate: '2026-04-15',
    expiryDate: '2026-10-15',
    notes: 'Demo member for QR lookup and covered order flow.',
    monthlyValue: planValues['Gold Monthly'],
  },
];

const demoMembershipStorageKey = 'lellall_demo_membership_members';

export const getDemoMembershipMembers = () => {
  if (typeof window === 'undefined') return membershipMembers;

  try {
    const storedMembers = window.localStorage.getItem(demoMembershipStorageKey);
    if (!storedMembers) return membershipMembers;

    const parsedMembers = JSON.parse(storedMembers);
    return Array.isArray(parsedMembers) ? parsedMembers as Member[] : membershipMembers;
  } catch (error) {
    console.error('Failed to read demo membership members:', error);
    return membershipMembers;
  }
};

export const saveDemoMembershipMembers = (members: Member[]) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(demoMembershipStorageKey, JSON.stringify(members));
  } catch (error) {
    console.error('Failed to save demo membership members:', error);
  }
};
