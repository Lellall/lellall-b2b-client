import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Receipt as Btn } from 'iconsax-react';

interface PreReceiptProps {
  order: { [key: string]: { quantity: number; name: string } };
  subdomain: string;
  tableNumber: string;
  specialNote?: string;
}

const PreReceipt: React.FC<PreReceiptProps> = ({ order, subdomain, tableNumber, specialNote }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: componentRef });

  return (
    <div>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <button
        onClick={reactToPrintFn}
        className="flex text-[10px] sm:text-xs text-[#05431E] hover:underline focus:outline-none no-print"
      >
        <Btn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Print Pre-Receipt
      </button>
      <div
        ref={componentRef}
        className="invisible h-0 w-0 overflow-hidden print:visible print:h-auto print:w-full"
      >
        <div className="w-full p-3 bg-white font-sans text-xs leading-tight">
          <div className="text-center mb-4">
            <div className="inline-block">
              <h1 className="text-[30px] font-extrabold tracking-widest leading-tight" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                {subdomain}
              </h1>
            </div>
          </div>
          <div className="mb-2">
            <p>
              <span className="font-semibold">Date:</span> {new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            {specialNote && (
              <p>
                <span className="font-semibold">Special Note:</span> {specialNote}
              </p>
            )}
          </div>
          <hr className="border-gray-300 my-1" />
          <table className="w-full border-collapse mb-2 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left">Item</th>
                <th className="p-1 text-left">Qty</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(order).map(([id, { name, quantity }]) => (
                <tr key={id} className="border-b border-gray-200">
                  <td className="p-1 truncate">{name}</td>
                  <td className="p-1">{quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-gray-300 my-1" />
          <div className="text-left">
            <p className="mt-1">Thank you for dining with us!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreReceipt;