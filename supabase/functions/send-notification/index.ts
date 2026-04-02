import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { channel, recipients, subject, body, templateName } = await req.json();

    if (!channel || !recipients || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: channel, recipients, body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: { recipient: string; status: string; error?: string }[] = [];

    if (channel === 'Email') {
      for (const recipient of recipients) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: [recipient.email],
              subject: subject || templateName || 'Notification ShopManager',
              text: body.replace(/\{\{client_name\}\}/g, recipient.name || 'Client'),
            }),
          });
          const emailData = await emailRes.json();
          results.push({
            recipient: recipient.email,
            status: emailRes.ok ? 'sent' : 'failed',
            error: emailRes.ok ? undefined : emailData.message,
          });
        } catch (err) {
          results.push({ recipient: recipient.email, status: 'failed', error: String(err) });
        }
      }
    } else if (channel === 'SMS') {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      for (const recipient of recipients) {
        try {
          const smsBody = body.replace(/\{\{client_name\}\}/g, recipient.name || 'Client');
          const formData = new URLSearchParams({
            To: recipient.phone,
            From: TWILIO_PHONE_NUMBER!,
            Body: smsBody,
          });
          const smsRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });
          const smsData = await smsRes.json();
          results.push({
            recipient: recipient.phone,
            status: smsRes.ok ? 'sent' : 'failed',
            error: smsRes.ok ? undefined : smsData.message,
          });
        } catch (err) {
          results.push({ recipient: recipient.phone, status: 'failed', error: String(err) });
        }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid channel. Use Email or SMS.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return new Response(JSON.stringify({ success: true, sent, failed, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
