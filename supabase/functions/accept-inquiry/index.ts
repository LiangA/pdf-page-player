import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInquiryRequest {
  inquiry_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { inquiry_id }: AcceptInquiryRequest = await req.json();

    console.log(`Processing inquiry ${inquiry_id} by consultant ${user.id}`);

    // Fetch inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiry_id)
      .eq("status", "pending")
      .single();

    if (inquiryError || !inquiry) {
      throw new Error("Inquiry not found or already processed");
    }

    // Fetch consultant profile
    const { data: consultantProfile, error: profileError } = await supabase
      .from("profiles")
      .select("google_tokens, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch consultant profile");
    }

    // Check if Google OAuth is needed
    if (!consultantProfile.google_tokens) {
      const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
      const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI");
      const scopes = [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/calendar",
      ].join(" ");

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri!)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`;

      return new Response(
        JSON.stringify({ needsAuth: true, authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestedTime = new Date(inquiry.requested_time);
    const endTime = new Date(requestedTime.getTime() + 60 * 60 * 1000); // 1 hour meeting

    // Check for conflicts in appointments table
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id")
      .eq("consultant_id", user.id)
      .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${requestedTime.toISOString()}`);

    if (conflicts && conflicts.length > 0) {
      return new Response(
        JSON.stringify({
          conflict: true,
          message: "此時段您已有其他預約",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client account
    const clientEmail = inquiry.form_data.email;
    const clientName = inquiry.form_data.name;
    const temporaryPassword = crypto.randomUUID();

    console.log(`Creating account for ${clientEmail}`);

    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: clientName,
      },
    });

    if (signUpError) {
      console.error("Error creating user:", signUpError);
      throw new Error(`Failed to create client account: ${signUpError.message}`);
    }

    console.log(`User created: ${newUser.user.id}`);

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        client_id: newUser.user.id,
        consultant_id: user.id,
        inquiry_id: inquiry_id,
        start_time: requestedTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
        google_meet_link: `https://meet.google.com/${crypto.randomUUID().substring(0, 10)}`,
      })
      .select()
      .single();

    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError);
      throw new Error("Failed to create appointment");
    }

    // Update inquiry status
    await supabase
      .from("inquiries")
      .update({ status: "claimed" })
      .eq("id", inquiry_id);

    // Send confirmation email to client
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "財務顧問系統 <onboarding@resend.dev>",
          to: [clientEmail],
          subject: "預約確認通知",
          html: `
            <h1>預約確認</h1>
            <p>親愛的 ${clientName}，</p>
            <p>您的財務諮詢預約已確認！</p>
            
            <h2>會議資訊</h2>
            <p><strong>時間:</strong> ${requestedTime.toLocaleString("zh-TW")}</p>
            <p><strong>顧問:</strong> ${consultantProfile.full_name}</p>
            <p><strong>會議連結:</strong> <a href="${appointment.google_meet_link}">${appointment.google_meet_link}</a></p>
            
            <h2>登入資訊</h2>
            <p>我們已為您建立帳號，請使用以下資訊登入：</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>臨時密碼:</strong> ${temporaryPassword}</p>
            <p>請於首次登入後修改密碼。</p>
            
            <p>期待與您見面！</p>
          `,
        }),
      });

      // Send notification to consultant
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "財務顧問系統 <onboarding@resend.dev>",
          to: [consultantProfile.email],
          subject: "新預約通知",
          html: `
            <h1>新預約通知</h1>
            <p>您已成功接受一個新的客戶預約。</p>
            
            <h2>客戶資訊</h2>
            <p><strong>姓名:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            
            <h2>會議資訊</h2>
            <p><strong>時間:</strong> ${requestedTime.toLocaleString("zh-TW")}</p>
            <p><strong>會議連結:</strong> <a href="${appointment.google_meet_link}">${appointment.google_meet_link}</a></p>
          `,
        }),
      });
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Don't fail the entire operation if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointment: appointment,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in accept-inquiry:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
