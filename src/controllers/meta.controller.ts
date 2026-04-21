// controllers/meta.controller.ts
import axios from "axios";
import { Request, Response } from "express";

export const metaCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send("Authorization code missing");
    }

    try {
        // 🔥 STEP 1: Exchange code for token
        const tokenRes = await axios.get(
            "https://graph.facebook.com/v23.0/oauth/access_token",
            {
                params: {
                    client_id: process.env.META_APP_ID,
                    client_secret: process.env.META_APP_SECRET,
                    redirect_uri: process.env.META_REDIRECT_URI,
                    code,
                },
            }
        );



        const access_token = tokenRes.data.access_token;

        const businessRes = await axios.get(
            `https://graph.facebook.com/v23.0/me?fields=businesses{id,name}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const business = businessRes.data.businesses.data[0];
        console.log("Business:", business);

        // 🔥 STEP 2: Get WABA Accounts
        const wabaRes = await axios.get(
            `https://graph.facebook.com/v23.0/${business.id}/owned_whatsapp_business_accounts`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const waba = wabaRes.data.data[0];
        console.log("WABA:", waba);

        // 🔥 STEP 3: Get Phone Numbers
        const phoneRes = await axios.get(
            `https://graph.facebook.com/v23.0/${waba.id}/phone_numbers`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const phone = phoneRes.data.data[0];
        console.log("Phone:", phone);

        // ✅ SAVE TO DB (IMPORTANT)
        const dataToSave = {
            accessToken: access_token,
            wabaId: waba.id,
            phoneNumberId: phone.id,
            displayPhoneNumber: phone.display_phone_number,
        };

        console.log("SAVE THIS:", dataToSave);

        // 👉 redirect back to frontend
        res.redirect("https://app.autochatix.com/channels?connected=true");
    } catch (error: any) {
        console.error(error.response?.data || error.message);
        res.status(500).send("Error connecting WhatsApp");
    }
};