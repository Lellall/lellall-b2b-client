import React, { useRef, useState } from 'react';
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
  const [bgColor, setBgColor] = useState('#ffffff'); // Default white background

  const reactToPrintFn = useReactToPrint({ contentRef: componentRef });

  // Calculate luminance to determine if the background is light or dark
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // Determine font color based on background luminance
  const fontColor = getLuminance(bgColor) > 0.5 ? '#000000' : '#ffffff';

  return (
    <div>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            @page {
              margin: 0;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print-container {
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box;
              overflow: hidden;
            }
          }
        `}
      </style>
      <div className="flex items-center gap-2 no-print">
        <button
          onClick={reactToPrintFn}
          className="flex text-[10px] sm:text-xs text-[#05431E] hover:underline focus:outline-none"
        >
          <Btn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Print Pre-Receipt
        </button>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-8 h-8 border-none cursor-pointer"
          title="Choose background color"
        />
      </div>
      <div
        ref={componentRef}
        className="invisible h-0 w-0 overflow-hidden print:visible print:h-auto print:w-full print-container"
        style={{ backgroundColor: bgColor, color: fontColor }}
      >
        <div className="min-h-[100vh] w-full p-3 font-sans text-xs leading-tight box-border relative">
          {/* Background watermark for 355 */}
          {subdomain === "355" && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ 
                opacity: 0.08,
                zIndex: 0,
                fontSize: '120px',
                fontWeight: '900',
                color: '#ff6b35',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '10px'
              }}
            >
              @10
            </div>
          )}
          <div className="relative z-10">
          <div className="text-center mb-4">
            <div className="inline-block">
              <h1 className="text-[30px] font-extrabold tracking-widest leading-tight" style={{ fontFamily: 'Arial, sans-serif', color: fontColor }}>
                {subdomain} {subdomain === '355' ? 'Steakhouse' : ''}
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
          <hr className="border-gray-300 my-1" style={{ borderColor: fontColor }} />
          <table className="w-full border-collapse mb-2 text-xs">
            <thead>
              <tr className="bg-gray-100" style={{ backgroundColor: getLuminance(bgColor) > 0.5 ? '#e5e7eb' : '#4b5563', color: fontColor }}>
                <th className="p-1 text-left">Item</th>
                <th className="p-1 text-left">Qty</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(order).map(([id, { name, quantity }]) => (
                <tr key={id} className="border-b border-gray-200" style={{ borderColor: fontColor }}>
                  <td className="p-1 truncate">{name}</td>
                  <td className="p-1">{quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-gray-300 my-1" style={{ borderColor: fontColor }} />
          <div className="text-left">
            {subdomain === "355" ? (
              <div className="text-right" style={{ marginTop: '-10px' }}>
                <p className="font-bold text-sm" style={{ color: '#ff6b35', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', fontWeight: '800' }}>
                  🎉 Thank you for dining with us! 🎉
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: '#2d3748', letterSpacing: '2px', fontWeight: '700' }}>
                  ✨ 355 @ 10: ✨
                </p>
                <p className="text-xs font-medium italic" style={{ color: '#1a365d', lineHeight: '1.3', fontWeight: '600' }}>
                  Your patronage for the past 10 years<br/>
                  is well celebrated thanks! 🏆
                </p>
              </div>
            ) : (
              <p className="mt-1">Thank you for dining with us!</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreReceipt;