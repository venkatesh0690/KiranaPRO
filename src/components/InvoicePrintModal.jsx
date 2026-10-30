import { Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatInvoiceData } from '../utils/b2bWholesale';

export default function InvoicePrintModal({ order, customer, onClose }) {
  const invoice = formatInvoiceData({ order, customer });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Top Bar */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--brand-primary, #1E3A2B)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '800' }}>
            Tax Invoice & Statement • #{invoice.invoiceNumber}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#FFF',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Printer size={14} /> Print Bill
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="kp-printable-invoice" style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#0F172A'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--brand-primary, #1E3A2B)' }}>
                KiranaPRO
              </h2>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                Visakhapatnam Direct Mandi & Hyperlocal Network
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                GSTIN: {invoice.gstin}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>TAX INVOICE</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Date: {invoice.date}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#047857' }}>
                {invoice.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px' }}>
            <div style={{ fontWeight: '700', color: '#334155', marginBottom: '2px' }}>
              DELIVERY RECIPIENT:
            </div>
            <div><strong>{invoice.customerName}</strong> ({invoice.customerPhone})</div>
            <div style={{ color: '#475569' }}>{invoice.deliveryAddress}</div>
            <div style={{ marginTop: '4px', color: '#047857', fontWeight: '600' }}>
              Verified 4-Digit Delivery PIN: {invoice.deliveryPin}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #CBD5E1', textAlign: 'left', color: '#64748B', fontSize: '11px' }}>
                <th style={{ padding: '6px 0' }}>Item Description</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '6px 0', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>
                    {item.name}
                    {item.unit && <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '4px' }}>({item.unit})</span>}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '700' }}>
                    ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bill Totals */}
          <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Items Subtotal</span>
              <span style={{ fontWeight: '600' }}>₹{invoice.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Estimated GST (5%)</span>
              <span style={{ fontWeight: '600' }}>₹{invoice.gst}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Hyperlocal Delivery Fee</span>
              <span style={{ fontWeight: '600' }}>₹{invoice.delivery}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Handling & Safety Pack</span>
              <span style={{ fontWeight: '600' }}>₹{invoice.handling}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16A34A' }}>
                <span>Coupon & Parivaar Discount</span>
                <span style={{ fontWeight: '700' }}>-₹{invoice.discount}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #0F172A',
              paddingTop: '8px',
              marginTop: '6px',
              fontSize: '15px',
              fontWeight: '900',
              color: 'var(--brand-primary, #1E3A2B)'
            }}>
              <span>Total Paid via {invoice.paymentMethod}</span>
              <span>₹{invoice.total}</span>
            </div>
          </div>

          {/* Freshness & Trust Guarantee Seal */}
          <div style={{
            marginTop: '20px',
            padding: '10px 12px',
            background: 'var(--bg-subtle, #EEF2EB)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--brand-primary, #1E3A2B)'
          }}>
            <ShieldCheck size={18} />
            <span>
              <strong>2-Hour Freshness Guarantee:</strong> 100% verified doorstep inspection.
              Report any issue within 2 hours for instant replacement or refund.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
