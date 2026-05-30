export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false });
    }

    const payload = req.body;

    console.log("KORA WEBHOOK:", {
      time: new Date().toISOString(),
      reference: payload?.reference || payload?.payment_reference,
    });

    // Forward to System A
    await fetch(process.env.SYSTEM_A_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Forward to System B
    await fetch(process.env.SYSTEM_B_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.status(200).json({
      success: true,
      message: "Webhook forwarded",
    });

  } catch (err) {
    console.error("Webhook router error:", err);

    // still return 200 so Kora doesn't retry endlessly
    return res.status(200).json({
      success: false,
      message: "handled with error",
    });
  }
}
