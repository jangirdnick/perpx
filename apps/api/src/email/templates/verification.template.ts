// Path: src/email/templates/verification.template.ts

export const getVerificationTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Perpx</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0b0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0c; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#111113; border-radius:12px; padding:40px; color:#e5e7eb;">
          
          <tr>
            <td style="text-align:center; font-size:22px; font-weight:600; color:#ffffff; padding-bottom:20px;">
              Perpx
            </td>
          </tr>

          <tr>
            <td style="text-align:center; font-size:26px; font-weight:600; color:#ffffff; padding-bottom:10px;">
              Verify your email
            </td>
          </tr>

          <tr>
            <td style="text-align:center; font-size:15px; color:#9ca3af; padding-bottom:30px;">
              You're almost there. Click below to activate your account.
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${verificationLink}" 
                 style="display:inline-block; padding:14px 28px; background:#ffffff; color:#000000; text-decoration:none; font-size:14px; font-weight:600; border-radius:8px;">
                 Verify Email
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 0;">
              <hr style="border:none; border-top:1px solid #1f2937;">
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px; font-size:12px; color:#6b7280; text-align:center;">
              If you didn’t create an account, ignore this email.
              <br><br>
              © 2026 Perpx
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
