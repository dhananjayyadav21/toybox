/**
 * ToyBox E-Commerce Premium Email HTML Templates
 * Unified design system matching the Flipkart/Amazon style with clean typography,
 * consistent brand headers, and high-converting transactional alerts.
 */

const BRAND_BLUE = '#2874F0';
const BRAND_ORANGE = '#FB641B';
const BRAND_GREEN = '#388E3C';
const LIGHT_BG = '#F5F7FA';
const TEXT_DARK = '#212121';
const TEXT_LIGHT = '#878787';

/**
 * Returns a standardized premium email wrapper
 */
const getBaseWrapper = (contentHtml, headerColor = BRAND_BLUE) => {
  return `
    <div style="background-color: ${LIGHT_BG}; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${TEXT_DARK}; line-height: 1.6; max-width: 600px; margin: 0 auto; border-radius: 8px;">
      
      <!-- Brand Logo / Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px; vertical-align: middle;">🧸</span>
        <span style="font-size: 24px; font-weight: 800; color: ${headerColor}; letter-spacing: -0.5px; margin-left: 6px; vertical-align: middle; font-family: system-ui;">Toy<span style="color: ${BRAND_ORANGE};">Box</span></span>
        <div style="font-size: 11px; font-weight: bold; color: ${TEXT_LIGHT}; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Premium Kids Store</div>
      </div>
      
      <!-- Main Content Card -->
      <div style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); overflow: hidden;">
        <!-- Header color strip -->
        <div style="height: 6px; background-color: ${headerColor};"></div>
        
        <!-- Inner Padding Wrapper -->
        <div style="padding: 40px 30px;">
          ${contentHtml}
        </div>
      </div>

      <!-- Footer Info -->
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: ${TEXT_LIGHT};">
        <p style="margin: 5px 0;">This is an automated email from the ToyBox Platform.</p>
        <p style="margin: 5px 0; font-weight: bold;">ToyBox Store India • Express Shipping • BPA-Free Safely Tested Toys</p>
        <p style="margin: 15px 0 0 0; color: #BDBDBD;">&copy; 2026 ToyBox Store. All Rights Reserved.</p>
      </div>

    </div>
  `;
};

/**
 * HTML Template for Account Security & Verification OTPs (Registration, Resend, Forgot Password)
 */
export const getOtpEmailHtml = ({ userName, title, description, code, actionLabel, codeColor = BRAND_BLUE }) => {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: ${TEXT_DARK}; margin-top: 0; margin-bottom: 15px; font-family: system-ui;">${title}</h2>
    <p style="font-size: 14px; color: #4A5568; margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>
    <p style="font-size: 14px; color: #4A5568; margin-bottom: 25px; line-height: 1.5;">${description}</p>
    
    <!-- Code Highlight Box -->
    <div style="text-align: center; background-color: #F8FAFC; border: 1px dashed ${codeColor}; border-radius: 6px; padding: 20px; margin: 25px 0;">
      <div style="font-size: 10px; font-weight: bold; color: ${TEXT_LIGHT}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${actionLabel || 'Your Secure Code'}</div>
      <div style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: ${codeColor}; font-family: monospace;">${code}</div>
    </div>
    
    <p style="font-size: 12px; color: ${TEXT_LIGHT}; margin-top: 30px;">
      If you did not request this, please ignore this communication. This OTP code is valid for 1 hour.
    </p>
  `;
  return getBaseWrapper(content, codeColor);
};

/**
 * HTML Template for Order Placement Invoices
 */
export const getOrderInvoiceEmailHtml = ({ order, userName, itemsHtml }) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="display: inline-block; background-color: #EBF8FF; border-radius: 100px; padding: 10px; margin-bottom: 10px;">
        <span style="font-size: 24px;">🎉</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: ${TEXT_DARK}; margin: 0; font-family: system-ui;">Order Confirmed!</h2>
      <p style="font-size: 12px; color: ${TEXT_LIGHT}; margin-top: 4px; margin-bottom: 0;">Order Reference: <strong>#${order._id}</strong></p>
    </div>

    <p style="font-size: 14px; color: #4A5568;">Dear <strong>${userName}</strong>,</p>
    <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">Thank you for shopping at ToyBox! We are delighted to confirm that your order has been received and is currently being prepared for dispatch.</p>
    
    <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${TEXT_DARK}; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Shopping Summary</h3>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
          <th style="padding: 10px; text-align: left; font-size: 11px; color: #4A5568; font-weight: bold; text-transform: uppercase;">Toy Details</th>
          <th style="padding: 10px; text-align: center; font-size: 11px; color: #4A5568; font-weight: bold; text-transform: uppercase;">Qty</th>
          <th style="padding: 10px; text-align: right; font-size: 11px; color: #4A5568; font-weight: bold; text-transform: uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr style="border-top: 2px solid #E2E8F0;">
          <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 13px; color: ${TEXT_DARK};">Grand Total:</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: 800; font-size: 16px; color: ${BRAND_BLUE};">₹${order.totalAmount}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 15px; margin-top: 25px; font-size: 12px; color: #4A5568; line-height: 1.6;">
      <div style="margin-bottom: 8px;"><strong>Settlement Method:</strong> ${order.paymentMethod}</div>
      <div><strong>Delivery Address:</strong><br/>
        <span style="color: #718096;">
          ${order.shippingAddress.street}, ${order.shippingAddress.city},<br/>
          ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
        </span>
      </div>
    </div>

    <p style="font-size: 13px; color: #4A5568; margin-top: 30px;">
      Our toys warehouse is processing your box immediately. You will receive a tracking link the moment the courier partner scans your package.
    </p>
  `;
  return getBaseWrapper(content, BRAND_BLUE);
};
