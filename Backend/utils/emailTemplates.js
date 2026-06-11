/**
 * Central email template builder — DLF Evaluation System
 * Uses APP_URL from .env as the base URL for all form links.
 */

const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Build a full form URL from a route path.
 * @param {string} route  e.g. "fortnightly-monitor/create/65ab..."
 */
const formLink = (route) => `${APP_URL}/${route}`;

/**
 * Renders a beautiful HTML email.
 *
 * @param {object} opts
 * @param {string} opts.recipientName    - e.g. "John Doe"
 * @param {string} opts.subject          - Email subject line (also used as hero heading)
 * @param {string} opts.bodyHtml         - Main paragraph(s) as HTML
 * @param {string} [opts.ctaLabel]       - Button label, e.g. "Fill the Form"
 * @param {string} [opts.ctaUrl]         - Button URL (full link)
 * @param {string} [opts.footerNote]     - Small note below the button
 */
const buildEmail = ({ recipientName, subject, bodyHtml, ctaLabel, ctaUrl, footerNote }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f0;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3a5c34 0%,#4A6741 60%,#5d7a55 100%);padding:36px 40px 28px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                DLF Evaluation System
              </h1>
              <p style="margin:8px 0 0;color:#c8dfc4;font-size:13px;">School Performance & Evaluation Portal</p>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="background:#7cb878;height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">

              <!-- Greeting -->
              <p style="margin:0 0 20px;font-size:16px;color:#2d2a26;font-weight:600;">
                Dear ${recipientName || "User"},
              </p>

              <!-- Dynamic body -->
              <div style="font-size:15px;color:#4a4742;line-height:1.75;">
                ${bodyHtml}
              </div>

              <!-- CTA Button -->
              ${ctaLabel && ctaUrl ? `
              <div style="text-align:center;margin:32px 0;">
                <a href="${ctaUrl}"
                   style="display:inline-block;background:#4A6741;color:#ffffff;text-decoration:none;
                          font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;
                          letter-spacing:0.4px;box-shadow:0 4px 12px rgba(74,103,65,0.35);">
                  ${ctaLabel} &rarr;
                </a>
                <p style="margin:12px 0 0;font-size:12px;color:#9e9b95;">
                  Or copy this link: <a href="${ctaUrl}" style="color:#4A6741;word-break:break-all;">${ctaUrl}</a>
                </p>
              </div>` : ""}

              <!-- Footer note -->
              ${footerNote ? `<p style="font-size:13px;color:#9e9b95;margin-top:8px;">${footerNote}</p>` : ""}

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8ede7;margin:0;"/>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#b0ada8;">
                This is an automated notification from the <strong>DLF Evaluation System</strong>.<br/>
                Please do not reply to this email.
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#c9c5c0;">
                &copy; ${new Date().getFullYear()} DLF Schools &mdash; Evaluation Portal
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

// ── Pre-built template functions ───────────────────────────────────────────────

/**
 * Form Initiated — sent to the teacher/recipient when a form is created for them.
 */
const formInitiatedEmail = ({ recipientName, initiatorName, formTitle, formRoute, className, section, subject: subjectField, date }) => {
  const url = formLink(formRoute);
  const meta = [
    className && `<strong>Class:</strong> ${className}`,
    section   && `<strong>Section:</strong> ${section}`,
    subjectField && `<strong>Subject:</strong> ${subjectField}`,
    date      && `<strong>Date:</strong> ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
  ].filter(Boolean);

  return {
    subject: `Action Required: ${formTitle} has been initiated for you`,
    html: buildEmail({
      recipientName,
      subject: `${formTitle} — Action Required`,
      bodyHtml: `
        <p><strong>${initiatorName}</strong> has initiated a <strong>${formTitle}</strong> and assigned it to you. Please complete your section at the earliest convenience.</p>
        ${meta.length ? `
        <table style="background:#f6f9f5;border-radius:8px;padding:16px 20px;border-left:4px solid #4A6741;margin:20px 0;border-collapse:collapse;">
          <tr><td style="padding:3px 0;font-size:14px;color:#4a4742;">${meta.join(" &nbsp;&bull;&nbsp; ")}</td></tr>
        </table>` : ""}
        <p>Click the button below to open your form directly:</p>
      `,
      ctaLabel: `Open ${formTitle}`,
      ctaUrl: url,
      footerNote: "If you believe this was sent to you by mistake, please contact your school administrator.",
    }),
  };
};

/**
 * Form Completed — sent when a teacher/observer completes their section.
 */
const formCompletedEmail = ({ recipientName, completorName, formTitle, formRoute, role }) => {
  const url = formLink(formRoute);
  return {
    subject: `${completorName} has completed their section — ${formTitle}`,
    html: buildEmail({
      recipientName,
      subject: `${formTitle} — Section Completed`,
      bodyHtml: `
        <p><strong>${completorName}</strong> (${role || "user"}) has completed their section of the <strong>${formTitle}</strong>.</p>
        <p>It is now your turn to review and complete your part. Please click the button below to proceed.</p>
      `,
      ctaLabel: "Review & Complete",
      ctaUrl: url,
      footerNote: "Please complete your section promptly to keep the evaluation process on track.",
    }),
  };
};

/**
 * Reflection Submitted — sent when a teacher submits reflection.
 */
const reflectionSubmittedEmail = ({ recipientName, teacherName, formTitle, formRoute }) => {
  const url = formLink(formRoute);
  return {
    subject: `${teacherName} submitted their reflection — ${formTitle}`,
    html: buildEmail({
      recipientName,
      subject: `${formTitle} — Reflection Submitted`,
      bodyHtml: `
        <p><strong>${teacherName}</strong> has submitted their reflection for the <strong>${formTitle}</strong>.</p>
        <p>You can now review the completed form including the teacher's reflection using the link below.</p>
      `,
      ctaLabel: "View Reflection",
      ctaUrl: url,
    }),
  };
};

/**
 * Reminder — sent to nudge a user to complete their pending section.
 */
const reminderEmail = ({ recipientName, senderName, formTitle, formRoute }) => {
  const url = formLink(formRoute);
  return {
    subject: `Reminder: Your section of the ${formTitle} is pending`,
    html: buildEmail({
      recipientName,
      subject: `${formTitle} — Reminder`,
      bodyHtml: `
        <p>This is a gentle reminder from <strong>${senderName}</strong> that your section of the <strong>${formTitle}</strong> is still pending.</p>
        <p>Please complete it as soon as possible to avoid delays in the evaluation process.</p>
      `,
      ctaLabel: "Complete My Section",
      ctaUrl: url,
      footerNote: "If you have already submitted, please disregard this message.",
    }),
  };
};

/**
 * Account Created — sent to a new user with their portal login credentials.
 */
const accountCreatedEmail = ({ recipientName, email, password }) => {
  return {
    subject: "Your Account Details — DLF Evaluation System",
    html: buildEmail({
      recipientName,
      subject: "Welcome to DLF Evaluation System",
      bodyHtml: `
        <p>Your account has been successfully created on the DLF Evaluation System portal.</p>
        <p>Please use the following credentials to sign in:</p>
        <table style="background:#f6f9f5;border-radius:8px;padding:16px 20px;border-left:4px solid #4A6741;margin:20px 0;border-collapse:collapse;width:100%;">
          <tr><td style="padding:4px 0;font-size:14px;color:#4a4742;"><strong>Username:</strong> ${email}</td></tr>
          <tr><td style="padding:4px 0;font-size:14px;color:#4a4742;"><strong>Password:</strong> ${password}</td></tr>
        </table>
        <p>Click the button below to sign in directly:</p>
      `,
      ctaLabel: "Sign In to Portal",
      ctaUrl: APP_URL,
      footerNote: "For security, we recommend that you change your password after logging in for the first time.",
    }),
  };
};

module.exports = {
  formLink,
  buildEmail,
  formInitiatedEmail,
  formCompletedEmail,
  reflectionSubmittedEmail,
  reminderEmail,
  accountCreatedEmail,
};
