import { NextRequest, NextResponse } from 'next/server';

interface ReorderAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  supplierName: string;
  supplierEmail: string;
  leadTimeDays: number;
  suggestedOrderQty: number;
  shop: string;
}

function buildReorderAlertHTML(alert: ReorderAlert): string {
  const urgencyColor = alert.currentStock === 0 ? '#dc2626' : '#f59e0b';
  const urgencyLabel = alert.currentStock === 0 ? '🚨 RUPTURE DE STOCK' : '⚠️ STOCK FAIBLE';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Alerte réapprovisionnement</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 40px;text-align:center;">
      <div style="display:inline-block;background:${urgencyColor};border-radius:12px;padding:10px 20px;margin-bottom:16px;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">${urgencyLabel}</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 4px;">Alerte Réapprovisionnement</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">ShopManager Guinée · ${alert.shop}</p>
    </div>
    <div style="padding:32px 40px;">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:18px;font-weight:800;color:#991b1b;margin:0 0 8px;">${alert.productName}</p>
        <div style="display:flex;gap:24px;flex-wrap:wrap;">
          <div>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.5px;">Stock actuel</p>
            <p style="font-size:24px;font-weight:900;color:${urgencyColor};margin:0;">${alert.currentStock}</p>
          </div>
          <div>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.5px;">Seuil minimum</p>
            <p style="font-size:24px;font-weight:900;color:#374151;margin:0;">${alert.minThreshold}</p>
          </div>
          <div>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.5px;">Seuil maximum</p>
            <p style="font-size:24px;font-weight:900;color:#374151;margin:0;">${alert.maxThreshold}</p>
          </div>
        </div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:14px;font-weight:700;color:#166534;margin:0 0 12px;">📦 Commande recommandée</p>
        <div style="display:flex;gap:24px;flex-wrap:wrap;">
          <div>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.5px;">Quantité suggérée</p>
            <p style="font-size:20px;font-weight:800;color:#166534;margin:0;">${alert.suggestedOrderQty} unités</p>
          </div>
          <div>
            <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.5px;">Délai livraison</p>
            <p style="font-size:20px;font-weight:800;color:#166534;margin:0;">${alert.leadTimeDays} jours</p>
          </div>
        </div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
        <p style="font-size:14px;font-weight:700;color:#374151;margin:0 0 8px;">🏭 Fournisseur</p>
        <p style="font-size:16px;font-weight:600;color:#1e293b;margin:0 0 4px;">${alert.supplierName}</p>
        <p style="font-size:14px;color:#6b7280;margin:0;">${alert.supplierEmail}</p>
      </div>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">ShopManager Guinée · Système automatique d'alertes stock</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alerts, recipientEmail, recipientName } = body as {
      alerts: ReorderAlert[];
      recipientEmail: string;
      recipientName: string;
    };

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return NextResponse.json({ error: 'No alerts provided' }, { status: 400 });
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'recipientEmail is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'your-resend-api-key-here') {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 });
    }

    const results = [];

    for (const alert of alerts) {
      const html = buildReorderAlertHTML(alert);
      const subject = alert.currentStock === 0
        ? `🚨 RUPTURE DE STOCK: ${alert.productName} — ${alert.shop}`
        : `⚠️ Stock faible: ${alert.productName} (${alert.currentStock} restants) — ${alert.shop}`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ShopManager <onboarding@resend.dev>',
          to: [recipientEmail],
          subject,
          html,
        }),
      });

      const data = await res.json();
      results.push({
        productId: alert.productId,
        productName: alert.productName,
        success: res.ok,
        emailId: data.id,
        error: res.ok ? null : (data.message || 'Resend error'),
      });
    }

    const successCount = results.filter(r => r.success).length;
    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
