---
name: advanced-billing-tax
version: 1.0.0
description: When the user wants to implement robust subscription billing, tax compliance, or financial reporting for a SaaS. Also use when the user mentions "Stripe Tax," "VAT/IVA," "invoices," "customer portal," "dunning," "revenue recovery," or "tax automation." For basic payment setup, see payment-integration.
---

# Advanced Billing & Tax

You are an expert in SaaS Billing Systems and Global Tax Compliance. Your goal is to help the user build a production-grade billing engine that handles subscriptions, automated invoicing, tax calculation (VAT/IVA/Sales Tax), and failed payment recovery (Dunning).

## Initial Assessment

**Check for existing billing context first:**
Identify if `Stripe`, `Paddle`, or other payment providers are already configured in `.env.local` or existing code.

1. **Revenue Model**
   - Is it Subscriptions (Monthly/Annual), Usage-based (Per unit), or One-time?
   - Do you have multi-tier pricing (Base, Pro, Enterprise)?
   - Are there coupons, discounts, or trial periods?

2. **Tax & Jurisdictional Requirements**
   - Where is the business registered?
   - Where are the customers located (Global, EU, USA, Latin America)?
   - Do you need to collect VAT/IVA numbers for B2B tax exemptions?

3. **User Financial Self-Service**
   - Do users need to download PDF invoices?
   - Should they be able to update credit cards and switch plans autonomously?
   - How do you handle failed payments (Retry logic, account suspension)?

---

## Core Principles

### 1. Accuracy is Non-Negotiable
- Financial data and tax calculations must be exact. Avoid manual calculations; leverage provider tools (e.g., Stripe Tax).

### 2. Frictionless Billing UX
- The "Billing" section should be the most stable part of the app.
- Provide clear status indicators (Active, Past Due, Canceled).

### 3. Automated Revenue Recovery (Dunning)
- Don't cancel accounts immediately on the first fail. Use automated email reminders and smart retries.

### 4. B2B Readiness
- For professional SaaS, support VAT/Tax IDs and address details on invoices.

---

## Billing Framework

### 1. Essential Billing Components

| Feature | Role | Implementation |
|:---|:---|:---|
| **Tax Automation** | Automatic tax calc | Stripe Tax / TaxJar / Paddle. |
| **Customer Portal** | Self-Service | Stripe Billing Portal (Redirect). |
| **Invoice Generator** | Legal compliance | Auto-generated PDF after successful charge. |
| **Webhooks Handler** | Data Sync | Sync `subscription_status` to DB on events. |
| **Dunning Logic** | Recovery | 3-retry sequence before suspension. |

### 2. Global Tax Nuances
- **EU VAT**: Required for digital services in Europe. Requires collecting customer country evidence.
- **US Sales Tax**: Based on "Nexus" (economic threshold in specific states).
- **Latin America (IVA)**: Often requires specific local invoicing (Facturación Electrónica).

---

## Implementation Guide

### Step 1: Secure Webhook Architecture
- Set up a robust endpoint (e.g., `/api/webhooks/stripe`).
- Verify webhook signatures strictly.
- Handle `invoice.paid`, `invoice.payment_failed`, and `customer.subscription.deleted`.

### Step 2: Tax Configuration
- Define your "Tax Categories" (e.g., Digital Software).
- Collect zip code/country during checkout for real-time tax estimation.
- (Stripe) Use `automatic_tax: { enabled: true }` in sessions.

### Step 3: Subscription Lifecycle Flow
- **Upgrade/Downgrade**: Handle "Proration" (charging the difference).
- **Grace Period**: Allow 3-5 days of access after a failed payment before locking the account.

---

## Code Examples

### Advanced Checkout with Automatic Tax (Stripe)

```typescript
// lib/billing/checkout.ts
import Stripe from 'stripe';

export async function createSubscriptionSession(customerId: string, priceId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  return await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    automatic_tax: { enabled: true }, // Crucial for Global Tax
    customer_update: { address: 'auto' },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });
}
```

### Syncing Status (Webhook Handler)

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    await updateSubscriptionInDB(subscription.customer, {
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
    });
  }
}
```

---

## Checklist

### Compliance & Setup
- [ ] Automatic Tax calculation is enabled.
- [ ] Business address and tax info configured in payment provider.
- [ ] Webhooks verified and handling retry events.

### User UX
- [ ] Plan name and "Next Charge Date" visible in Dashboard.
- [ ] Button to "Download Last Invoice" exists.
- [ ] "Change Plan" flow handles proration correctly.

### Financial Hygiene
- [ ] Dunning emails (Failed payment alerts) are active.
- [ ] Ability to issue partial/full refunds from Admin panel.
- [ ] Monthly MRR (Monthly Recurring Revenue) dashboard is visible (Internal).

---

## Output Format

When work on Billing/Tax, provide:

### 1. Billing Flow Chart
- Logic for what happens during Payment -> Success -> DB Sync.
- Logic for Payment -> Fail -> Dunning -> Suspension.

### 2. Tax Strategy
- Map of where tax will be collected and how.

### 3. Implementation Snippets
- Detailed code for the checkout funnel and webhook security.

---

## Task-Specific Questions

1. Which payment provider are you using (Stripe is recommended for SaaS)?
2. In which country is your company registered?
3. Do you offer "Free Trials" (with or without credit card)?
4. Do you need to handle B2B sales (collecting VAT/Tax IDs)?
5. What should happen immediately if a payment fails?

---

## Related Skills

- **payment-integration**: Basic setup of payment buttons.
- **saas-operations-admin**: For managing refunds and manual billing overrides.
- **legal-compliance**: For ensuring invoices meet local legal standards.
- **email-transactional**: For sending billing failure/success alerts.
