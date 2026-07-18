const nodemailer = require('nodemailer');

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const emailLayout = ({ heading, intro, order, customer, address, items }) => {
    const rows = items.map((item) => `
        <tr>
            <td style="padding:12px 8px;border-bottom:1px solid #eadfce;">${escapeHtml(item.name)}</td>
            <td style="padding:12px 8px;border-bottom:1px solid #eadfce;text-align:center;">${item.qty}</td>
            <td style="padding:12px 8px;border-bottom:1px solid #eadfce;text-align:right;">${money(item.price)}</td>
            <td style="padding:12px 8px;border-bottom:1px solid #eadfce;text-align:right;font-weight:600;">${money(Number(item.price) * item.qty)}</td>
        </tr>`).join('');

    const fullAddress = [address.address, address.locality, address.city, address.state, address.pincode]
        .filter(Boolean).map(escapeHtml).join(', ');

    return `<!doctype html><html><body style="margin:0;background:#f6f1e9;color:#2b211c;font-family:Arial,sans-serif;">
        <div style="max-width:680px;margin:24px auto;background:#fffdf9;border:1px solid #e6dac9;border-radius:14px;overflow:hidden;">
            <div style="background:#241714;color:#fff;padding:28px 32px;">
                <div style="font-family:Georgia,serif;font-size:28px;">KIA <span style="color:#d9b877;">Jewellers</span></div>
                <div style="margin-top:8px;color:#d9b877;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(heading)}</div>
            </div>
            <div style="padding:30px 32px;">
                <p style="font-size:15px;line-height:1.7;margin-top:0;">${escapeHtml(intro)}</p>
                <div style="background:#faf6ef;border-radius:10px;padding:18px;margin:22px 0;line-height:1.8;font-size:14px;">
                    <strong>Order #${escapeHtml(order.id)}</strong><br>
                    Date: ${new Date(order.created_at).toLocaleString('en-IN')}<br>
                    Payment: ${escapeHtml(order.payment_method)}<br>
                    Status: ${escapeHtml(order.status)}
                </div>
                <h3 style="font-family:Georgia,serif;margin-bottom:8px;">Customer & delivery details</h3>
                <p style="font-size:14px;line-height:1.7;margin-top:0;">
                    ${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>
                    ${escapeHtml(address.phone || customer.phone || '')}<br>${fullAddress}
                </p>
                <h3 style="font-family:Georgia,serif;margin:24px 0 8px;">Order items</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead><tr style="background:#f3eadc;"><th style="padding:10px 8px;text-align:left;">Item</th><th>Qty</th><th style="text-align:right;">Price</th><th style="padding-right:8px;text-align:right;">Subtotal</th></tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr><td colspan="3" style="padding:16px 8px;text-align:right;font-weight:bold;">Total</td><td style="padding:16px 8px;text-align:right;font-size:16px;font-weight:bold;">${money(order.total_amount)}</td></tr></tfoot>
                </table>
            </div>
        </div>
    </body></html>`;
};

const sendOrderEmails = async ({ order, customer, address, items }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Order emails skipped: EMAIL_USER or EMAIL_PASS is not configured.');
        return { customer: false, admin: false, skipped: true };
    }

    const transporter = createTransporter();
    const from = `"KIA Jewellers" <${process.env.EMAIL_USER}>`;
    const adminEmail = process.env.ADMIN_ORDER_EMAIL || 'ajayk294494@gmail.com';
    const messages = [
        transporter.sendMail({
            from,
            to: customer.email,
            subject: `Order confirmed #${order.id} — KIA Jewellers`,
            html: emailLayout({ heading: 'Order confirmation', intro: `Hello ${customer.name}, thank you for your order. We have received it and will keep you updated.`, order, customer, address, items }),
        }),
        transporter.sendMail({
            from,
            to: adminEmail,
            subject: `New order #${order.id} from ${customer.name}`,
            html: emailLayout({ heading: 'New order received', intro: 'A new customer order has been placed. Complete details are below.', order, customer, address, items }),
        }),
    ];

    const [customerResult, adminResult] = await Promise.allSettled(messages);
    if (customerResult.status === 'rejected') console.error('Customer order email failed:', customerResult.reason?.message);
    if (adminResult.status === 'rejected') console.error('Admin order email failed:', adminResult.reason?.message);
    return { customer: customerResult.status === 'fulfilled', admin: adminResult.status === 'fulfilled' };
};

module.exports = { sendOrderEmails };
