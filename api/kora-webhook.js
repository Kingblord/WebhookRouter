export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    const payload = req.body;

    console.log("====================================");
    console.log("KORA WEBHOOK RECEIVED");
    console.log("Time:", new Date().toISOString());
    console.log("Payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("====================================");

    const systemA = process.env.SYSTEM_A_WEBHOOK_URL;
    const systemB = process.env.SYSTEM_B_WEBHOOK_URL;

    console.log("SYSTEM_A_WEBHOOK_URL:", systemA);
    console.log("SYSTEM_B_WEBHOOK_URL:", systemB);

    // Forward to System A
    if (systemA) {
      try {
        const responseA = await fetch(systemA, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log(
          "System A response:",
          responseA.status,
          responseA.statusText
        );
      } catch (err) {
        console.error("System A forward failed:", err);
      }
    } else {
      console.error("SYSTEM_A_WEBHOOK_URL is missing");
    }

    // Forward to System B
    if (systemB) {
      try {
        const responseB = await fetch(systemB, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log(
          "System B response:",
          responseB.status,
          responseB.statusText
        );
      } catch (err) {
        console.error("System B forward failed:", err);
      }
    } else {
      console.error("SYSTEM_B_WEBHOOK_URL is missing");
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (err) {
    console.error("Webhook router error:", err);

    // Return 200 so Kora won't retry forever
    return res.status(200).json({
      success: false,
      message: "Webhook handled with error",
    });
  }
}
