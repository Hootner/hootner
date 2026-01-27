// Dynamic HTML Generation in Lambda
export const handler = async (event) => {
  const path = event.requestContext?.http?.path || '/';

  if (path === '/dashboard') {
    // Get user's real data from database
    const userData = await getUserData(event.headers.authorization);
    const currentPricing = await getCurrentPricing();

    // Generate custom HTML for THIS user
    const html = `
<!DOCTYPE html>
<html>
<head><title>Dashboard - ${userData.name}</title></head>
<body>
    <h1>Welcome back, ${userData.name}!</h1>
    <div>Your Plan: ${userData.plan} (${currentPricing[userData.plan]})</div>
    <div>Videos Uploaded: ${userData.videoCount}</div>
    <div>Storage Used: ${userData.storageUsed}GB</div>
    <div>Monthly Bill: $${userData.currentBill}</div>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  // Generate pricing page with real-time prices
  if (path === '/pricing') {
    const pricing = await getCurrentPricing();
    const html = generatePricingHTML(pricing);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }
};

// Each user gets different HTML based on their data
async function getUserData() {
  // Query DynamoDB for user-specific info
  return {
    name: 'John',
    plan: 'growth',
    videoCount: 45,
    storageUsed: 12.5,
    currentBill: 149.99
  };
}

async function getCurrentPricing() {
  return { starter: '$29.99', growth: '$149.99', enterprise: '$999.99' };
}

function generatePricingHTML() {
  return '<!DOCTYPE html><html><body><h1>Pricing</h1></body></html>';
}
