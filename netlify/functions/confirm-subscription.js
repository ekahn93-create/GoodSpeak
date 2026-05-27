// ============================================
// CONFIRM SUBSCRIPTION - Netlify Serverless Function
// Called by browser immediately after Stripe checkout redirect.
// Verifies the Stripe session and writes subscription status to Supabase
// directly — does not rely on the webhook arriving in time.
// ============================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

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

    // Retrieve the checkout session from Stripe to verify it's real and paid
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return { statusCode: 402, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Payment not completed' }) };
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No userId in session metadata' }) };
    }

    const subscription = session.subscription;
    const status = subscription?.status || 'trialing';
    const periodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        subscription_status: status,
        stripe_customer_id: session.customer,
        stripe_subscription_id: typeof subscription === 'string' ? subscription : subscription?.id,
        subscription_end: periodEnd
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: error.message }) };
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
