/**
 * Email Service
 * Handles sending order confirmations and status updates via EmailJS with premium HTML receipts.
 */
import emailjs from '@emailjs/browser';

// ==============================================================================
// 🔐 API CONFIGURATION
// ==============================================================================
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create a new Email Service (e.g., Gmail) -> Get Service ID
// 3. Create a new Email Template -> Get Template ID
//    - Subject: Order Confirmation {{order_id}}
//    - Content: 
//      Hi {{to_name}},
//      Thank you for your order!
//      Order ID: {{order_id}}
//      Total: ${{total_amount}}
//      
//      Products:
//      {{message}}
// 
// 4. Go to Account > API Keys -> Get Public Key
// 5. Replace the values below with your own keys:
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
  // If no currency/rate provided (legacy orders), default to USD behavior
  const cur = currency || 'USD';
  const r = rate || 1;
  const symbol = CURRENCY_SYMBOLS[cur] || '$';

  const converted = amount * r;
  const decimals = cur === 'PKR' ? 0 : 2;

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

/**
 * The ULTIMATE Premium Receipt Generator
 * This creates the ENTIRE email content in code for maximum beauty.
 */
const generateFullEmailHTML = (order) => {
  const itemRows = order.items.map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 15px 0; width: 64px;">
        <img src="${item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80'}" alt="${item.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(0,242,255,0.25); display: block; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
      </td>
      <td style="padding: 15px 15px; text-align: left;">
        <div style="font-weight: 800; font-size: 15px; color: #ffffff; margin-bottom: 4px; line-height: 1.2; letter-spacing: -0.01em;">${item.name}</div>
        <div style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Qty: ${item.quantity} &bull; ${formatCurrency(item.price, order.currency, order.exchangeRate)}</div>
      </td>
      <td style="padding: 15px 0; text-align: right; vertical-align: middle;">
        <div style="font-weight: 900; font-size: 16px; color: #00f2ff;">${formatCurrency(item.price * item.quantity, order.currency, order.exchangeRate)}</div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="margin: 0; padding: 0; width: 100%; background-color: #050505; font-family: 'Inter', -apple-system, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 30px auto; background-color: #0d1117; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 120px rgba(0,0,0,0.8);">
        <!-- 🚀 MEGA HERO HEADER -->
        <tr>
          <td align="center" style="background: linear-gradient(135deg, #00f2ff 0%, #7000ff 100%); padding: 45px 30px; position: relative;">
            <div style="background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); display: inline-block; padding: 8px 20px; border-radius: 100px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">
               <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</span>
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 6px; line-height: 1; font-style: italic; text-shadow: 0 8px 20px rgba(0,0,0,0.4);">NEON MARKET</h1>
            <p style="margin: 12px 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.5px;">Thanks for your gear, ${order.customer.name.split(' ')[0]}!</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 30px;">
            <!-- 📊 ORDER DASHBOARD CARD -->
            <table width="100%" style="background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 30px;">
              <tr>
                <td style="padding: 20px; width: 50%; border-right: 1px solid rgba(255,255,255,0.06);">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Ref Number</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 900; color: #00f2ff; font-family: monospace;">#${order.id}</p>
                </td>
                <td style="padding: 20px; width: 50%;">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Total Paid</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 900; color: #ffffff;">${formatCurrency(order.total, order.currency, order.exchangeRate)}</p>
                </td>
              </tr>
            </table>

            <!-- 🛒 ITEMS LIST -->
            <table width="100%" style="border-collapse: collapse;">
              <tr>
                <td colspan="3" style="padding-bottom: 15px; border-bottom: 2px solid #00f2ff;">
                  <span style="font-size: 12px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">Manifest</span>
                </td>
              </tr>
              ${itemRows}
            </table>

            <!-- 💰 FINAL BALANCE -->
            <table width="100%" style="margin-top: 30px; background: rgba(0,242,255,0.03); border-radius: 16px; border: 1px solid rgba(0,242,255,0.1);">
              <tr>
                <td style="padding: 20px; text-align: left;">
                  <span style="font-size: 15px; font-weight: 800; color: #ffffff;">Final Amount</span>
                </td>
                <td style="padding: 20px; text-align: right;">
                  <span style="font-size: 22px; font-weight: 950; color: #00f2ff;">${formatCurrency(order.total, order.currency, order.exchangeRate)}</span>
                </td>
              </tr>
            </table>

            <!-- 🔘 ACTION HUB -->
            <div style="margin-top: 40px; text-align: center;">
              <a href="${window.location.origin}/track?id=${order.id}" style="display: block; padding: 18px; background: linear-gradient(90deg, #00f2ff, #7000ff); color: #000000; text-decoration: none; border-radius: 16px; font-weight: 950; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 15px 30px rgba(0,242,255,0.2); margin-bottom: 15px;">Track Shipment</a>
              <a href="${window.location.origin}" style="display: inline-block; padding: 10px 20px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5;">Return to Hub</a>
            </div>
          </td>
        </tr>

        <!-- 🔒 FOOTER -->
        <tr>
          <td align="center" style="background-color: #050505; padding: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom: 15px;">
               <span style="font-size: 9px; font-weight: 800; color: #3b4252; text-transform: uppercase; letter-spacing: 3px;">NeonMarket Hub v2.1</span>
            </div>
            <p style="margin: 0; font-size: 10px; color: #4c566a; line-height: 1.5; max-width: 260px;">Automated Manifest • Verified Secure</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * The Comprehensive Status Generator
 * Creates beautifully themed emails for all order life cycles.
 */
const generateStatusEmailHTML = (order, status) => {
  const itemRows = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 15px 0; width: 64px;">
        <img src="${item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80'}" alt="${item.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); display: block;">
      </td>
      <td style="padding: 15px 15px; text-align: left;">
        <div style="font-weight: 800; font-size: 15px; color: #ffffff; margin-bottom: 4px; line-height: 1.2;">${item.name}</div>
        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 15px 0; text-align: right; vertical-align: middle;">
        <div style="font-weight: 900; font-size: 16px; color: #ffffff;">${formatCurrency(item.price * item.quantity, order.currency, order.exchangeRate)}</div>
      </td>
    </tr>
  `).join('');

  // Define themes based on status
  const themes = {
    processing: {
      gradient: 'linear-gradient(135deg, #00f2ff 0%, #0066ff 100%)',
      badge: 'Preparing Gear',
      title: 'IN PRODUCTION',
      message: `Great news, ${order.customer?.name?.split(' ')[0]}! We're currently preparing your items for shipment.`,
      accent: '#00f2ff'
    },
    shipped: {
      gradient: 'linear-gradient(135deg, #7000ff 0%, #ff00ea 100%)',
      badge: 'On Its Way',
      title: 'GEAR SHIPPED',
      message: `Your package is now in transit. Get ready to level up!`,
      accent: '#ff00ea'
    },
    delivered: {
      gradient: 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)',
      badge: 'Mission Complete',
      title: 'DELIVERED',
      message: `Package received! We hope you love your new tech. Tag us in your setup!`,
      accent: '#20e3b2'
    },
    cancelled: {
      gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
      badge: 'Order Cancelled',
      title: 'CLOSED',
      message: `Your order has been cancelled and a refund (if applicable) has been initiated.`,
      accent: '#64748b'
    },
    cancelled_by_customer: {
      gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
      badge: 'Cancelled by You',
      title: 'CLOSED',
      message: `As requested, your order has been cancelled. We're sorry it didn't work out this time!`,
      accent: '#64748b'
    }
  };

  const theme = themes[status] || themes.processing;

  return `
    <div style="margin: 0; padding: 0; width: 100%; background-color: #050505; font-family: 'Inter', -apple-system, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 30px auto; background-color: #0d1117; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 120px rgba(0,0,0,0.8);">
        <!-- 🚀 DYNAMIC HERO -->
        <tr>
          <td align="center" style="background: ${theme.gradient}; padding: 45px 30px; position: relative;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: inline-block; padding: 8px 20px; border-radius: 100px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.3);">
               <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">${theme.badge}</span>
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 6px; line-height: 1; font-style: italic; text-shadow: 0 8px 20px rgba(0,0,0,0.4);">${theme.title}</h1>
            <p style="margin: 12px 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.5px;">${theme.message}</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 30px;">
            <!-- 📊 INFO CARD -->
            <table width="100%" style="background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 30px;">
              <tr>
                <td style="padding: 20px; width: 50%; border-right: 1px solid rgba(255,255,255,0.06);">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Ref Number</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 900; color: ${theme.accent}; font-family: monospace;">#${order.id.slice(-6).toUpperCase()}</p>
                </td>
                <td style="padding: 20px; width: 50%;">
                  <p style="margin: 0; font-size: 10px; font-weight: 800; color: #505c76; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Order Total</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 900; color: #ffffff;">${formatCurrency(order.total || 0, order.currency, order.exchangeRate)}</p>
                </td>
              </tr>
            </table>

            <!-- 🛒 MANIFEST -->
            <table width="100%" style="border-collapse: collapse;">
              <tr>
                <td colspan="3" style="padding-bottom: 15px; border-bottom: 2px solid ${theme.accent};">
                  <span style="font-size: 12px; font-weight: 950; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">Order Summary</span>
                </td>
              </tr>
              ${itemRows}
            </table>

            <!-- 🔘 ACTION HUB -->
            <div style="margin-top: 40px; text-align: center;">
              ${status !== 'cancelled' && status !== 'cancelled_by_customer' ? `
                <a href="${window.location.origin}/track?id=${order.id}" style="display: block; padding: 18px; background: ${theme.gradient}; color: ${status === 'delivered' ? '#000000' : '#ffffff'}; text-decoration: none; border-radius: 16px; font-weight: 950; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); margin-bottom: 15px;">Live Tracking Hub</a>
              ` : `
                <a href="${window.location.origin}" style="display: block; padding: 18px; background: #1a1f2e; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 950; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">Storefront Hub</a>
              `}
              <p style="font-size: 11px; color: #4c566a; margin: 0;">Automated notification from NeonMarket Hub.</p>
            </div>
          </td>
        </tr>

        <!-- 🔒 FOOTER -->
        <tr>
          <td align="center" style="background-color: #050505; padding: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom: 15px;">
               <span style="font-size: 9px; font-weight: 800; color: #3b4252; text-transform: uppercase; letter-spacing: 3px;">NeonMarket Protocol v2.1</span>
            </div>
            <p style="margin: 0; font-size: 10px; color: #4c566a; line-height: 1.5; max-width: 260px;">High-Speed Infrastructure • Verified Transaction</p>
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
    console.warn(`Email send failed, retrying... (${retries} left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Sends an order confirmation email
 * @param {Object} order - The order object
 * @returns {Promise} - The result of the email sending attempt
 */
export const sendOrderConfirmation = async (order) => {
  try {
    const templateParams = {
      to_name: order.customer.name,
      to_email: order.customer.email,
      order_id: order.id,
      to_name: order.customer.name,
      to_email: order.customer.email,
      order_id: order.id,
      total_amount: formatCurrency(order.total, order.currency, order.exchangeRate),
      order_items: generateFullEmailHTML(order), // Injects the entire designed email
      track_link: `${window.location.origin}/track?id=${order.id}`,
      reply_to: 'support@neonmarket.com',
    };

    // Create a timeout promise that rejects after 12 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email request timed out after 12s')), 12000);
    });

    const sendEmailAction = () => emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

    // Race the email sending (with retries) against the timeout
    const response = await Promise.race([
      retry(sendEmailAction),
      timeoutPromise
    ]);

    console.log('SUCCESS! Email sent.', response.status, response.text);
    return { success: true, response };
  } catch (error) {
    // Detailed error logging for debugging
    console.error('CRITICAL EMAIL FAILURE:', {
      message: error.message,
      text: error.text, // EmailJS specific error text
      status: error.status,
      orderId: order.id,
      customerEmail: order.customer.email
    });
    return { success: false, error };
  }
};
/**
 * Sends an automated status update email
 */
export const sendStatusNotification = async (order, status) => {
  try {
    const templateParams = {
      to_name: order.customer?.name || 'Customer',
      to_email: order.customer?.email,
      order_id: order.id,
      to_name: order.customer?.name || 'Customer',
      to_email: order.customer?.email,
      order_id: order.id,
      total_amount: formatCurrency(order.total || 0, order.currency, order.exchangeRate),
      order_items: generateStatusEmailHTML(order, status), // Injects contextual layout
      track_link: `${window.location.origin}/track?id=${order.id}`,
      reply_to: 'support@neonmarket.com',
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Status email timed out after 12s')), 12000);
    });

    const sendEmailAction = () => emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

    const response = await Promise.race([
      retry(sendEmailAction),
      timeoutPromise
    ]);

    console.log(`STATUS EMAIL [${status.toUpperCase()}] SUCCESS!`, response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error(`CRITICAL STATUS EMAIL [${status.toUpperCase()}] FAILURE:`, error);
    return { success: false, error };
  }
};
