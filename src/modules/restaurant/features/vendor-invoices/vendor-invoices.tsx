import React, { useState, useMemo } from 'react';
import { Search, Upload, FileText, Download, Eye, CheckCircle2, XCircle, Clock, AlertCircle, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useGetVendorInvoicesQuery,
  useGetPaidInvoicesQuery,
  VendorInvoice,
  PaidInvoice,
} from '@/redux/api/vendor-invoices/vendor-invoices.api';
import { ColorRing } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import UploadVendorInvoiceModal from './components/upload-vendor-invoice-modal';
import GeneratePaidInvoiceModal from './components/generate-paid-invoice-modal';
import VendorInvoiceDetailsModal from './components/vendor-invoice-details-modal';
import PaidInvoiceDetailsModal from './components/paid-invoice-details-modal';
import VerifyInvoiceModal from './components/verify-invoice-modal';
import MarkPaidModal from './components/mark-paid-modal';

const VendorInvoices: React.FC = () => {
  const { subdomain } = useSelector(selectAuth);
  const { canCreate, canUpdate } = usePermissions();
  const [activeTab, setActiveTab] = useState<'vendor' | 'paid'>('vendor');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | PaidInvoice | null>(null);

  // Vendor Invoices Query
  const { 
    data: vendorInvoicesData, 
    isLoading: isLoadingVendorInvoices, 
    refetch: refetchVendorInvoices,
    error: vendorInvoicesError,
    isError: isVendorInvoicesError
  } = useGetVendorInvoicesQuery({
    subdomain: subdomain || '',
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    vendorId: vendorFilter !== 'ALL' ? vendorFilter : undefined,
    page: currentPage,
    limit: recordsPerPage,
  }, { skip: !subdomain || activeTab !== 'vendor' });

  // Paid Invoices Query
  const { 
    data: paidInvoicesData, 
    isLoading: isLoadingPaidInvoices, 
    refetch: refetchPaidInvoices,
    error: paidInvoicesError,
    isError: isPaidInvoicesError
  } = useGetPaidInvoicesQuery({
    subdomain: subdomain || '',
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    vendorId: vendorFilter !== 'ALL' ? vendorFilter : undefined,
    page: currentPage,
    limit: recordsPerPage,
  }, { skip: !subdomain || activeTab !== 'paid' });

  // Check for 404 errors (backend endpoints not implemented)
  const is404Error = (isVendorInvoicesError && (vendorInvoicesError as any)?.status === 404) || 
                     (isPaidInvoicesError && (paidInvoicesError as any)?.status === 404);

  const vendorInvoices = vendorInvoicesData?.data || [];
  const paidInvoices = paidInvoicesData?.data || [];

  // Filter invoices by search term
  const filteredVendorInvoices = useMemo(() => {
    if (!searchTerm.trim()) return vendorInvoices;
    const searchLower = searchTerm.toLowerCase();
    return vendorInvoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.vendor?.name?.toLowerCase().includes(searchLower) ||
      invoice.description?.toLowerCase().includes(searchLower)
    );
  }, [vendorInvoices, searchTerm]);

  const filteredPaidInvoices = useMemo(() => {
    if (!searchTerm.trim()) return paidInvoices;
    const searchLower = searchTerm.toLowerCase();
    return paidInvoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.vendor?.name?.toLowerCase().includes(searchLower) ||
      invoice.description?.toLowerCase().includes(searchLower)
    );
  }, [paidInvoices, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <Clock className="w-3 h-3" />,
      },
      RECEIVED: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <FileText className="w-3 h-3" />,
      },
      VERIFIED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      PAID: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="w-3 h-3" />,
      },
      OVERDUE: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: <AlertCircle className="w-3 h-3" />,
      },
      DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: <FileText className="w-3 h-3" />,
      },
      GENERATED: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <FileText className="w-3 h-3" />,
      },
      SENT: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: <FileText className="w-3 h-3" />,
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const handleViewDetails = (invoice: VendorInvoice | PaidInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleVerify = (invoice: VendorInvoice) => {
    setSelectedInvoice(invoice);
    setShowVerifyModal(true);
  };

  const handleMarkPaid = (invoice: VendorInvoice | PaidInvoice) => {
    setSelectedInvoice(invoice);
    setShowMarkPaidModal(true);
  };

  const isLoading = activeTab === 'vendor' ? isLoadingVendorInvoices : isLoadingPaidInvoices;
  const invoices = activeTab === 'vendor' ? filteredVendorInvoices : filteredPaidInvoices;
  const pagination = activeTab === 'vendor' ? vendorInvoicesData?.pagination : paidInvoicesData?.pagination;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          radius="9"
          color="#05431E"
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  // Show message if backend endpoints are not implemented
  if (is404Error) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Backend Endpoints Not Available</strong>
                <br />
                The vendor invoice endpoints have not been implemented on the backend yet. 
                Please contact your administrator to implement the vendor invoice API endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Vendor Invoices</h1>
          <div className="flex gap-2">
            {activeTab === 'vendor' && canCreate && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Invoice
              </button>
            )}
            {activeTab === 'paid' && canCreate && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate Invoice
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('vendor');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'vendor'
                ? 'bg-white border-t border-l border-r border-gray-200 text-[#05431E]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vendor Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab('paid');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'paid'
                ? 'bg-white border-t border-l border-r border-gray-200 text-[#05431E]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paid Invoices
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number, vendor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
          >
            <option value="ALL">All Status</option>
            {activeTab === 'vendor' ? (
              <>
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
                <option value="VERIFIED">Verified</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
                <option value="OVERDUE">Overdue</option>
              </>
            ) : (
              <>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Invoice Number</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No invoices found</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.vendor?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {activeTab === 'vendor' && canUpdate && invoice.status === 'RECEIVED' && (
                          <button
                            onClick={() => handleVerify(invoice as VendorInvoice)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Verify Invoice"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {canUpdate && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleMarkPaid(invoice)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {activeTab === 'vendor' && (invoice as VendorInvoice).fileUrl && (
                          <a
                            href={(invoice as VendorInvoice).fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Download File"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </a>
                        )}
                        {activeTab === 'paid' && (invoice as PaidInvoice).pdfUrl && (
                          <a
                            href={(invoice as PaidInvoice).pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View PDF"
                          >
                            <FileText className="w-4 h-4 text-gray-600" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadVendorInvoiceModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            refetchVendorInvoices();
          }}
        />
      )}

      {showGenerateModal && (
        <GeneratePaidInvoiceModal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false);
            refetchPaidInvoices();
          }}
        />
      )}

      {showDetailsModal && selectedInvoice && (
        activeTab === 'vendor' ? (
          <VendorInvoiceDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedInvoice(null);
              refetchVendorInvoices();
            }}
            invoice={selectedInvoice as VendorInvoice}
            onVerify={() => {
              setShowDetailsModal(false);
              handleVerify(selectedInvoice as VendorInvoice);
            }}
            onMarkPaid={() => {
              setShowDetailsModal(false);
              handleMarkPaid(selectedInvoice);
            }}
          />
        ) : (
          <PaidInvoiceDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedInvoice(null);
              refetchPaidInvoices();
            }}
            invoice={selectedInvoice as PaidInvoice}
            onMarkPaid={() => {
              setShowDetailsModal(false);
              handleMarkPaid(selectedInvoice);
            }}
          />
        )
      )}

      {showVerifyModal && selectedInvoice && (
        <VerifyInvoiceModal
          isOpen={showVerifyModal}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedInvoice(null);
            refetchVendorInvoices();
          }}
          invoice={selectedInvoice as VendorInvoice}
        />
      )}

      {showMarkPaidModal && selectedInvoice && (
        <MarkPaidModal
          isOpen={showMarkPaidModal}
          onClose={() => {
            setShowMarkPaidModal(false);
            setSelectedInvoice(null);
            if (activeTab === 'vendor') {
              refetchVendorInvoices();
            } else {
              refetchPaidInvoices();
            }
          }}
          invoice={selectedInvoice}
          type={activeTab}
        />
      )}
    </div>
  );
};

export default VendorInvoices;

