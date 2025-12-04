
const VerificationEmail = (username, otp) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333;">Hello ${username},</h2>
            <p style="font-size: 16px; color: #555;">Thank you for registering on our platform.</p>
            <p style="font-size: 16px; color: #555;">Please verify your email using the code below:</p>
            <div style="text-align: center; margin: 20px 0;">
                <h1 style="font-size: 32px; color: #2e6da4;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #888;">If you didn’t request this, you can safely ignore this email.</p>
            <br/>
            <p style="font-size: 14px; color: #333;">Best regards,<br/>Ecommerce App Team</p>
        </div>
    `;
};

export default VerificationEmail;
