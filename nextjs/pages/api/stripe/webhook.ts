import { NextApiRequest, NextApiResponse } from "next";
import Stripe from 'stripe';
import getRawBody from 'raw-body';

// Return a 200 response to acknowledge receipt of the event

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  console.log("hit stripe_webhook")
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
    // console.log({ stripe })
    // if (stripe.errors) {
    //   console.log({ errors: stripe.errors })
    //   return res.status(400).send(`Webhook Error: Stripe Initialization Error`);
    // }
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_ENDPOINT_SECRET);
  } catch (err) {
    console.error(err)
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.created':
      const paymentIntentCreated = event.data.object;
      // Then define and call a function to handle the event payment_intent.created
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

}
