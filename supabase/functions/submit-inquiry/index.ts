import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  form_data: {
    name: string;
    gender: string;
    birth_date: string;
    email: string;
    has_children: boolean;
    has_insurance: boolean;
    has_mortgage: boolean;
    has_investment: boolean;
    financial_goals: string[];
  };
  requested_time: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { form_data, requested_time }: InquiryRequest = await req.json();

    // Validate input
    if (!form_data || !requested_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!form_data.name || !form_data.email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert inquiry into database
    const { data: inquiry, error: dbError } = await supabaseClient
      .from("inquiries")
      .insert({
        form_data,
        requested_time,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to create inquiry");
    }

    console.log("Inquiry created:", inquiry.id);

    // Send confirmation email
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "財務諮詢系統 <onboarding@resend.dev>",
          to: [form_data.email],
          subject: "您的諮詢申請已收到",
          html: `
            <h1>感謝您的申請，${form_data.name}！</h1>
            <p>我們已經收到您的財務諮詢申請。</p>
            <p><strong>預約時間：</strong>${new Date(requested_time).toLocaleString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p>我們的專業顧問將盡快與您聯繫，確認諮詢時間。</p>
            <p>如有任何問題，歡迎隨時與我們聯絡。</p>
            <br>
            <p>祝好，<br>財務諮詢團隊</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Email API error:", errorData);
      } else {
        const emailData = await emailResponse.json();
        console.log("Confirmation email sent:", emailData);
      }
    } catch (emailError: any) {
      console.error("Email error:", emailError);
      // Don't fail the request if email fails, but log it
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inquiry_id: inquiry.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
