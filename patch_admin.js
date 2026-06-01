const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Paid check to handleSendDeliveryOtp
content = content.replace(
  /const handleSendDeliveryOtp = async \(orderId\) => \{\s*try \{/g,
  `const handleSendDeliveryOtp = async (orderId) => {
    const ord = orders.find(o => o._id === orderId);
    if (ord && ord.paymentStatus !== 'Paid') {
      showToast('Settlement must be marked as PAID before initiating delivery handover!', 'error');
      return;
    }
    try {`
);

// 2. Add .trim() to OTP
content = content.replace(
  /const otp = otpInput\[orderId\];/g,
  `const otp = otpInput[orderId]?.trim();`
);

// 3. Add Resend buttons near Cancel buttons
content = content.replace(
  /<button\s+type="button"\s+onClick=\{\(\) => setActiveOtpOrders\(prev => \{\s*const next = \{ \.\.\.prev \};\s*delete next\[ord\._id\];\s*return next;\s*\}\)\}\s*className="text-\[10px\] text-slate-400 hover:underline font-bold"\s*>\s*Cancel\s*<\/button>/g,
  `<button
                                  type="button"
                                  onClick={() => handleSendDeliveryOtp(ord._id)}
                                  className="h-8 px-4 bg-[#FF9F00] hover:bg-[#e68f00] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                                >
                                  Resend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveOtpOrders(prev => {
                                    const next = { ...prev };
                                    delete next[ord._id];
                                    return next;
                                  })}
                                  className="text-[10px] text-slate-400 hover:underline font-bold"
                                >
                                  Cancel
                                </button>`
);

// 4. Lock Settlement dropdowns if Delivered
content = content.replace(
  /<select\s+value=\{ord\.paymentStatus\}\s+disabled=\{false\}\s+onChange=\{\(e\) => updateStatus\(ord\._id, null, e\.target\.value\)\}\s+className=\{`border border-slate-350 rounded-lg py-1 px-2\.5 font-bold outline-none text-\[11px\] \$\{\s*ord\.paymentMethod === 'Razorpay'\s*\?\s*'text-slate-400 bg-slate-100 cursor-not-allowed'\s*:\s*'text-slate-800 bg-white'\s*\}\`\}/g,
  `<select
                                  value={ord.paymentStatus}
                                  disabled={ord.orderStatus === 'Delivered'}
                                  onChange={(e) => updateStatus(ord._id, null, e.target.value)}
                                  className={\`border border-slate-350 rounded-lg py-1 px-2.5 font-bold outline-none text-[11px] \${
                                    ord.orderStatus === 'Delivered'
                                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                                      : 'text-slate-800 bg-white'
                                  }\`}
                                >`
);

// 5. Ensure orderStatus is completely disabled if Delivered (already disabled for Cancelled or Delivered)
// It was: disabled={ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Delivered'}
// And the class also reflected it. So that part is already correct in the Orders tab.
// In the Pending Dispatches tab, it only shows orders that are NOT Delivered or Cancelled, so it doesn't matter there!

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched AdminDashboard.jsx!');
