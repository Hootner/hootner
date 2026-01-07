#!/usr/bin/env node

/**
 * Process X Archive for Training Data
 * Extracts all tweets from your downloaded archive
 */

const fs = require('fs');
const path = require('path');

function processXArchive(archivePath) {
  console.log('🦉 Processing X Archive for HOOTNER\n');
  
  // X archive contains tweets.js or tweet.js
  const possibleFiles = ['tweets.js', 'tweet.js', 'data/tweets.js', 'data/tweet.js'];
  let tweetsFile = null;
  
  for (const file of possibleFiles) {
    const fullPath = path.join(archivePath, file);
    if (fs.existsSync(fullPath)) {
      tweetsFile = fullPath;
      break;
    }
  }
  
  if (!tweetsFile) {
    console.log('❌ tweets.js not found');
    console.log('\n📥 Download your X archive:');
    console.log('1. Go to https://twitter.com/settings/download_your_data');
    console.log('2. Request archive (takes ~24 hours)');
    console.log('3. Download and extract ZIP');
    console.log('4. Run: node scripts/process-x-archive.js path/to/extracted/folder\n');
    return;
  }
  
  console.log(`✅ Found: ${tweetsFile}\n`);
  
  // Read and parse tweets
  let content = fs.readFileSync(tweetsFile, 'utf8');
  
  // Remove JavaScript variable declaration
  content = content.replace(/^window\.YTD\.tweets?\.part0\s*=\s*/, '');
  content = content.replace(/^window\.YTD\.tweet\.part0\s*=\s*/, '');
  
  const tweets = JSON.parse(content);
  console.log(`📊 Total tweets: ${tweets.length}`);
  
  // Extract text
  const texts = tweets.map(item => {
    const tweet = item.tweet || item;
    let text = tweet.full_text || tweet.text || '';
    
    // Clean up
    text = text.replace(/https?:\/\/\S+/g, ''); // Remove URLs
    text = text.replace(/@\w+/g, ''); // Remove mentions
    text = text.replace(/#/g, ''); // Remove hashtag symbol
    text = text.replace(/RT\s+:/g, ''); // Remove RT
    
    return text.trim();
  }).filter(t => t.length > 10); // Only keep substantial tweets
  
  const output = texts.join('\n');
  
  // Save
  const outputPath = path.join(process.cwd(), 'services/training-data-x-account.txt');
  fs.writeFileSync(outputPath, output, 'utf8');
  
  console.log(`\n✅ Saved to: ${outputPath}`);
  console.log(`📊 Tweets processed: ${texts.length}`);
  console.log(`📊 Characters: ${output.length.toLocaleString()}`);
  console.log(`📊 Words: ${output.split(/\s+/).length.toLocaleString()}`);
  
  // Append to combined
  const combinedPath = path.join(process.cwd(), 'services/training-data-combined.txt');
  if (fs.existsSync(combinedPath)) {
    fs.appendFileSync(combinedPath, '\n\n' + output);
    console.log(`✅ Appended to training-data-combined.txt`);
  }
  
  console.log('\n▶️  Re-run training:');
  console.log('   python services/transformer-llm-service.py\n');
}

// Run
if (require.main === module) {
  const archivePath = process.argv[2] || '.';
  processXArchive(archivePath);
}

module.exports = processXArchive;
