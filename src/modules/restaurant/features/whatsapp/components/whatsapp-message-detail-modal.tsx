import React from 'react';
import { X, Phone, Calendar, CheckCircle2, XCircle, Clock, Package, AlertCircle } from 'lucide-react';
import { useGetWhatsAppMessageByIdQuery } from '@/redux/api/whatsapp/whatsapp.api';
import Modal from '@/components/modal/modal';
import { ColorRing } from 'react-loader-spinner';

interface WhatsAppMessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  restaurantId: string;
}

const WhatsAppMessageDetailModal: React.FC<WhatsAppMessageDetailModalProps> = ({
  isOpen,
  onClose,
  messageId,
  restaurantId,
}) => {
  const { data: message, isLoading, error } = useGetWhatsAppMessageByIdQuery(
    { messageId, restaurantId },
    { skip: !isOpen || !messageId || !restaurantId }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Processed
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Failed
          </span>
        );
      case 'received':
        return (
          <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Received
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSupplyRequestStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
      FULFILLED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    };

    const colors = statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text} rounded-full`}>
        {status}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <ColorRing
              height="80"
              width="80"
              radius="9"
              color="#05431E"
              ariaLabel="loading"
              visible={true}
            />
          </div>
        ) : error || !message ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load message details</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Message Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Message Info */}
            <div className="space-y-6">
              {/* Sender Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Sender Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#05431E] rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">
                      {message.fromName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" />
                      {message.fromPhoneNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Message Content</h3>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#05431E]">
                  <p className="text-gray-900 whitespace-pre-wrap">{message.messageText}</p>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  {getStatusBadge(message.status)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Received</h3>
                  <div className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                {message.processedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Processed</h3>
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(message.processedAt)}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {message.status === 'failed' && message.errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Processing Error</h4>
                      <p className="text-sm text-red-700 mt-1">{message.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Supply Requests */}
              {message.supplyRequests && message.supplyRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Supply Requests ({message.supplyRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {message.supplyRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#05431E] transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {request.productName}
                              </h4>
                              {getSupplyRequestStatusBadge(request.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                Quantity: <span className="font-medium">{request.quantity}</span>
                                {request.unitOfMeasurement && (
                                  <span className="text-gray-500"> {request.unitOfMeasurement}</span>
                                )}
                              </div>
                              {request.vendor && (
                                <div>
                                  Vendor: <span className="font-medium">{request.vendor.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!message.supplyRequests || message.supplyRequests.length === 0) &&
                message.status === 'processed' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-sm text-yellow-700">
                      No supply requests were created from this message.
                    </p>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WhatsAppMessageDetailModal;



