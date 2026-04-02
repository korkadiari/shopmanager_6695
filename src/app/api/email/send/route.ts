import { NextRequest, NextResponse } from 'next/server';

interface EmailPayload {
  type: 'invoice' | 'reminder' | 'promotion';
  to: string;
  clientName: string;
  invoiceNumber?: string;
  amount?: number;
  dueDate?: string;
  discount?: number;
  promoCode?: string;
  endDate?: string;
  items?: { name: string; qty: number; price: number }[];
  shopName?: string;
  shopPhone?: string;
}

function formatGNF(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';
}

function buildInvoiceHTML(p: EmailPayload): string {
  const itemRows = (p.items || []).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:center;">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:right;">${formatGNF(item.price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#111827;text-align:right;">${formatGNF(item.qty * item.price)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Facture ${p.invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 40px;text-align:center;">
      <div style="display:inline-block;background:#f59e0b;border-radius:12px;padding:10px 20px;margin-bottom:16px;">
        <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:1px;">🏪 ${p.shopName || 'ShopManager'}</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 4px;">FACTURE</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">${p.invoiceNumber}</p>
    </div>
    <!-- Client Info -->
    <div style="padding:28px 40px;border-bottom:1px solid #f1f5f9;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Facturé à</p>
          <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px;">${p.clientName}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Date</p>
          <p style="font-size:14px;color:#374151;margin:0;">${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
    <!-- Items Table -->
    ${itemRows ? `
    <div style="padding:0 40px;">
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Produit</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Qté</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Prix unit.</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>` : ''}
    <!-- Total -->
    <div style="padding:0 40px 28px;">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;text-align:center;">
        <p style="font-size:12px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant Total</p>
        <p style="font-size:32px;font-weight:800;color:#92400e;margin:0;">${formatGNF(p.amount || 0)}</p>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="font-size:14px;color:#374151;margin:0 0 8px;">Merci pour votre confiance !</p>
      <p style="font-size:12px;color:#94a3b8;margin:0;">${p.shopName || 'ShopManager Guinée'} · ${p.shopPhone || '+224 622 00 11 22'}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildReminderHTML(p: EmailPayload): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Rappel de paiement</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:32px 40px;text-align:center;">
      <div style="display:inline-block;background:#f59e0b;border-radius:12px;padding:10px 20px;margin-bottom:16px;">
        <span style="color:#ffffff;font-size:20px;font-weight:800;">🏪 ${p.shopName || 'ShopManager'}</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">⚠️ Rappel de Paiement</h1>
      <p style="color:#fca5a5;font-size:14px;margin:0;">Solde impayé en attente</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="font-size:16px;color:#374151;margin:0 0 24px;">Bonjour <strong>${p.clientName}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">
        Nous vous rappelons qu'un solde est en attente de règlement pour votre compte.
        Merci de procéder au paiement dans les meilleurs délais.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
        <p style="font-size:12px;font-weight:600;color:#dc2626;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant dû</p>
        <p style="font-size:32px;font-weight:800;color:#991b1b;margin:0 0 8px;">${formatGNF(p.amount || 0)}</p>
        ${p.dueDate ? `<p style="font-size:13px;color:#dc2626;margin:0;">Échéance : <strong>${p.dueDate}</strong></p>` : ''}
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
        Pour toute question, contactez-nous au <strong>${p.shopPhone || '+224 622 00 11 22'}</strong>.
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">${p.shopName || 'ShopManager Guinée'} · Conakry, Guinée</p>
    </div>
  </div>
</body>
</html>`;
}

function buildPromotionHTML(p: EmailPayload): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offre spéciale</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px;text-align:center;">
      <p style="font-size:48px;margin:0 0 12px;">🎉</p>
      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:8px 20px;margin-bottom:16px;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">🏪 ${p.shopName || 'ShopManager'}</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px;">Offre Spéciale !</h1>
      <p style="color:#fef3c7;font-size:16px;margin:0;">Rien que pour vous, ${p.clientName}</p>
    </div>
    <div style="padding:40px;text-align:center;">
      <div style="background:#fffbeb;border:2px dashed #f59e0b;border-radius:16px;padding:32px;margin:0 0 28px;">
        <p style="font-size:14px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Réduction exclusive</p>
        <p style="font-size:64px;font-weight:900;color:#d97706;margin:0 0 8px;">${p.discount || 0}%</p>
        <p style="font-size:14px;color:#92400e;margin:0 0 16px;">sur tous nos produits</p>
        ${p.promoCode ? `
        <div style="background:#ffffff;border:1px solid #fde68a;border-radius:8px;padding:12px 24px;display:inline-block;">
          <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">Code promo</p>
          <p style="font-size:20px;font-weight:800;color:#d97706;letter-spacing:3px;margin:0;">${p.promoCode}</p>
        </div>` : ''}
      </div>
      ${p.endDate ? `<p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Offre valable jusqu'au <strong style="color:#d97706;">${p.endDate}</strong></p>` : ''}
      <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
        Visitez notre boutique ou appelez-nous au <strong>${p.shopPhone || '+224 622 00 11 22'}</strong>
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">${p.shopName || 'ShopManager Guinée'} · Conakry, Guinée</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const payload: EmailPayload = await request.json();
    const { type, to, clientName } = payload;

    if (!to || !clientName || !type) {
      return NextResponse.json({ error: 'Missing required fields: to, clientName, type' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'your-resend-api-key-here') {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    if (type === 'invoice') {
      subject = `Votre facture ${payload.invoiceNumber} — ${payload.shopName || 'ShopManager'}`;
      html = buildInvoiceHTML(payload);
    } else if (type === 'reminder') {
      subject = `Rappel : Solde impayé de ${formatGNF(payload.amount || 0)} — ${payload.shopName || 'ShopManager'}`;
      html = buildReminderHTML(payload);
    } else if (type === 'promotion') {
      subject = `🎉 Offre spéciale ${payload.discount}% pour vous, ${clientName} !`;
      html = buildPromotionHTML(payload);
    } else {
      return NextResponse.json({ error: 'Invalid type. Use: invoice, reminder, promotion' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ShopManager <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Resend API error', details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, emailId: data.id, type, to });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
