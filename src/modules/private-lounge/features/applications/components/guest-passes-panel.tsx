import React, { useState } from 'react';
import { DocumentDownload, Ticket } from 'iconsax-react';
import { toast } from 'react-toastify';
import CustomAxios from '../../../../../redux/api/customAxios';
import {
  useGetGuestPassesQuery,
  useIssueGuestPassesMutation,
} from '../../../../../redux/api/private-lounge/applications.api';

interface GuestPassesPanelProps {
  application: any;
}

export const GuestPassesPanel: React.FC<GuestPassesPanelProps> = ({ application }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const isPending = application.status === 'PENDING';
  const { data, isLoading } = useGetGuestPassesQuery(application.id, { skip: isPending });
  const [issuePasses, { isLoading: isIssuing }] = useIssueGuestPassesMutation();

  const summary = data?.summary;
  const hasPasses = !!summary && summary.total > 0;

  const handleIssue = async () => {
    try {
      await issuePasses(application.id).unwrap();
      toast.success('Pass codes created');
    } catch (error: any) {
      toast.error(error?.message || 'Could not create the pass codes');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await CustomAxios.get(`/private-lounge/admin/members/${application.id}/passes/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `guest-passes-${application.membershipNumber ?? application.id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Could not download the pass codes');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
        <Ticket size="14" /> One-Time Guest Passes
      </h3>

      {isPending && (
        <p className="text-sm text-gray-500 italic">
          The pass codes are created when you approve this application.
        </p>
      )}

      {!isPending && isLoading && <p className="text-sm text-gray-400">Loading pass codes…</p>}

      {!isPending && !isLoading && !hasPasses && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">No pass codes have been created for this member yet.</p>
          <button
            onClick={handleIssue}
            disabled={isIssuing}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isIssuing ? 'Creating…' : 'Create 100 pass codes'}
          </button>
        </div>
      )}

      {!isPending && hasPasses && (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{summary.remaining}</p>
              <p className="text-xs text-gray-400">passes left</p>
            </div>
            <p className="text-sm text-gray-500">
              {summary.used} of {summary.total} used
            </p>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#05431E] rounded-full transition-all"
              style={{ width: `${(summary.used / summary.total) * 100}%` }}
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3 rounded-xl text-sm font-bold text-[#05431E] bg-green-50 hover:bg-green-100 transition-colors border border-green-100 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <DocumentDownload size="18" variant="Bulk" />
            {isDownloading ? 'Preparing…' : 'Download pass codes'}
          </button>
          <p className="text-xs text-gray-400">
            Each code works once. As a guest uses one, it is cancelled and the count above goes down. Codes only
            start working when the membership is active.
          </p>
        </div>
      )}
    </div>
  );
};
