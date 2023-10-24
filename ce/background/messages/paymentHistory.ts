import type { PlasmoMessaging } from "@plasmohq/messaging"
import { fetchPaymentHistory } from "~api/payment"

// async function fetchPaymentHistory(email: string, token): { error?: string, result?: string } {
//   try {
//     const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/stripe/payment`, {
//       method: "POST",
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         email
//       })
//     });

//     const data = await result.json();

//     if (!result.ok) {
//       console.log({ result })
//       console.error("Error fetching payment history");
//     }

//     return { result: data }
//   } catch (error) {
//     console.error("There was a problem with the request:", error);
//     return { error: error.message };
//   }
// }


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { email, token } = req.body;
  console.log("payment history message received", email);
  try {
    const data = await fetchPaymentHistory(email, token)

    res.send(data);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler