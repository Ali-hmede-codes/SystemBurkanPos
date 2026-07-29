import { useSettings } from '../context/SettingsContext';

const PAPER_STYLES = {
  a4: { width: '210mm', minHeight: '297mm', padding: '20mm' },
  a5: { width: '148mm', minHeight: '210mm', padding: '15mm' },
  thermal80: { width: '80mm', minHeight: 'auto', padding: '5mm' },
  thermal58: { width: '58mm', minHeight: 'auto', padding: '3mm' },
};

export default function PrintBill({ bill, onClose }) {
  const { t, paperSize, isRTL } = useSettings();
  const style = PAPER_STYLES[paperSize] || PAPER_STYLES.a4;
  const isThermal = paperSize.startsWith('thermal');

  const handlePrint = () => {
    window.print();
  };

  if (!bill) return null;

  return (
    <div className="print-overlay">
      <div className="print-controls no-print">
        <button className="btn-primary" onClick={handlePrint}>{t.saveBill} & Print</button>
        <button className="btn-secondary" onClick={onClose}>{t.close}</button>
      </div>

      <div
        className="print-page"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ width: style.width, minHeight: style.minHeight, padding: style.padding }}
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
