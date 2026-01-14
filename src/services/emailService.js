/**
 * Email Service
 * Handles sending order confirmations and status updates via EmailJS with premium HTML receipts.
 */
import emailjs from '@emailjs/browser';

// ==============================================================================
// 🔐 API CONFIGURATION
// ==============================================================================
const SERVICE_ID = 'service_u8mn135';   // User provided key
const TEMPLATE_ID = 'template_u4ogi26'; // User provided key
const PUBLIC_KEY = 'hgE9GSenQhejgckwl';   // User provided key

const CURRENCY_SYMBOLS = {
  USD: '$',
  PKR: 'Rs ',
  AED: 'AED '
};

/**
 * Formats currency values based on the order's local state
 */
const formatCurrency = (amount, currency, rate) => {
  const cur = currency || 'USD';
  const r = rate || 1;
  const symbol = CURRENCY_SYMBOLS[cur] || '$';

  const converted = (amount || 0) * r;
  const decimals = cur === 'PKR' ? 0 : 2;

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

// Simple in-memory cache to prevent duplicate emails for the same order/status within a short window (10s)
const emailCache = new Set();
const DEDUPE_WINDOW = 10000;

const isDuplicateEmail = (orderId, status = 'confirmation') => {
  const key = `${orderId}-${status}`;
  if (emailCache.has(key)) return true;

  emailCache.add(key);
  setTimeout(() => emailCache.delete(key), DEDUPE_WINDOW);
  return false;
};

/**
 * The ULTIMATE Premium Receipt Generator
 */
const generateFullEmailHTML = (order) => {
  const items = order.items || [];
  const customer = order.customer || { name: 'Valued Customer' };
  const rawId = order.orderId || order.id || order._id || 'PENDING';
  let orderId = 'PENDING';
  if (rawId !== 'PENDING') {
    if (order.orderId) {
      orderId = order.orderId;
    } else {
      // Deterministic numeric hash fallback
      const hexPart = rawId.toString().slice(-8);
      orderId = (parseInt(hexPart, 16) % 90000000 + 10000000).toString();
    }
  }

  const itemRows = items.map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 15px 0; width: 64px;">
        <img src="${item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80'}" alt="${item.name || 'Product'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(0,242,255,0.25); display: block; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
      </td>
      <td style="padding: 15px 15px; text-align: left;">
        <div style="font-weight: 800; font-size: 15px; color: #ffffff; margin-bottom: 4px; line-height: 1.2; letter-spacing: -0.01em;">${item.name || 'Tech Gear'}</div>
        <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Qty: ${item.quantity || 1} &bull; ${formatCurrency(item.price || 0, order.currency, order.exchangeRate)}</div>
      </td>
      <td style="padding: 15px 0; text-align: right; vertical-align: middle;">
        <div style="font-weight: 900; font-size: 16px; color: #00f2ff;">${formatCurrency((item.price || 0) * (item.quantity || 1), order.currency, order.exchangeRate)}</div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="margin: 0; padding: 0; width: 100%; background-color: #050505; font-family: 'Inter', -apple-system, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 30px auto; background-color: #0d1117; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 120px rgba(0,0,0,0.8);">
        <tr>
          <td align="center" style="background: linear-gradient(135deg, #00f2ff 0%, #7000ff 100%); padding: 45px 30px; position: relative;">
            <div style="background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); display: inline-block; padding: 8px 20px; border-radius: 100px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">
               <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</span>
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 6px; line-height: 1; font-style: italic; text-shadow: 0 8px 20px rgba(0,0,0,0.4);">NEON MARKET</h1>
            <p style="margin: 12px 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.5px;">Thanks for your gear, ${customer.name.split(' ')[0]}!</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <table width="100%" style="background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 30px;">
              <tr>
                <td style="padding: 20px; width: 50%; border-right: 1px solid rgba(255,255,255,0.06);">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Ref Number</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 900; color: #00f2ff; font-family: monospace;">#${orderId}</p>
                </td>
                <td style="padding: 20px; width: 50%;">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Total Paid</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 900; color: #ffffff;">${formatCurrency(order.total || 0, order.currency, order.exchangeRate)}</p>
                </td>
              </tr>
            </table>
            <table width="100%" style="border-collapse: collapse;">
              <tr>
                <td colspan="3" style="padding-bottom: 15px; border-bottom: 2px solid #00f2ff;">
                  <span style="font-size: 12px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">Manifest</span>
                </td>
              </tr>
              ${itemRows}
            </table>
            <table width="100%" style="margin-top: 30px; background: rgba(0,242,255,0.03); border-radius: 16px; border: 1px solid rgba(0,242,255,0.1);">
              <tr>
                <td style="padding: 20px; text-align: left;">
                  <span style="font-size: 15px; font-weight: 800; color: #ffffff;">Final Amount</span>
                </td>
                <td style="padding: 20px; text-align: right;">
                  <span style="font-size: 22px; font-weight: 950; color: #00f2ff;">${formatCurrency(order.total || 0, order.currency, order.exchangeRate)}</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 40px; text-align: center;">
              <a href="${window.location.origin}/track?id=${orderId}" style="display: block; padding: 18px; background: linear-gradient(90deg, #00f2ff, #7000ff); color: #000000; text-decoration: none; border-radius: 16px; font-weight: 950; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 15px 30px rgba(0,242,255,0.2); margin-bottom: 15px;">Track Shipment</a>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" style="background-color: #050505; padding: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="margin: 0; font-size: 10px; color: #4c566a; line-height: 1.5;">NeonMarket Hub v2.1 • Automated Manifest</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * The Comprehensive Status Generator
 */
const generateStatusEmailHTML = (order, status) => {
  const items = order.items || [];
  const customer = order.customer || { name: 'Valued Customer' };
  const rawId = order.orderId || order.id || order._id || 'PENDING';
  let displayId = 'PENDING';
  if (rawId !== 'PENDING') {
    if (order.orderId) {
      displayId = order.orderId;
    } else {
      const hexPart = rawId.toString().slice(-8);
      displayId = (parseInt(hexPart, 16) % 90000000 + 10000000).toString();
    }
  }
  const orderId = rawId; // Keep rawId for links

  const itemRows = items.map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 15px 0; width: 64px;">
        <img src="${item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80'}" alt="${item.name || 'Product'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); display: block;">
      </td>
      <td style="padding: 15px 15px; text-align: left;">
        <div style="font-weight: 800; font-size: 15px; color: #ffffff; margin-bottom: 4px; line-height: 1.2;">${item.name || 'Tech Gear'}</div>
        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;">Qty: ${item.quantity || 1}</div>
      </td>
      <td style="padding: 15px 0; text-align: right; vertical-align: middle;">
        <div style="font-weight: 900; font-size: 16px; color: #ffffff;">${formatCurrency((item.price || 0) * (item.quantity || 1), order.currency, order.exchangeRate)}</div>
      </td>
    </tr>
  `).join('');

  const themes = {
    processing: { gradient: 'linear-gradient(135deg, #00f2ff 0%, #0066ff 100%)', badge: 'Preparing Gear', title: 'IN PRODUCTION', message: `Preparing your items for shipment.`, accent: '#00f2ff' },
    shipped: { gradient: 'linear-gradient(135deg, #7000ff 0%, #ff00ea 100%)', badge: 'On Its Way', title: 'GEAR SHIPPED', message: `Your package is now in transit!`, accent: '#ff00ea' },
    delivered: { gradient: 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 100%)', badge: 'Mission Complete', title: 'DELIVERED', message: `Package received! Enjoy your new tech.`, accent: '#20e3b2' },
    cancelled: { gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)', badge: 'Order Cancelled', title: 'CLOSED', message: `Your order has been cancelled.`, accent: '#64748b' }
  };

  const theme = themes[status] || themes[status.split('_')[0]] || themes.processing;

  return `
    <div style="margin: 0; padding: 0; width: 100%; background-color: #050505; font-family: 'Inter', -apple-system, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 30px auto; background-color: #0d1117; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 120px rgba(0,0,0,0.8);">
        <tr>
          <td align="center" style="background: ${theme.gradient}; padding: 45px 30px; position: relative;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: inline-block; padding: 8px 20px; border-radius: 100px; margin-bottom: 20px;">
               <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase;">${theme.badge}</span>
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 6px;">${theme.title}</h1>
            <p style="margin: 12px 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);">${theme.message}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <table width="100%" style="background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 30px;">
              <tr>
                <td style="padding: 20px; width: 50%; border-right: 1px solid rgba(255,255,255,0.06);">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase;">Ref Number</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 900; color: ${theme.accent};">#${displayId}</p>
                </td>
                <td style="padding: 20px; width: 50%;">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase;">Order Total</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 900; color: #ffffff;">${formatCurrency(order.total || 0, order.currency, order.exchangeRate)}</p>
                </td>
              </tr>
            </table>
            <table width="100%" style="border-collapse: collapse;">
              ${itemRows}
            </table>
            <div style="margin-top: 40px; text-align: center;">
               <a href="${window.location.origin}/track?id=${orderId}" style="display: block; padding: 18px; background: ${theme.gradient}; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 950; text-transform: uppercase;">Track Now</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Utility to retry a promise-based function
 */
const retry = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Sends an order confirmation email
 */
export const sendOrderConfirmation = async (order) => {
  try {
    const customer = order.customer || { name: 'Customer', email: 'support@neonmarket.com' };
    const orderId = order.orderId || order.id || order._id || Date.now().toString().slice(-8);

    if (isDuplicateEmail(orderId, 'confirmed')) return { success: true };

    const templateParams = {
      to_name: customer.name,
      to_email: customer.email,
      order_id: orderId,
      total_amount: formatCurrency(order.total || 0, order.currency, order.exchangeRate),
      order_items: generateFullEmailHTML(order),
      track_link: `${window.location.origin}/track?id=${orderId}`,
      reply_to: 'support@neonmarket.com',
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email request timed out')), 12000);
    });

    const response = await Promise.race([retry(() => emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)), timeoutPromise]);
    return { success: true, response };
  } catch (error) {
    console.error('EMAIL FAILURE:', error);
    return { success: false, error };
  }
};

/**
 * Sends an automated status update email
 */
export const sendStatusNotification = async (order, status) => {
  try {
    const customer = order.customer || { name: 'Customer', email: 'support@neonmarket.com' };
    const orderId = order.orderId || order.id || order._id || Date.now().toString().slice(-8);

    if (isDuplicateEmail(orderId, status)) return { success: true };

    const templateParams = {
      to_name: customer.name,
      to_email: customer.email,
      order_id: orderId,
      total_amount: formatCurrency(order.total || 0, order.currency, order.exchangeRate),
      order_items: generateStatusEmailHTML(order, status),
      track_link: `${window.location.origin}/track?id=${orderId}`,
      reply_to: 'support@neonmarket.com',
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Status email timed out')), 12000);
    });

    const response = await Promise.race([retry(() => emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)), timeoutPromise]);
    return { success: true, response };
  } catch (error) {
    console.error('STATUS EMAIL FAILURE:', error);
    return { success: false, error };
  }
};
