/**
 * OPTIONAL and UNTESTED against a real Meta account: sends an alert to the admin's WhatsApp
 * through the official WhatsApp Business Cloud API. Does nothing until all variables are set.
 * Business-initiated messages must use an APPROVED TEMPLATE (see docs/WHATSAPP-AND-PAYMENTS.md).
 */
export async function sendAdminAlert(text: string): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_ADMIN_NUMBER;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneId || !to || !template || [token, phoneId, template].some((v) => v.startsWith("your-"))) {
    return { sent: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: text.slice(0, 500) }] }],
        },
      }),
    });
    return res.ok ? { sent: true } : { sent: false, reason: `http_${res.status}` };
  } catch {
    return { sent: false, reason: "network" };
  }
}
