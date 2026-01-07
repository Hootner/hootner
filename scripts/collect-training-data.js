// Collect HOOTNER training data for LLM scaling
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'services/hootner-training-data.txt';

// Simulated data sources (replace with real DB queries)
const dataSources = {
  videoTitles: [
    'hootner live stream gaming session',
    'tutorial how to use video editor',
    'music performance live concert',
    'coding tutorial javascript basics',
    'product review tech gadgets',
  ],
  
  videoDescriptions: [
    'welcome to hootner platform where creators share amazing content',
    'this video shows how to build web applications using modern frameworks',
    'live music performance featuring original compositions',
    'learn programming fundamentals step by step',
    'comprehensive review of latest technology products',
  ],
  
  userComments: [
    'great video thanks for sharing',
    'this helped me understand the concept',
    'amazing content keep it up',
    'can you make more tutorials like this',
    'subscribed and looking forward to more',
  ],
  
  chatMessages: [
    'hello everyone welcome to the stream',
    'what video should i watch next',
    'the platform is really fast and smooth',
    'love the new features you added',
    'how do i upload my own videos',
  ]
};

function collectData() {
  console.log('Collecting HOOTNER training data...\n');
  
  let corpus = '';
  let stats = { total: 0, chars: 0 };
  
  // Collect from each source
  for (const [source, items] of Object.entries(dataSources)) {
    console.log(`Collecting from ${source}...`);
    const text = items.join('\n') + '\n';
    corpus += text;
    stats[source] = items.length;
    stats.total += items.length;
    stats.chars += text.length;
  }
  
  // Add existing training data
  const existingData = fs.readFileSync('services/transformer-llm-service.py', 'utf8');
  const match = existingData.match(/TRAINING_DATA = """([\s\S]*?)"""/);
  if (match) {
    corpus += match[1];
    stats.chars += match[1].length;
  }
  
  // Save to file
  fs.writeFileSync(OUTPUT_FILE, corpus);
  
  console.log('\n✅ Data collection complete!');
  console.log(`\nStatistics:`);
  console.log(`- Video titles: ${stats.videoTitles || 0}`);
  console.log(`- Descriptions: ${stats.videoDescriptions || 0}`);
  console.log(`- Comments: ${stats.userComments || 0}`);
  console.log(`- Chat messages: ${stats.chatMessages || 0}`);
  console.log(`- Total items: ${stats.total}`);
  console.log(`- Total characters: ${stats.chars.toLocaleString()}`);
  console.log(`\nSaved to: ${OUTPUT_FILE}`);
  console.log(`\nNext: Train with larger dataset`);
  console.log(`python services/transformer-llm-service.py`);
}

// TODO: Replace with real data sources
console.log('⚠️  Using simulated data. Replace with real DB queries:\n');
console.log('// Example: Query MongoDB');
console.log('const videos = await db.collection("videos").find().toArray();');
console.log('const comments = await db.collection("comments").find().toArray();\n');

collectData();
