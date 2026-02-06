// Enhanced Global Footer Loader
(function() {
  const footerHTML = `
    <footer style="background: linear-gradient(135deg, rgba(10,10,15,0.95), rgba(26,26,46,0.95)); border-top: 2px solid rgba(0,255,0,0.3); padding: 40px 20px 20px; margin-top: 60px; backdrop-filter: blur(20px);">
      <!-- Quick Stats Bar -->
      <div style="max-width: 1200px; margin: 0 auto 30px; display: flex; justify-content: space-around; padding: 20px; background: rgba(0,255,0,0.05); border-radius: 12px; border: 1px solid rgba(0,255,0,0.2);">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #00ff00;">1.2M+</div>
          <div style="font-size: 12px; color: #00ffff;">Active Users</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #00ff00;">500K+</div>
          <div style="font-size: 12px; color: #00ffff;">Videos Streamed</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #00ff00;">99.9%</div>
          <div style="font-size: 12px; color: #00ffff;">Uptime</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #00ff00;">150+</div>
          <div style="font-size: 12px; color: #00ffff;">Countries</div>
        </div>
      </div>

      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-bottom: 30px;">
        <div>
          <h3 style="color: #00ff00; margin-bottom: 12px; font-size: 18px; font-weight: bold;">🦉 HOOTNER</h3>
          <p style="color: #00ffff; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">Enterprise video streaming platform with AI integration and real-time collaboration.</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
            <span style="background: linear-gradient(135deg, #ff6b6b, #ee5a6f); padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">PyTorch</span>
            <span style="background: linear-gradient(135deg, #4ecdc4, #44a08d); padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">3D U-Net</span>
            <span style="background: linear-gradient(135deg, #a8edea, #fed6e3); padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; color: #000;">HEVC</span>
            <span style="background: linear-gradient(135deg, #00ff00, #00ffff); padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; color: #000;">HDR10</span>
          </div>
          <input type="email" placeholder="Enter your email" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,255,0,0.3); border-radius: 4px; color: #00ff00; font-size: 12px; margin-bottom: 8px;" />
          <button onclick="alert('Subscribed!')" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #00ff00, #00ffff); border: none; border-radius: 4px; color: #000; font-weight: bold; cursor: pointer; font-size: 12px;">Subscribe to Newsletter</button>
        </div>
        <div>
          <h4 style="color: #00ff00; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Platform</h4>
          <a href="/dashboard" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Dashboard</a>
          <a href="/video-player" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Video Player</a>
          <a href="/marketplace" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Marketplace</a>
          <a href="/analytics" style="display: block; color: #00ffff; text-decoration: none; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Analytics</a>
        </div>
        <div>
          <h4 style="color: #00ff00; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Resources</h4>
          <a href="/docs" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Documentation</a>
          <a href="/api" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">API Reference</a>
          <a href="/support" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Support</a>
          <a href="/status" style="display: block; color: #00ffff; text-decoration: none; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">System Status</a>
        </div>
        <div>
          <h4 style="color: #00ff00; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Legal</h4>
          <a href="/privacy" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Privacy Policy</a>
          <a href="/terms" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Terms of Service</a>
          <a href="/security" style="display: block; color: #00ffff; text-decoration: none; margin-bottom: 8px; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Security</a>
          <a href="/compliance" style="display: block; color: #00ffff; text-decoration: none; font-size: 13px; transition: color 0.2s;" onmouseover="this.style.color='#00ff00'" onmouseout="this.style.color='#00ffff'">Compliance</a>
        </div>
      </div>
      <div style="border-top: 1px solid rgba(0,255,0,0.2); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <p style="color: #00ffff; font-size: 13px; margin-bottom: 4px;">© 2026 HOOTNER. All rights reserved.</p>
          <p style="color: #00ffff; font-size: 12px; font-style: italic;">"The Owl Never Sleeps" • <a href="/sitemap" style="color: #00ffff; text-decoration: underline;">Sitemap</a> • <a href="/accessibility" style="color: #00ffff; text-decoration: underline;">Accessibility</a></p>
        </div>
        <div style="display: flex; gap: 16px; align-items: center;">
          <a href="https://github.com" title="GitHub" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">⚡</a>
          <a href="https://discord.com" title="Discord" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">💬</a>
          <a href="https://twitter.com" title="X (Twitter)" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">𝕏</a>
          <a href="https://facebook.com" title="Facebook" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">👍</a>
          <a href="https://youtube.com" title="YouTube" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">▶️</a>
          <a href="https://tiktok.com" title="TikTok" style="color: #00ffff; font-size: 20px; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🎵</a>
        </div>
      </div>
    </footer>
  `;

  function loadFooter() {
    if (!document.querySelector('footer')) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
  } else {
    loadFooter();
  }
})();
