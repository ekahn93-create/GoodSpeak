// ============================================
// STRIPE WEBHOOK - Netlify Serverless Function
// Uses fetch against Supabase REST API directly (no SDK) to avoid
// the WebSocket crash on Node 20 with @supabase/supabase-js v2.
// ============================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function supabaseUpsert(data) {
  const url = process.env.SUPABASE_URL + '/rest/v1/user_progress?on_conflict=user_id';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Supabase upsert failed: ' + text);
  }
}

async function supabaseUpdateByColumn(column, value, data) {
  const url = process.env.SUPABASE_URL + '/rest/v1/user_progress?' + column + '=eq.' + encodeURIComponent(value);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Supabase update failed: ' + text);
  }
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {

      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await supabaseUpsert({
          user_id: userId,
          subscription_status: subscription.status,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString()
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        await supabaseUpdateByColumn('stripe_subscription_id', subscription.id, {
          subscription_status: subscription.status,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString()
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        await supabaseUpdateByColumn('stripe_subscription_id', subscription.id, {
          subscription_status: 'cancelled',
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString()
        });
        break;
      }

      default:
        console.log('Unhandled event type:', stripeEvent.type);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
