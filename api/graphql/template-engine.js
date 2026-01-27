// Template-based Dynamic Generation
const templates = {
  dashboard: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Dashboard - ${data.user.name}</title>
    <link rel="stylesheet" href="/styles/hootner.css">
</head>
<body class="bg-gray-900 text-white">
    <header class="bg-gray-800 p-4" role="banner">
        <h1 class="text-2xl">🦉 HOOTNER - Welcome ${data.user.name}!</h1>
    </header>

    <main class="p-8" role="main">
        <div class="grid grid-cols-4 gap-4 mb-8" role="region" aria-label="Statistics overview">
            ${data.stats.map(stat => `
                <div class="bg-gray-800 p-6 rounded-lg" role="article" aria-label="${stat.label}">
                    <div class="text-3xl font-bold text-${stat.color}-400" aria-label="${stat.label} value">${stat.value}</div>
                    <div class="text-gray-400">${stat.label}</div>
                </div>
            `).join('')}
        </div>

        <div class="bg-gray-800 p-6 rounded-lg" role="region" aria-label="Recent videos">
            <h2 class="text-xl font-bold mb-4">Recent Videos</h2>
            ${data.recentVideos.map((video) => `
                <a href="/video/${video.id}" class="flex items-center space-x-4 p-4 bg-gray-700 rounded mb-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" tabindex="0" aria-label="View ${video.title}">
                    <img src="${video.thumbnail}" alt="${video.title} thumbnail" class="w-16 h-16 rounded">
                    <div>
                        <div class="font-semibold">${video.title}</div>
                        <div class="text-sm text-gray-400">${video.uploadDate}</div>
                    </div>
                    <div class="ml-auto text-green-400" aria-label="${video.views} views">${video.views} views</div>
                </a>
            `).join('')}
        </div>
    </main>

    <script>
        // Rate limiting for keyboard navigation (anti-bot)
        let tabCount = 0;
        let tabTimer = Date.now();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                tabCount++;
                if (Date.now() - tabTimer < 1000 && tabCount > 10) {
                    e.preventDefault(); // Block rapid tabbing (bot behavior)
                    console.warn('Suspicious keyboard activity detected');
                }
                if (Date.now() - tabTimer > 1000) { tabCount = 0; tabTimer = Date.now(); }
            }
        });

        // Real-time updates for THIS specific user
        setInterval(async () => {
            const response = await fetch('/api/user/${data.user.id}/live-stats');
            const liveData = await response.json();
            document.getElementById('live-views').textContent = liveData.totalViews;
            document.getElementById('live-earnings').textContent = '$' + liveData.earnings;
        }, 5000);
    </script>
</body>
</html>`,

  pricing: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="/styles/hootner.css">
</head>
<body class="bg-gray-900 text-white">
    <div class="grid grid-cols-3 gap-8" role="list" aria-label="Pricing plans">
        ${data.plans.map(plan => `
            <div class="bg-gray-800 p-8 rounded-xl ${plan.popular ? 'border-2 border-purple-500' : ''}" role="listitem" tabindex="0" aria-label="${plan.name} plan, $${plan.currentPrice}${plan.popular ? ', most popular' : ''}">
                ${plan.popular ? '<span class="sr-only">Most popular plan</span>' : ''}
                <h3 class="text-xl font-bold">${plan.name}</h3>
                <div class="text-3xl font-bold text-purple-400" aria-label="Current price">$${plan.currentPrice}</div>
                <div class="text-sm text-gray-400" aria-label="Original price was $${plan.originalPrice}, now ${plan.discount}% off">Was $${plan.originalPrice} (${plan.discount}% off!)</div>
                <div class="text-xs text-gray-500" aria-label="Price decreases monthly, currently year ${data.currentYear} of 10">Price decreases monthly - Year ${data.currentYear}/10</div>
            </div>
        `).join('')}
    </div>
</body>
</html>`
};

export const handler = async (event) => {
  const path = event.requestContext?.http?.path || '/';

  if (path === '/dashboard') {
    const userData = { user: { name: 'User', id: '123' }, stats: [], recentVideos: [] };
    const html = templates.dashboard(userData);
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
  }

  if (path === '/pricing') {
    const pricingData = { plans: [], currentYear: 1 };
    const html = templates.pricing(pricingData);
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
  }
};
