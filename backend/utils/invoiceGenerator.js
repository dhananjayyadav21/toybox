import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // Print Header
  doc
    .fillColor('#FF6B6B')
    .fontSize(24)
    .text('ToyBox Store', 50, 45, { align: 'left' })
    .fillColor('#64748B')
    .fontSize(10)
    .text('Premium Toys E-Commerce Platform', 50, 75, { align: 'left' })
    .text('Email: billing@toybox.com | Phone: +91 99999 88888', 50, 90, { align: 'left' });

  // Invoice Details
  doc
    .fillColor('#1E293B')
    .fontSize(16)
    .text('INVOICE', 400, 45, { align: 'right' })
    .fontSize(10)
    .fillColor('#64748B')
    .text(`Invoice No: #INV-${order._id.toString().toUpperCase().slice(-6)}`, 400, 65, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' })
    .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 400, 95, { align: 'right' });

  // Draw horizontal line
  doc.moveTo(50, 115).lineTo(550, 115).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // Shipping Address
  doc
    .fillColor('#1E293B')
    .fontSize(12)
    .text('Bill To:', 50, 130)
    .fontSize(10)
    .fillColor('#64748B')
    .text(order.user.name, 50, 150)
    .text(order.shippingAddress.street, 50, 165)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 50, 180)
    .text(order.shippingAddress.country, 50, 195);

  // Table Header
  const tableTop = 230;
  doc
    .fillColor('#1E293B')
    .fontSize(10)
    .text('Product Name', 50, tableTop)
    .text('Qty', 300, tableTop, { width: 30, align: 'right' })
    .text('Price (INR)', 350, tableTop, { width: 80, align: 'right' })
    .text('Total (INR)', 450, tableTop, { width: 100, align: 'right' });

  // Table Line
  doc.moveTo(50, 245).lineTo(550, 245).strokeColor('#4ECDC4').lineWidth(1.5).stroke();

  let position = tableTop + 25;

  // Print products
  order.products.forEach((item, index) => {
    // Avoid overflow if name is long
    const name = item.product.name.length > 35 ? item.product.name.slice(0, 32) + '...' : item.product.name;
    const total = item.quantity * item.price;

    doc
      .fillColor('#64748B')
      .fontSize(9)
      .text(name, 50, position)
      .text(item.quantity.toString(), 300, position, { width: 30, align: 'right' })
      .text(item.price.toFixed(2), 350, position, { width: 80, align: 'right' })
      .text(total.toFixed(2), 450, position, { width: 100, align: 'right' });

    position += 20;
  });

  // Divider
  doc.moveTo(50, position + 5).lineTo(550, position + 5).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // Grand Total Calculation
  const totalPos = position + 15;
  doc
    .fillColor('#1E293B')
    .fontSize(11)
    .text('Grand Total:', 350, totalPos, { width: 100, align: 'right' })
    .fillColor('#FF6B6B')
    .fontSize(12)
    .text(`INR ${order.totalAmount.toFixed(2)}`, 450, totalPos, { width: 100, align: 'right' });

  // Thank You Message
  doc
    .fillColor('#4ECDC4')
    .fontSize(12)
    .text('Thank you for shopping with ToyBox!', 50, totalPos + 40, { align: 'center' })
    .fontSize(9)
    .fillColor('#64748B')
    .text('This is a computer-generated invoice and does not require signatures.', 50, totalPos + 55, { align: 'center' });

  doc.end();
};
