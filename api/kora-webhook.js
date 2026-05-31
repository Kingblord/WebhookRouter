import admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    const payload = req.body || {};

    console.log("====================================");
    console.log("KORA WEBHOOK RECEIVED");
    console.log("Time:", new Date().toISOString());
    console.log("Payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("====================================");

    const reference =
      payload.reference ||
      payload.payment_reference ||
      payload.data?.reference ||
      payload.data?.payment_reference ||
      `unknown_${Date.now()}`;

    const status =
      payload.status ||
      payload.event ||
      payload.data?.status ||
      null;

    await db
      .collection("kora_webhooks")
      .doc(reference)
      .set(
        {
          reference,
          status,
          payload,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(
      `[FIRESTORE] Stored webhook: ${reference}`
    );

    return res.status(200).json({
      success: true,
      reference,
      stored: true,
    });
  } catch (err) {
    console.error("Webhook router error:", err);

    // Return 200 so Kora doesn't endlessly retry
    return res.status(200).json({
      success: false,
      message: "Webhook handled with error",
    });
  }
}
