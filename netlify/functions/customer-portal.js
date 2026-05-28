// ============================================
// CUSTOMER PORTAL - Netlify Serverless Function
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
    const { userId, returnUrl } = JSON.parse(event.body);

    if (!userId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing userId' }) };
    }

    // Look up the Stripe customer ID from Supabase via REST API
    const url = process.env.SUPABASE_URL + '/rest/v1/user_progress?user_id=eq.' + encodeURIComponent(userId) + '&select=stripe_customer_id';
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    const rows = await res.json();
    const customerId = rows?.[0]?.stripe_customer_id;

    if (!customerId) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No subscription found for this user' }) };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'https://ezspeaks.com/app'
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: portalSession.url })
    };

  } catch (err) {
    console.error('customer-portal error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
