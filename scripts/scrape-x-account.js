#!/usr/bin/env node

/**
 * X (Twitter) Account Scraper for Training Data
 * Expands HOOTNER vocabulary with your social media content
 */

const fs = require('fs');
const path = require('path');

// Note: X API requires authentication
// Get your keys from: https://developer.twitter.com/en/portal/dashboard

const CONFIG = {
  // Add your X API credentials
  apiKey: process.env.X_API_KEY || 'YOUR_API_KEY',
  apiSecret: process.env.X_API_SECRET || 'YOUR_API_SECRET',
  bearerToken: process.env.X_BEARER_TOKEN || 'YOUR_BEARER_TOKEN',
  username: process.env.X_USERNAME || 'your_username',
  outputFile: 'services/training-data-x-account.txt'
};

class XAccountScraper {
  constructor(config) {
    this.config = config;
    this.tweets = [];
  }

  /**
   * Fetch tweets using X API v2
   */
  async fetchTweets(maxResults = 100) {
    const url = `https://api.twitter.com/2/users/by/username/${this.config.username}`;
    
    try {
      // Get user ID first
      const userResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`API error: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      const userId = userData.data.id;
      
      // Fetch tweets
      const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`;
      
      const tweetsResponse = await fetch(tweetsUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`
        }
      });
      
      if (!tweetsResponse.ok) {
        throw new Error(`Tweets API error: ${tweetsResponse.status}`);
      }
      
      const tweetsData = await tweetsResponse.json();
      this.tweets = tweetsData.data || [];
      
      console.log(`✅ Fetched ${this.tweets.length} tweets`);
      return this.tweets;
      
    } catch (error) {
      console.error('❌ Error fetching tweets:', error.message);
      console.log('\n💡 Setup instructions:');
      console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
      console.log('2. Create a project and app');
      console.log('3. Get your Bearer Token');
      console.log('4. Set environment variables:');
      console.log('   export X_BEARER_TOKEN="your_token"');
      console.log('   export X_USERNAME="your_username"');
      return [];
    }
  }

  /**
   * Extract text content from tweets
   */
  extractText() {
    const texts = this.tweets.map(tweet => {
      // Remove URLs
      let text = tweet.text.replace(/https?:\/\/\S+/g, '');
      // Remove mentions
      text = text.replace(/@\w+/g, '');
      // Remove hashtags (keep the word)
      text = text.replace(/#/g, '');
      return text.trim();
    }).filter(t => t.length > 0);
    
    return texts.join('\n');
  }

  /**
   * Save to training data file
   */
  save() {
    const content = this.extractText();
    const outputPath = path.join(process.cwd(), this.config.outputFile);
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`\n📄 Saved to: ${outputPath}`);
    console.log(`📊 Characters: ${content.length}`);
    console.log(`📊 Words: ${content.split(/\s+/).length}`);
    
    // Append to combined training data
    const combinedPath = path.join(process.cwd(), 'services/training-data-combined.txt');
    if (fs.existsSync(combinedPath)) {
      fs.appendFileSync(combinedPath, '\n\n' + content);
      console.log(`✅ Appended to training-data-combined.txt`);
    }
  }

  /**
   * Run scraper
   */
  async run() {
    console.log('🦉 X Account Scraper for HOOTNER\n');
    console.log(`Fetching tweets from @${this.config.username}...\n`);
    
    await this.fetchTweets(100);
    
    if (this.tweets.length > 0) {
      this.save();
      console.log('\n✨ Scraping complete!');
      console.log('\n▶️  Re-run training to include X data:');
      console.log('   python services/transformer-llm-service.py\n');
    }
  }
}

// Alternative: Manual input if API not available
function manualInput() {
  console.log('📝 Manual X Content Input\n');
  console.log('Paste your tweets (one per line), then press Ctrl+D (Unix) or Ctrl+Z (Windows):\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const lines = [];
  rl.on('line', (line) => {
    lines.push(line);
  });
  
  rl.on('close', () => {
    const content = lines.join('\n');
    const outputPath = path.join(process.cwd(), 'services/training-data-x-account.txt');
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`\n✅ Saved ${lines.length} tweets to ${outputPath}`);
  });
}

// Run
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--manual')) {
    manualInput();
  } else {
    const scraper = new XAccountScraper(CONFIG);
    scraper.run().catch(console.error);
  }
}

module.exports = XAccountScraper;
