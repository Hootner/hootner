/**
 * Subscription & Billing Functions for Settings Page
 */

// Load subscription status on page load
async function loadSubscriptionStatus() {
  try {
    const response = await fetch('/api/subscriptions/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      document.getElementById('current-plan').textContent = data.planId || 'Free';
      document.getElementById('plan-status').textContent = data.status || 'N/A';
      document.getElementById('next-billing').textContent = data.nextBillingDate ? 
        new Date(data.nextBillingDate).toLocaleDateString() : 'N/A';
    }
  } catch (error) {
    console.error('Error loading subscription:', error);
    document.getElementById('current-plan').textContent = 'Free';
  }
}

// Subscribe to a plan
async function subscribeToPlan(planId) {
  if (!confirm(`Subscribe to ${planId} plan?`)) return;
  
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ planId })
    });
    
    if (response.ok) {
      alert(`Successfully subscribed to ${planId} plan!`);
      await loadSubscriptionStatus();
      await loadBillingHistory();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to subscribe'}`);
    }
  } catch (error) {
    console.error('Error subscribing:', error);
    alert('Failed to subscribe. Please try again.');
  }
}

// Cancel subscription
async function cancelSubscription() {
  if (!confirm('Are you sure you want to cancel your subscription?')) return;
  
  try {
    const response = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      alert('Subscription cancelled successfully');
      await loadSubscriptionStatus();
    } else {
      alert('Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    alert('Failed to cancel subscription. Please try again.');
  }
}

// Load billing history
async function loadBillingHistory() {
  try {
    const response = await fetch('/api/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      const payments = await response.json();
      const tbody = document.getElementById('billing-table-body');
      
      if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 16px; text-align: center;">No billing history yet</td></tr>';
      } else {
        tbody.innerHTML = payments.map(payment => `
          <tr style="border-bottom: 1px solid rgba(0,255,0,0.1);">
            <td style="padding: 8px;">${new Date(payment.createdAt).toLocaleDateString()}</td>
            <td style="padding: 8px;">${payment.description || 'Subscription'}</td>
            <td style="padding: 8px; text-align: right;">$${(payment.amount / 100).toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">
              <span style="color: ${payment.status === 'succeeded' ? '#00ff00' : '#ffff00'};">
                ${payment.status}
              </span>
            </td>
            <td style="padding: 8px; text-align: right;">
              <a href="#" onclick="downloadInvoice('${payment.id}')" style="color: #00ffff;">Download</a>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading billing history:', error);
  }
}

// Add payment method
function addPaymentMethod() {
  alert('Payment method integration with Stripe would be implemented here.\nFor now, this is a placeholder.');
}

// Download invoice
function downloadInvoice(paymentId) {
  alert(`Downloading invoice for payment ${paymentId}...\nIn production, this would generate a PDF invoice.`);
}

// Load creator revenue
async function loadCreatorRevenue() {
  try {
    const response = await fetch('/api/payments/revenue', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      document.getElementById('creator-revenue').style.display = 'block';
      document.getElementById('revenue-month').textContent = `$${data.thisMonth.toFixed(2)}`;
      document.getElementById('revenue-total').textContent = `$${data.total.toFixed(2)}`;
      document.getElementById('revenue-pending').textContent = `$${data.pending.toFixed(2)}`;
    }
  } catch (error) {
    console.error('Error loading creator revenue:', error);
  }
}

// Request payout
async function requestPayout() {
  if (!confirm('Request payout of pending balance?')) return;
  
  try {
    const response = await fetch('/api/payments/payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      alert('Payout request submitted! Funds will be transferred within 3-5 business days.');
      await loadCreatorRevenue();
    } else {
      alert('Failed to request payout. Please try again.');
    }
  } catch (error) {
    console.error('Error requesting payout:', error);
    alert('Failed to request payout. Please try again.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('subscription-tab')) {
    loadSubscriptionStatus();
    loadBillingHistory();
    loadCreatorRevenue();
  }
});
