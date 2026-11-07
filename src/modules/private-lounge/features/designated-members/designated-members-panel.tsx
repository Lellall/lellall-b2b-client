import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocumentDownload, DocumentUpload, Profile2User, UserAdd } from 'iconsax-react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomAxios from '../../../../redux/api/customAxios';
import {
  DesignatedMember,
  ImportPreview,
  useAddDesignatedMemberMutation,
  useGetDesignatedMembersQuery,
  useImportDesignatedMembersMutation,
  useRemoveDesignatedMemberMutation,
} from '../../../../redux/api/private-lounge/designated-members.api';

interface DesignatedMembersPanelProps {
  membershipId: string;
}

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/30 focus:border-[#05431E]';

export const DesignatedMembersPanel: React.FC<DesignatedMembersPanelProps> = ({ membershipId }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useGetDesignatedMembersQuery(membershipId);
  const [importMembers, { isLoading: isImporting }] = useImportDesignatedMembersMutation();
  const [addMember, { isLoading: isAdding }] = useAddDesignatedMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveDesignatedMemberMutation();

  const [downloading, setDownloading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [showAddOne, setShowAddOne] = useState(false);
  const [toRemove, setToRemove] = useState<DesignatedMember | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '' });

  const summary = data?.summary;
  const isFull = !!summary && summary.remaining === 0;

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const response = await CustomAxios.get(`/private-lounge/admin/members/${membershipId}/designated-members/template`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'designated-members-template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the template');
    } finally {
      setDownloading(false);
    }
  };

  // Step one: check the file and show what would happen. Nothing is saved yet.
  const handleFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // so choosing the same file again still triggers
    if (!file) return;
    try {
      const result = await importMembers({ membershipId, file, confirm: false }).unwrap();
      setPendingFile(file);
      setPreview(result);
    } catch (error: any) {
      toast.error(error?.message || 'Could not read this file');
    }
  };

  // Step two: save the valid rows
  const handleConfirm = async () => {
    if (!pendingFile) return;
    try {
      const result = await importMembers({ membershipId, file: pendingFile, confirm: true }).unwrap();
      toast.success(`${result.created.length} designated ${result.created.length === 1 ? 'member' : 'members'} added`);
      setPreview(null);
      setPendingFile(null);
    } catch (error: any) {
      toast.error(error?.message || 'Could not add these people');
    }
  };

  const handleAddOne = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const made = await addMember({
        membershipId,
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          position: form.position.trim() || undefined,
        },
      }).unwrap();
      toast.success(`${made.fullName} added as ${made.membershipNumber}`);
      setForm({ name: '', email: '', phone: '', position: '' });
      setShowAddOne(false);
    } catch (error: any) {
      toast.error(error?.message || 'Could not add this person');
    }
  };

  const handleRemove = async () => {
    if (!toRemove) return;
    try {
      await removeMember({ membershipId, memberId: toRemove.id }).unwrap();
      toast.success(`${toRemove.fullName} has been removed`);
      setToRemove(null);
    } catch (error: any) {
      toast.error(error?.message || 'Could not remove this person');
      setToRemove(null);
    }
  };

  const closePreview = () => {
    setPreview(null);
    setPendingFile(null);
  };

  const secondaryButton =
    'flex-1 py-2.5 rounded-xl text-sm font-bold text-[#05431E] bg-green-50 hover:bg-green-100 border border-green-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
        <Profile2User size="14" /> Designated Members
      </h3>

      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {summary && (
        <div className="space-y-4">
          <div>
            <div className="flex items-end justify-between mb-2">
              <p className="text-3xl font-bold text-gray-900">
                {summary.added} <span className="text-base font-semibold text-gray-400">of {summary.limit}</span>
              </p>
              <p className="text-sm text-gray-500">{summary.remaining} places left</p>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#05431E] rounded-full transition-all" style={{ width: `${(summary.added / summary.limit) * 100}%` }} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownloadTemplate} disabled={downloading} className={secondaryButton}>
              <DocumentDownload size="16" variant="Bulk" /> {downloading ? 'Preparing…' : 'Download template'}
            </button>
            <button onClick={() => fileInput.current?.click()} disabled={isImporting || isFull} className={secondaryButton}>
              <DocumentUpload size="16" variant="Bulk" /> {isImporting && !preview ? 'Checking…' : 'Upload list'}
            </button>
            <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChosen} />
          </div>

          <p className="text-xs text-gray-400">
            Fill in the template, one person per row, with their own email. Their check-in code is sent to that email.
            In Excel, save the file as CSV before uploading it.
          </p>

          {isFull ? (
            <p className="text-sm font-semibold text-amber-700">All {summary.limit} places are used. Remove someone to add another person.</p>
          ) : showAddOne ? (
            <form onSubmit={handleAddOne} className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={inputClass} required />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} required />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className={inputClass} />
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Job title (optional)" className={inputClass} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddOne(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] disabled:opacity-60">
                  {isAdding ? 'Adding…' : 'Add person'}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddOne(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#05431E] hover:underline">
              <UserAdd size="16" /> Add one person
            </button>
          )}

          {data.members.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
              {data.members.map((member) => (
                <div key={member.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-gray-500">{member.membershipNumber}</span>
                    <button
                      onClick={() => setToRemove(member)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asking first: removing someone ends their access */}
      {toRemove && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setToRemove(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] px-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Remove {toRemove.fullName}?</h2>
              <p className="text-sm text-gray-600 mb-5">
                They will no longer be able to check in, and their place becomes free for someone else. You can add them
                again later if you need to.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setToRemove(null)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Keep
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md disabled:opacity-60"
                >
                  {isRemoving ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}

      {/* What the upload would do, before anything is saved */}
      {/* Drawn on the page itself: the record panel it sits in is transformed, which would trap a fixed window inside it */}
      {preview && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={closePreview} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[70] px-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Check the list</h2>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-green-700">{preview.summary.valid} ready to add</span>
                    {preview.summary.invalid > 0 && (
                      <>, <span className="font-semibold text-red-600">{preview.summary.invalid} with problems</span> (these are skipped)</>
                    )}
                  </p>
                </div>
                <button onClick={closePreview} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700" aria-label="Cancel">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50 mb-4">
                {preview.rows.map((row) => (
                  <div key={row.line} className={`px-4 py-2.5 flex items-start gap-3 ${row.errors.length ? 'bg-red-50/60' : ''}`}>
                    <span className="text-xs text-gray-400 w-10 shrink-0 pt-0.5">Row {row.line}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.name || '(no name)'}</p>
                      <p className="text-xs text-gray-500 truncate">{row.email || '(no email)'}</p>
                      {row.errors.map((problem) => (
                        <p key={problem} className="text-xs font-semibold text-red-600">{problem}</p>
                      ))}
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${row.errors.length ? 'text-red-600' : 'text-green-700'}`}>
                      {row.errors.length ? 'Skipped' : 'Ready'}
                    </span>
                  </div>
                ))}
              </div>

              {preview.summary.invalid > 0 && preview.summary.valid > 0 && (
                <p className="text-xs text-gray-500 mb-3">
                  You can add the ready people now and upload the skipped ones later once fixed, or cancel, fix the file and upload it again.
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={closePreview} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isImporting || preview.summary.valid === 0}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Adding…' : `Add ${preview.summary.valid} designated ${preview.summary.valid === 1 ? 'member' : 'members'}`}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
};
