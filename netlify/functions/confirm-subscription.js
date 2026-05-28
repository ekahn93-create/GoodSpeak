// ============================================
// CONFIRM SUBSCRIPTION - Netlify Serverless Function
// Called by browser immediately after Stripe checkout redirect.
// Uses fetch against Supabase REST API directly (no SDK) to avoid
// the WebSocket crash on Node 20 with @supabase/supabase-js v2.
// ============================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  try {
    const { sessionId } = JSON.parse(event.body);
    if (!sessionId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing sessionId' }) };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.status !== 'complete') {
      return { statusCode: 402, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Payment not completed' }) };
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No userId in session metadata' }) };
    }

    const subscription = session.subscription;
    const status = (typeof subscription === 'object' ? subscription?.status : null) || 'trialing';
    const subId = typeof subscription === 'object' ? subscription?.id : subscription;
    const periodEnd = typeof subscription === 'object' && subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    const url = process.env.SUPABASE_URL + '/rest/v1/user_progress';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        subscription_status: status,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subId,
        subscription_end: periodEnd
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Supabase upsert error:', text);
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: text }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status })
    };

  } catch (err) {
    console.error('confirm-subscription error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
