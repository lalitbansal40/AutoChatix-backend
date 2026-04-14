export const otpEmailTemplate = (otp: string) => {
  return `
  <div style="margin:0;padding:0;background:#f5f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    
    <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
      
      <!-- HEADER -->
      <div style="padding:24px;text-align:center;border-bottom:1px solid #f1f5f9;">
        <img src="https://autochatix-assets.s3.ap-south-1.amazonaws.com/AutoChatix_Full_Logo.png" 
             style="height:32px;" />
      </div>

      <!-- BODY -->
      <div style="padding:32px 28px;text-align:center;">
        
        <h2 style="margin:0 0 10px;font-size:22px;color:#111;font-weight:600;">
          Verify your login
        </h2>

        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
          Use the OTP below to securely access your account
        </p>

        <!-- OTP BOX -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:25px 0;">
          <div style="font-size:34px;font-weight:600;letter-spacing:8px;color:#111;">
            ${otp}
          </div>
        </div>

        <!-- BUTTON -->
        <div style="margin-top:10px;">
          <span style="display:inline-block;padding:12px 22px;background:#22c55e;color:#ffffff;border-radius:8px;font-size:13px;font-weight:500;">
            Copy Code
          </span>
        </div>

        <p style="margin-top:20px;color:#9ca3af;font-size:12px;">
          This code will expire in <strong>5 minutes</strong>
        </p>

      </div>

      <!-- FOOTER -->
      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f1f5f9;">
        © 2026 AutoChatix  
        <br/>
        WhatsApp Automation Platform
      </div>

    </div>

  </div>
  `;
};