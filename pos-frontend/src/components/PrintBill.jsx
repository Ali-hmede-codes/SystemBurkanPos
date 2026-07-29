import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const PAPER_SIZES = {
  a4: { width: '210mm', height: '297mm', padding: '20mm', autoHeight: false },
  a5: { width: '148mm', height: '210mm', padding: '15mm', autoHeight: false },
  thermal80: { width: '80mm', height: 'auto', padding: '5mm', autoHeight: true },
  thermal58: { width: '58mm', height: 'auto', padding: '3mm', autoHeight: true },
};

export default function PrintBill({ bill, onClose }) {
  const { t, paperSize, customSize, isRTL } = useSettings();

  const getPageDimensions = () => {
    if (paperSize === 'custom') {
      return {
        width: `${customSize.width}${customSize.unit}`,
        height: `${customSize.height}${customSize.unit}`,
        padding: '5mm',
        autoHeight: true, // custom always grows with content
      };
    }
    return PAPER_SIZES[paperSize] || PAPER_SIZES.a4;
  };

  const dims = getPageDimensions();
  const isThermal = paperSize.startsWith('thermal') || (paperSize === 'custom' && parseInt(customSize.width) <= 80);

  // Inject @page CSS rule for auto paper size when printing
  useEffect(() => {
    const styleId = 'print-page-size-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const pageWidth = dims.width;
    const pageHeight = dims.autoHeight ? 'auto' : dims.height;
    // For auto-height: only set width so paper grows with content
    const sizeValue = pageHeight === 'auto' ? `${pageWidth}` : `${pageWidth} ${pageHeight}`;

    styleEl.textContent = `
      @page {
        size: ${sizeValue};
        margin: 0;
      }
      @media print {
        .print-page {
          width: ${pageWidth} !important;
          min-height: auto !important;
          height: auto !important;
          padding: ${dims.padding} !important;
          page-break-inside: avoid;
        }
      }
    `;

    return () => {
      if (styleEl) styleEl.remove();
    };
  }, [dims]);

  const handlePrint = () => {
    window.print();
  };

  if (!bill) return null;

  return (
    <div className="print-overlay">
      <div className="print-controls no-print">
        <button className="btn-primary" onClick={handlePrint}>🖨️ Print</button>
        <button className="btn-secondary" onClick={onClose}>{t.close}</button>
      </div>

      <div
        className="print-page"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ width: dims.width, minHeight: dims.autoHeight ? 'auto' : dims.height, padding: dims.padding }}
      >
        {/* Header */}
        <div className="print-header">
          <h2 style={{ fontSize: isThermal ? '14px' : '20px', marginBottom: '4px' }}>
            {bill.store_name}
          </h2>
          {bill.store_location && <p style={{ fontSize: isThermal ? '10px' : '12px' }}>{bill.store_location}</p>}
          {bill.store_phone && <p style={{ fontSize: isThermal ? '10px' : '12px' }}>{bill.store_phone}</p>}
          <div className="print-divider" />
          <p style={{ fontSize: isThermal ? '11px' : '14px', fontWeight: 'bold' }}>
            {t.bill} #{bill.id}
          </p>
          <p style={{ fontSize: isThermal ? '9px' : '11px', color: '#666' }}>
            {new Date(bill.created_at).toLocaleString()}
          </p>
        </div>

        <div className="print-divider" />

        {/* Customer Info */}
        <div className="print-customer" style={{ fontSize: isThermal ? '11px' : '13px' }}>
          <p><strong>{t.customerName}:</strong> {bill.customer_name}</p>
          {bill.customer_phone && <p><strong>{t.phone}:</strong> {bill.customer_phone}</p>}
          {bill.customer_address && <p><strong>{t.address}:</strong> {bill.customer_address}</p>}
        </div>

        <div className="print-divider" />

        {/* Items */}
        <table className="print-table" style={{ fontSize: isThermal ? '10px' : '12px' }}>
          <thead>
            <tr>
              <th>{t.product}</th>
              <th>{t.price}</th>
              <th>{t.qty}</th>
              <th>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.map((item, i) => (
              <tr key={i}>
                <td>{item.product_name}</td>
                <td>{Number(item.product_price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-divider" />

        {/* Totals */}
        <div className="print-totals" style={{ fontSize: isThermal ? '11px' : '13px' }}>
          <div className="print-total-row">
            <span>{t.subtotal}:</span>
            <span>{Number(bill.subtotal).toFixed(2)}</span>
          </div>
          <div className="print-total-row">
            <span>{t.delivery}:</span>
            <span>{Number(bill.delivery_cost).toFixed(2)}</span>
          </div>
          <div className="print-total-row print-grand-total" style={{ fontSize: isThermal ? '14px' : '16px' }}>
            <span>{t.total}:</span>
            <span>{Number(bill.total).toFixed(2)}</span>
          </div>
        </div>

        {bill.notes && (
          <>
            <div className="print-divider" />
            <p style={{ fontSize: isThermal ? '9px' : '11px', color: '#666' }}>{t.notes}: {bill.notes}</p>
          </>
        )}

        <div className="print-divider" />
        <p className="print-footer" style={{ fontSize: isThermal ? '9px' : '11px' }}>
          Thank you! / شكراً لك
        </p>
      </div>
    </div>
  );
}
