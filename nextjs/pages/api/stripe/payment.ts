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
  if (!email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

    const customers = await stripe.customers.list({ email: email });

    if (customers.data.length === 0) {
      console.log("No customer found with this email address.");
      return res.status(200).json({
        subscriptions: [],
        status: "no_subscription",
        isValidSubscription: false
      });
    }

    const customerId = customers.data[0].id;

    // 2. Retrieve list of charges for the customer
    const subscriptions = await stripe.subscriptions.list({ customer: customerId });

    const mapSubscriptions = subscriptions.data.map(subscription => ({
      id: subscription.id,
      amount: subscription.plan.amount / 100,
      createdAt: subscription.created,
      currency: subscription.plan.currency,
      // paymentMethod: {
      //   brand: subscription.payment_method_details.card.brand,
      //   last4: subscription.payment_method_details.card.last4
      // },
      status: subscription.status,
      trialInfo: {
        start: subscription.trial_start,
        end: subscription.trial_end
      }
    }))

    const isValidSubscription = isLatestSubscriptionValid(mapSubscriptions);
    return res.status(200).json({ subscriptions: mapSubscriptions, status: mapSubscriptions[0].status, isValidSubscription });

  } catch (err) {
    console.error(err)
    return res.status(400).send(`Error: ${err.message}`);
  }

}

function isLatestSubscriptionValid(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    console.log("No subscriptions found.");
    return false;
  }

  // Assuming the subscriptions are not sorted, find the latest one
  subscriptions.sort((a, b) => b.createdAt - a.createdAt);
  const latestSubscription = subscriptions[0];

  const currentTimestamp = Math.floor(Date.now() / 1000); // current time in UNIX timestamp

  if (latestSubscription.status === "trialing") {
    // Check if trial is still valid
    if (latestSubscription.trialInfo.start <= currentTimestamp && latestSubscription.trialInfo.end >= currentTimestamp) {
      console.log("Latest subscription is valid and in trial.");
      return true;
    } else {
      console.log("Latest subscription trial has ended.");
      return false;
    }
  } else if (latestSubscription.status === "active") {
    // Add more conditions if needed, e.g. checking for payment methods, expiration, etc.
    console.log("Latest subscription is valid and active.");
    return true;
  } else {
    console.log("Latest subscription is not valid or in an unrecognized state.");
    return false;
  }
}

