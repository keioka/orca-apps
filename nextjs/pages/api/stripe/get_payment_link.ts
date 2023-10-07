import { NextApiRequest, NextApiResponse } from "next";
import Stripe from 'stripe';

// Return a 200 response to acknowledge receipt of the event

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
    // console.log({ stripe })
    // if (stripe.errors) {
    //   console.log({ errors: stripe.errors })
    //   return res.status(400).send(`Webhook Error: Stripe Initialization Error`);
    // }

    const customers = await stripe.customers.list({
      email: '{EMAIL_ADDRESS}',
    });
  } catch (err) {
    console.error(err)
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

}
