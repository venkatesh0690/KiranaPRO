import { useState } from 'react';
import { Send, MessageCircle, X, Shield, Phone } from 'lucide-react';
import { QUICK_CHAT_PILLS } from '../utils/orderChatAndSLA';

export default function OrderChatDrawer({ order, role = 'customer', onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'rider',
      senderName: 'K. Shiva Kumar (Delivery Partner)',
      text: 'Picking fresh items at Mandi now 🌾 (మండీలో తాజా సరుకు తీసుకుంటున్నాను)',
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const pills = QUICK_CHAT_PILLS[role] || QUICK_CHAT_PILLS.customer;

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: role,
      senderName: role === 'customer' ? 'You' : 'Delivery Partner',
      text,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate auto-reply if customer sends a message
    if (role === 'customer') {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'rider',
            senderName: 'K. Shiva Kumar',
            text: 'Got it! Reaching your gate soon. Have your 4-digit PIN ready.',
            time: 'Just now'
          }
        ]);
      }, 1500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-surface, #FFFFFF)',
        width: '100%',
        maxWidth: '500px',
        height: '75vh',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--brand-primary, #1E3A2B)',
          color: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} color="#A7F3D0" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Order #{order?.id || 'KP-1042'} Coordination Chat
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
              Rider: K. Shiva Kumar • 4-Digit PIN required at door
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="tel:+919848022338"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFF',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <Phone size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#64748B', padding: '3px 8px', borderRadius: '12px' }}>
              🔒 Messages are protected & visible only to your rider and Visakhapatnam Dispatch
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === role;
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: isMe ? 'var(--brand-primary, #1E3A2B)' : '#F1F5F9',
                  color: isMe ? '#FFFFFF' : '#1E293B',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: isMe ? '16px' : '4px'
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#047857', marginBottom: '2px' }}>
                    {msg.senderName}
                  </div>
                )}
                <div style={{ fontSize: '13px', lineHeight: '1.45' }}>{msg.text}</div>
                <div style={{ fontSize: '9px', opacity: 0.7, textAlign: 'right', marginTop: '3px' }}>
                  {msg.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bilingual Quick-Reply Pills */}
        <div style={{ padding: '8px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', overflowX: 'auto', display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
          {pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleSend(`${pill.en} (${pill.te})`)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {pill.en}
            </button>
          ))}
        </div>

        {/* Custom Input Box */}
        <div style={{ padding: '12px 16px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type a message or delivery instruction…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              border: '1px solid #CBD5E1',
              borderRadius: '24px',
              background: '#F8FAFC'
            }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            style={{
              background: 'var(--brand-primary, #1E3A2B)',
              color: '#FFF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
