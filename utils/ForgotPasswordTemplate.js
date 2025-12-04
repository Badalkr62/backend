const ForgotPasswordTemplate = (username, otp) => {
  return `
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${username},</h2>

      <p style="font-size: 16px; margin-bottom: 10px;">
        You recently requested to reset your password on <strong style="color: #2980b9;">Ecommerce App</strong>.
      </p>

      <p style="font-size: 16px; margin-bottom: 10px;">
        Your One-Time Password (OTP) is:
      </p>

      <div style="font-size: 28px; font-weight: bold; background: #ecf0f1; color: #2980b9; padding: 15px 25px; display: inline-block; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        ${otp}
      </div>

      <p style="font-size: 14px; color: #7f8c8d;">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <p style="font-size: 14px; color: #7f8c8d;">
        If you did not request a password reset, you can safely ignore this email or contact our support team.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />

      <p style="font-size: 14px;">
        Thanks,<br />
        <strong style="color: #2980b9;">The Ecommerce App Team</strong>
      </p>
    </div>
  `;
};

export default ForgotPasswordTemplate;
