require("dotenv").config();

let cachedToken = null;
let tokenExpiresAt = 0;

const getGraphAccessToken = async (clientId, clientSecret, tenantId) => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const data = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  }).toString();

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
  }

  cachedToken = tokenData.access_token;
  tokenExpiresAt = now + (tokenData.expires_in || 3600) * 1000;
  return cachedToken;
};

const sendEmail = async (to, subject, text) => {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;
  const userId = process.env.EMAIL_USER;

  if (!to || !to.trim()) {
    console.warn("sendEmail called with empty recipient, skipping.");
    return { success: false, reason: "No recipient provided" };
  }

  const recipients = to
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({
      emailAddress: { address: email },
    }));

  if (recipients.length === 0) {
    return { success: false, reason: "No valid recipient" };
  }

  const mailData = {
    message: {
      subject: subject,
      body: {
        contentType: /<[a-z][\s\S]*>/i.test(text) ? "HTML" : "Text",
        content: text,
      },
      toRecipients: recipients,
    },
    saveToSentItems: "false",
  };

  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${userId}/sendMail`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const accessToken = await getGraphAccessToken(clientId, clientSecret, tenantId);

      const mailRes = await fetch(sendMailUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mailData),
      });

      if (mailRes.ok) {
        console.log("Email sent successfully via Graph API!");
        return { success: true };
      }

      if (mailRes.status === 429 && attempts < maxAttempts) {
        const delayMs = attempts * 1500;
        console.warn(`Graph API throttled (429). Retrying in ${delayMs}ms (attempt ${attempts}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      const errText = await mailRes.text();
      throw new Error(`Failed to send email: ${mailRes.status} ${errText}`);
    } catch (error) {
      if (attempts < maxAttempts && error.message && error.message.includes("429")) {
        const delayMs = attempts * 1500;
        console.warn(`Graph API 429 caught. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      console.error("Email sending failed:", error);
      throw error;
    }
  }
};

module.exports = sendEmail;