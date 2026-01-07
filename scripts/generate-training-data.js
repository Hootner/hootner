// Generate comprehensive HOOTNER training data
const fs = require('fs');

const data = {
  videoTitles: [
    'hootner live stream gaming session',
    'tutorial how to use video editor',
    'music performance live concert',
    'coding tutorial javascript basics',
    'product review tech gadgets',
    'cooking show recipe demonstration',
    'fitness workout routine guide',
    'travel vlog exploring new cities',
    'art tutorial digital painting',
    'podcast episode tech discussion',
    'documentary nature wildlife',
    'comedy sketch funny moments',
    'educational science experiment',
    'sports highlights game recap',
    'movie review latest releases',
    'diy project home improvement',
    'fashion haul clothing review',
    'book review literature discussion',
    'gaming walkthrough strategy guide',
    'music production beat making',
    'photography tips camera settings',
    'animation showcase motion graphics',
    'interview celebrity conversation',
    'news update current events',
    'reaction video trending content',
    'unboxing new product reveal',
    'challenge video fun competition',
    'collaboration creator partnership',
    'behind the scenes production',
    'q and a session audience questions',
  ],

  descriptions: [
    'welcome to hootner platform where creators share amazing content daily',
    'this video shows how to build web applications using modern frameworks and tools',
    'live music performance featuring original compositions and cover songs',
    'learn programming fundamentals step by step with practical examples',
    'comprehensive review of latest technology products and gadgets',
    'follow along as we create delicious meals with simple ingredients',
    'get fit with effective workout routines for all fitness levels',
    'explore beautiful destinations and discover hidden gems around the world',
    'master digital art techniques with professional tips and tricks',
    'deep dive into technology trends and industry insights',
    'discover the wonders of nature through stunning cinematography',
    'laugh along with hilarious sketches and comedy routines',
    'explore fascinating scientific concepts through hands-on experiments',
    'catch all the action from the biggest sporting events',
    'honest reviews and analysis of the latest films and shows',
    'transform your space with creative diy projects and ideas',
    'stay stylish with the latest fashion trends and outfit ideas',
    'thoughtful analysis and discussion of great literature',
    'complete guides to help you master your favorite games',
    'learn music production from scratch with industry professionals',
    'improve your photography skills with expert techniques',
    'stunning animations and motion graphics showcases',
    'exclusive interviews with industry leaders and celebrities',
    'stay informed with the latest news and current events',
    'watch genuine reactions to viral and trending content',
    'exciting reveals of new products and technology',
    'fun challenges and competitions with amazing prizes',
    'collaborative content featuring multiple talented creators',
    'exclusive behind the scenes look at content creation',
    'answering your questions and connecting with the community',
  ],

  comments: [
    'great video thanks for sharing this content',
    'this helped me understand the concept much better',
    'amazing content please keep it up',
    'can you make more tutorials like this one',
    'subscribed and looking forward to more videos',
    'this is exactly what i was looking for',
    'very informative and well explained',
    'love your content keep up the great work',
    'learned so much from this video',
    'please do a follow up video on this topic',
    'best tutorial i have seen on this subject',
    'your channel deserves more subscribers',
    'thank you for making this so easy to understand',
    'watching from start to finish amazing',
    'this changed my perspective completely',
    'cant wait for the next video',
    'you explained this better than my teacher',
    'bookmarking this for future reference',
    'sharing this with all my friends',
    'this is pure gold thank you',
  ],

  chatMessages: [
    'hello everyone welcome to the stream',
    'what video should i watch next',
    'the platform is really fast and smooth',
    'love the new features you added',
    'how do i upload my own videos',
    'can someone help me with settings',
    'this stream quality is amazing',
    'when is the next live event',
    'thanks for the recommendation',
    'just subscribed to your channel',
    'the community here is so friendly',
    'how do i enable notifications',
    'this platform is better than others',
    'great job on the latest update',
    'where can i find more content like this',
    'the video player works perfectly',
    'love the dark mode feature',
    'how do i share videos with friends',
    'the search function is very helpful',
    'thanks for creating this platform',
  ],

  platformFeatures: [
    'hootner provides seamless video streaming with adaptive bitrate',
    'upload videos in multiple formats and resolutions',
    'real-time collaboration tools for content creators',
    'advanced analytics dashboard tracks viewer engagement',
    'monetization options include ads subscriptions and donations',
    'live streaming with chat and interactive features',
    'content moderation powered by artificial intelligence',
    'recommendation engine suggests personalized content',
    'mobile apps available for ios and android',
    'offline viewing with download functionality',
    'playlist creation and management tools',
    'social features including likes comments and shares',
    'creator studio for managing your channel',
    'video editor built into the platform',
    'thumbnail generator and customization',
    'scheduled publishing for planned content',
    'community posts and updates feed',
    'direct messaging between users',
    'notification system for new content',
    'accessibility features including captions',
  ],

  technicalDetails: [
    'microservices architecture ensures scalability and reliability',
    'kubernetes orchestration manages container deployments',
    'docker containers provide consistent environments',
    'redis caching improves response times significantly',
    'mongodb stores user data and content metadata',
    'graphql api enables flexible data queries',
    'websocket connections power real-time features',
    'cdn distribution ensures fast global access',
    'load balancing distributes traffic efficiently',
    'automated backups protect against data loss',
    'monitoring systems track performance metrics',
    'security measures include encryption and authentication',
    'rate limiting prevents abuse and overload',
    'blue-green deployments enable zero downtime',
    'chaos engineering tests system resilience',
    'ci cd pipelines automate testing and deployment',
    'prometheus collects detailed system metrics',
    'grafana visualizes performance dashboards',
    'istio service mesh manages microservices',
    'traefik handles reverse proxy and routing',
  ],

  userActions: [
    'users can create and customize their profiles',
    'subscribe to favorite channels for updates',
    'create playlists to organize content',
    'like and comment on videos',
    'share content across social media',
    'report inappropriate content for review',
    'adjust video quality and playback speed',
    'enable captions and subtitles',
    'download videos for offline viewing',
    'participate in live chat during streams',
    'support creators through donations',
    'purchase premium subscriptions',
    'customize notification preferences',
    'manage privacy and security settings',
    'view watch history and analytics',
    'follow trending topics and hashtags',
    'join community discussions',
    'collaborate with other creators',
    'schedule live streaming events',
    'access creator tools and resources',
  ],
};

let corpus = '';
let stats = { total: 0, chars: 0 };

for (const [category, items] of Object.entries(data)) {
  const text = items.join('\n') + '\n\n';
  corpus += text;
  stats[category] = items.length;
  stats.total += items.length;
  stats.chars += text.length;
}

fs.writeFileSync('services/hootner-training-data.txt', corpus);

console.log('✅ Training data generated!\n');
console.log('Statistics:');
Object.entries(stats).forEach(([key, val]) => {
  if (key !== 'total' && key !== 'chars') {
    console.log(`  ${key}: ${val} items`);
  }
});
console.log(`\nTotal: ${stats.total} items`);
console.log(`Characters: ${stats.chars.toLocaleString()}`);
console.log(`\nSaved to: services/hootner-training-data.txt`);
console.log(`\nNext: python services/transformer-llm-service.py`);
