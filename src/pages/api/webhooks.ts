import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream'
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable :Readable){
  const chunks = [];

  for await (const chunk of readable){ //method to rear a webhook from stripe
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = { //Change the normal comportament of next, data come was a string not a json
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event; 

    try{
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      res.status(404).send(`Webhook error: ${err.message}`)
    }

    const type = event.type;

    if(relevantEvents.has(type)){
      try {
        switch(type) {
          case 'checkout.session.completed':
          
          const checkoutSession = event.data.object as Stripe.Checkout.Session

          await saveSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString()
          );

            break;
          default:
            throw new Error('Unhandled event.');
        }
      } catch (err){
        return res.json({ error: 'Webhook handler failed.'})
      }
    }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}