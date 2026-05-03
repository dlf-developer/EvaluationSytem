require("dotenv").config();

const sendEmail = async (to, subject, text) => {
  try {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;
    const userId = process.env.EMAIL_USER;

    // 1. Get access token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const data = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
    }).toString();

    const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
    }

    // 2. Send email via Microsoft Graph API
    const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${userId}/sendMail`;
    
    const recipients = to.split(',').map(email => ({
        emailAddress: { address: email.trim() }
    }));

    const mailData = {
        message: {
            subject: subject,
            body: {
                contentType: /<[a-z][\s\S]*>/i.test(text) ? "HTML" : "Text",
                content: text
            },
            toRecipients: recipients
        },
        saveToSentItems: "false"
    };

    const mailRes = await fetch(sendMailUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mailData)
    });

    if (mailRes.ok) {
        console.log("Email sent successfully via Graph API!");
        return { success: true };
    } else {
        const err = await mailRes.text();
        throw new Error("Failed to send email: " + mailRes.status + " " + err);
    }
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;