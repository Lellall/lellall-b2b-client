import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { Ticket, ShieldTick, Profile2User } from 'iconsax-react';
import { toast } from 'react-toastify';
import { useLazyLookupCheckInCodeQuery, useRedeemGuestPassMutation } from '../../../../redux/api/private-lounge/check-in.api';
import { useCheckInMemberMutation, useRequestCheckInPinMutation } from '../../../../redux/api/private-lounge/members.api';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/30 focus:border-[#05431E]';
const primaryButton =
  'w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed';

export const CheckIn: React.FC = () => {
  const [code, setCode] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Guest pass form
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Member PIN step
  const [pinSent, setPinSent] = useState(false);
  const [pin, setPin] = useState('');

  const [lookup, { isFetching: isLookingUp }] = useLazyLookupCheckInCodeQuery();
  const [redeemPass, { isLoading: isRedeeming }] = useRedeemGuestPassMutation();
  const [requestPin, { isLoading: isSendingPin }] = useRequestCheckInPinMutation();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMemberMutation();

  const reset = () => {
    setCode('');
    setResult(null);
    setLookupError(null);
    setDone(null);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setPinSent(false);
    setPin('');
  };

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setResult(null);
    setDone(null);
    setPinSent(false);
    setPin('');
    setLookupError(null);
    try {
      setResult(await lookup(code, false).unwrap());
    } catch (error: any) {
      setLookupError(error?.message || 'No member or pass found for this code');
    }
  };

  const handleRedeem = async () => {
    try {
      const response: any = await redeemPass({
        code: result.code,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        guestEmail: guestEmail.trim() || undefined,
      }).unwrap();
      setDone(`${guestName.trim()} is checked in. ${response.remaining} passes left for ${response.sponsor.fullName}.`);
    } catch (error: any) {
      toast.error(error?.message || 'Could not use this pass');
    }
  };

  const handleSendPin = async () => {
    try {
      await requestPin(result.member.id).unwrap();
      setPinSent(true);
      toast.success('PIN sent to their email');
    } catch (error: any) {
      toast.error(error?.message || 'Could not send the PIN');
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn({ membershipId: result.member.id, pin }).unwrap();
      setDone(`${result.member.fullName} is checked in.`);
    } catch (error: any) {
      toast.error(error?.message || 'Invalid PIN or check-in failed');
    }
  };

  const isPass = result?.type === 'GUEST_PASS';
  const isMember = result?.type === 'MEMBER' || result?.type === 'DESIGNATED_MEMBER';

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
        <p className="text-sm text-gray-500 mt-1">
          Type or scan a member number or a one-time pass code.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SAL-AE-101  or  SAL-PASS-XXXX-XXXX"
            className={`${inputClass} pl-11 font-mono uppercase`}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={isLookingUp || !code.trim()}
          className="px-6 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLookingUp ? 'Looking…' : 'Look up'}
        </button>
      </form>

      {lookupError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <XCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{lookupError}</p>
        </div>
      )}

      {done && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3 text-green-900">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{done}</p>
          </div>
          <button onClick={reset} className={`${primaryButton} mt-5`}>
            Check in the next person
          </button>
        </div>
      )}

      {/* ─── ONE-TIME PASS ─────────────────────────────── */}
      {!done && isPass && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <Ticket size="22" className="text-[#05431E]" variant="Bulk" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">One-time guest pass</p>
              <p className="font-mono text-sm font-bold text-gray-900">{result.code}</p>
            </div>
          </div>

          {result.usable ? (
            <>
              <p className="text-sm text-gray-600">
                Valid. Sponsored by <span className="font-semibold text-gray-900">{result.sponsor.fullName}</span>
                {' '}({result.sponsor.membershipNumber}), who has{' '}
                <span className="font-semibold text-gray-900">{result.remaining}</span> passes left.
              </p>
              <div className="space-y-3">
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest's full name (required)"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Email, for welcome and receipts"
                    className={inputClass}
                  />
                </div>
              </div>
              <button onClick={handleRedeem} disabled={isRedeeming || !guestName.trim()} className={primaryButton}>
                {isRedeeming ? 'Checking in…' : 'Use pass & check in guest'}
              </button>
              <p className="text-xs text-gray-400">
                Using the pass cancels this code for good. The guest pays for anything they order from the menu on
                their own tab, apart from the complimentary beverage and cigar. With an email address they get a
                welcome message, a confirmation each time they order, and a final receipt. Without one, none of
                these are sent.
              </p>
            </>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <XCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">{result.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── MEMBER OR DESIGNATED MEMBER ───────────────── */}
      {!done && isMember && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              {result.type === 'MEMBER' ? (
                <ShieldTick size="22" className="text-[#05431E]" variant="Bulk" />
              ) : (
                <Profile2User size="22" className="text-[#05431E]" variant="Bulk" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {result.type === 'MEMBER' ? `${result.member.tier} member` : 'Designated member'}
              </p>
              <p className="text-lg font-bold text-gray-900">{result.member.fullName}</p>
              <p className="font-mono text-xs text-gray-500">{result.member.membershipNumber}</p>
            </div>
          </div>

          {result.sponsor && (
            <p className="text-sm text-gray-600">
              Belongs to <span className="font-semibold text-gray-900">{result.sponsor.fullName}</span>{' '}
              ({result.sponsor.membershipNumber}).
            </p>
          )}

          {!result.canCheckIn ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <XCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">{result.reason}</p>
            </div>
          ) : result.member.activeVisit ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Already checked in since{' '}
              {new Date(result.member.activeVisit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
            </div>
          ) : !result.member.hasEmail ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              This person has no email address on file, so a PIN cannot be sent. Add their email to their record first.
            </div>
          ) : !pinSent ? (
            <>
              <p className="text-sm text-gray-600">
                A 4-digit PIN is sent to their own email. They read it out, and you enter it here.
              </p>
              <button onClick={handleSendPin} disabled={isSendingPin} className={primaryButton}>
                {isSendingPin ? 'Sending…' : 'Send PIN to their email'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">Ask them for the PIN that was just emailed.</p>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="4-digit PIN"
                className={`${inputClass} text-center text-xl tracking-[0.5em] font-mono`}
              />
              <button onClick={handleCheckIn} disabled={isCheckingIn || pin.length !== 4} className={primaryButton}>
                {isCheckingIn ? 'Checking in…' : 'Authorize & check in'}
              </button>
              <button
                onClick={handleSendPin}
                disabled={isSendingPin}
                className="w-full text-xs font-semibold text-gray-500 hover:text-[#05431E]"
              >
                {isSendingPin ? 'Sending…' : 'Send a new PIN'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
