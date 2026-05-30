export default async function handler(req, res) {
  console.log("====================================");
  console.log("KORA WEBHOOK RECEIVED");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("====================================");

  return res.status(200).json({
    success: true,
    message: "Webhook received",
    timestamp: Date.now()
  });
}
