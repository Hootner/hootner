import { useState, useEffect, useRef, useCallback } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Heart, ChatCircle, Share, BookmarkSimple, DotsThree, Play, Sparkle, Eye, TrendUp, Fire, Users, Image as ImageIcon, GifIcon, CaretDown, MagnifyingGlass, SlidersHorizontal, Lightning, Repeat } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Textarea } from '@/shared/ui/textarea'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import type { User } from '@/shared/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string
  author: {
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  videoUrl?: string
  videoThumbnail?: string
  videoDuration?: number
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
  trending?: boolean
  aiGenerated?: boolean
}

interface Comment {
  id: string
  postId: string
  author: {
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
}

interface SocialFeedProps {
  currentUser: User
}

export default function SocialFeed({ currentUser }: SocialFeedProps) {
  const [posts, setPosts] = usePlatformKV<Post[]>('hootner-social-posts', [])
  const [comments, setComments] = usePlatformKV<Comment[]>('hootner-social-comments', [])
  const [newPostContent, setNewPostContent] = useState('')
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'trending'>('for-you')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [commentText, setCommentText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const safePosts = posts || []
  const safeComments = comments || []

  useEffect(() => {
    if (safePosts.length === 0) {
      generateInitialPosts()
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredPosts.length) {
          setDisplayCount((prev) => Math.min(prev + 10, filteredPosts.length))
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [displayCount, safePosts.length])

  const generateInitialPosts = async () => {
    const videoThumbnails = [
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1494192785370-e91e091d544f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1518930259200-534e95e24f98?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1460039230329-42fb06d65ccd?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=450&fit=crop'
    ]

    const usernames = [
      'sarah_creator', 'tech_insights', 'visual_artist', 'filmmaking_pro', 'content_wizard',
      'creative_mind', 'video_genius', 'motion_master', 'ai_storyteller', 'pixel_perfect',
      'cinematic_pro', 'digital_creator', 'media_maestro', 'studio_viral', 'vision_lab',
      'frame_forge', 'edit_master', 'color_grader', 'sound_wizard', 'vfx_artist',
      'production_hero', 'film_fanatic', 'content_king', 'video_vibe', 'creative_spark',
      'motion_blur', 'render_farm', 'post_production', 'director_cut', 'scene_stealer'
    ]

    const contentTemplates = [
      'Just dropped my latest cinematic video essay! 🎬 The AI insights helped me identify the perfect emotional beats.',
      'The AI-generated scene detection is mind-blowing 🤯 It found transitions I didn\'t even notice myself.',
      'Created this entirely with AI video synthesis 🎨✨ The neural engine produced Netflix-quality output.',
      'Collaborative workspace feature is a lifesaver for remote teams! We cut our editing time in half.',
      'The 10K UHD HDR10 + Dolby Atmos export is absolutely stunning 😍 Client was blown away.',
      'Finally finished my documentary series! The color grading tools made it look professional.',
      'This neural network understands composition better than most humans 🧠',
      'Behind the scenes of my latest project. The rendering speed is incredible!',
      'Just exported in 8K and the detail is breathtaking. This platform is next level.',
      'The real-time collaboration saved our project. Everyone can edit simultaneously!',
      'AI-powered audio sync is magic ✨ No more manual alignment!',
      'HDR color grading has never been easier. These presets are fire 🔥',
      'My client approved the first draft! The AI suggestions were spot on.',
      'Motion tracking feature is insane. It saved me hours of work.',
      'The automatic subtitle generation is incredibly accurate. Multilingual too!',
      'Just discovered the neural upscaling - turned my 1080p into 4K masterpiece!',
      'Timeline collaboration works flawlessly. No more version conflicts!',
      'The sentiment analysis helped me pace my documentary perfectly.',
      'Asset management finally makes sense. Everything is organized automatically.',
      'Batch export saved me an entire day of rendering. Thank you HOOTNER! 🙏',
      'The keyboard shortcuts are so intuitive. Workflow is 3x faster now.',
      'Cloud storage integration means I can edit from anywhere. Game changer!',
      'The AI music recommendation matched my video vibe perfectly 🎵',
      'Heatmap analytics showed exactly where viewers lose interest. Data-driven editing!',
      'Green screen removal is flawless. No more tedious masking!',
      'The transition library has everything I need. So much creative freedom!',
      'Auto-backup saved my project when my laptop crashed. Lifesaver! 💾',
      'The performance on 10K footage is smooth. My old setup would have crashed.',
      'Marketplace plugins expanded my toolkit exponentially. Amazing ecosystem!',
      'Just hit 1M views on a video edited entirely on HOOTNER! 🎉'
    ]

    const tagGroups = [
      ['cinematic', 'video-essay', 'storytelling'],
      ['AI', 'editing', 'tech'],
      ['AI-generated', 'neural-synthesis', 'creative'],
      ['collaboration', 'productivity', 'teams'],
      ['quality', 'HDR', '10K', 'professional'],
      ['documentary', 'color-grading', 'workflow'],
      ['composition', 'neural-networks', 'automation'],
      ['behind-the-scenes', 'rendering', 'performance'],
      ['8K', 'export', 'quality'],
      ['real-time', 'collaboration', 'editing'],
      ['audio', 'sync', 'AI-tools'],
      ['HDR', 'color', 'presets'],
      ['client-work', 'professional', 'approval'],
      ['motion-tracking', 'vfx', 'automation'],
      ['subtitles', 'multilingual', 'accessibility'],
      ['upscaling', 'AI-enhancement', '4K'],
      ['timeline', 'collaboration', 'workflow'],
      ['analytics', 'data', 'insights'],
      ['organization', 'asset-management', 'productivity'],
      ['batch-processing', 'rendering', 'efficiency']
    ]

    const initialPosts: Post[] = []
    
    for (let i = 0; i < 50; i++) {
      const hasVideo = i % 3 !== 1
      const isTrending = i % 7 === 0
      const isAIGenerated = i % 5 === 0
      const isVerified = i % 4 !== 3
      
      initialPosts.push({
        id: `post-${i + 1}`,
        author: {
          username: usernames[i % usernames.length],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[i % usernames.length]}`,
          verified: isVerified
        },
        content: contentTemplates[i % contentTemplates.length],
        videoThumbnail: hasVideo ? videoThumbnails[i % videoThumbnails.length] : undefined,
        videoDuration: hasVideo ? Math.floor(120 + Math.random() * 1800) : undefined,
        timestamp: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(100 + Math.random() * 3000),
        comments: Math.floor(10 + Math.random() * 200),
        shares: Math.floor(20 + Math.random() * 300),
        isLiked: false,
        isBookmarked: false,
        tags: tagGroups[i % tagGroups.length],
        trending: isTrending,
        aiGenerated: isAIGenerated
      })
    }

    setPosts(initialPosts)
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Post content cannot be empty')
      return
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        username: currentUser.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        verified: currentUser.role === 'admin'
      },
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      tags: []
    }

    setPosts((current) => [newPost, ...(current || [])])
    setNewPostContent('')
    toast.success('Post created successfully!')
  }

  const handleAIGenerate = async () => {
    if (!newPostContent.trim()) {
      toast.error('Enter a prompt to generate AI content')
      return
    }

    setIsGeneratingAI(true)
    toast.loading('AI is generating your content...', { id: 'ai-gen' })

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const aiEnhancedContent = `${newPostContent}\n\n✨ AI-Enhanced: This post has been optimized with neural insights and creative suggestions for maximum engagement.`

      const newPost: Post = {
        id: Date.now().toString(),
        author: {
          username: currentUser.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
          verified: currentUser.role === 'admin'
        },
        content: aiEnhancedContent,
        videoThumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=450&fit=crop',
        videoDuration: 180,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        tags: ['AI-generated', 'neural-synthesis', 'creative'],
        aiGenerated: true
      }

      setPosts((current) => [newPost, ...(current || [])])
      setNewPostContent('')
      toast.success('AI content generated!', { id: 'ai-gen' })
    } catch (error) {
      toast.error('Failed to generate AI content', { id: 'ai-gen' })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleLike = (postId: string) => {
    setPosts((current) =>
      (current || []).map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    )
  }

  const handleBookmark = (postId: string) => {
    setPosts((current) =>
      (current || []).map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    )
    const post = safePosts.find((p) => p.id === postId)
    if (post) {
      toast.success(post.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    }
  }

  const handleShare = (postId: string) => {
    toast.success('Link copied to clipboard!')
  }

  const handleComment = () => {
    if (!commentText.trim() || !selectedPost) return

    const newComment: Comment = {
      id: Date.now().toString(),
      postId: selectedPost.id,
      author: {
        username: currentUser.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
      },
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0
    }

    setComments((current) => [newComment, ...(current || [])])
    setPosts((current) =>
      (current || []).map((post) =>
        post.id === selectedPost.id
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    )
    setCommentText('')
    toast.success('Comment added!')
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredPosts = safePosts.filter((post) => {
    const matchesTab = 
      activeTab === 'trending' ? post.trending :
      activeTab === 'following' ? post.author.verified :
      true
    
    const matchesSearch = 
      searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesTab && matchesSearch
  })

  const visiblePosts = filteredPosts.slice(0, displayCount)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Feed</h1>
          <p className="text-muted-foreground mt-1">Connect with the HOOTNER community</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, users, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Users weight="fill" className="w-4 h-4" />
            <span className="font-semibold">12.4K</span>
            <span className="text-muted-foreground">Active</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12 border-2 border-accent ring-4 ring-accent/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} />
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your video insights, ask questions, or showcase your work..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                />
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary">
                      <ImageIcon weight="fill" className="w-4 h-4" />
                      Image
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary">
                      <Play weight="fill" className="w-4 h-4" />
                      Video
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 hover:bg-accent/10 hover:text-accent"
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI}
                    >
                      <Sparkle weight="fill" className={cn("w-4 h-4", isGeneratingAI && "animate-spin")} />
                      {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Button onClick={handleCreatePost} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Lightning weight="fill" className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-12 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="for-you" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
                <Sparkle weight="fill" className="w-4 h-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
                <Users weight="fill" className="w-4 h-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
                <Fire weight="fill" className="w-4 h-4" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              <AnimatePresence mode="popLayout">
                {visiblePosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold hover:text-primary cursor-pointer transition-colors">
                                  {post.author.username}
                                </span>
                                {post.author.verified && (
                                  <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-accent/20 text-accent border-accent/30">
                                    <Sparkle weight="fill" className="w-3 h-3" />
                                  </Badge>
                                )}
                                {post.trending && (
                                  <Badge variant="default" className="h-5 px-1.5 text-xs gap-1 bg-gradient-to-r from-orange-500 to-pink-500 border-0">
                                    <TrendUp weight="fill" className="w-3 h-3" />
                                    Trending
                                  </Badge>
                                )}
                                {post.aiGenerated && (
                                  <Badge variant="default" className="h-5 px-1.5 text-xs gap-1 bg-gradient-to-r from-purple-500 to-blue-500 border-0 animate-pulse">
                                    <Sparkle weight="fill" className="w-3 h-3" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatTimestamp(post.timestamp)}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                            <DotsThree weight="bold" className="w-5 h-5" />
                          </Button>
                        </div>

                        <p className="text-foreground leading-relaxed whitespace-pre-line">{post.content}</p>

                        {post.videoThumbnail && (
                          <div className="relative rounded-xl overflow-hidden group cursor-pointer shadow-lg">
                            <img
                              src={post.videoThumbnail}
                              alt="Video thumbnail"
                              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                <Play weight="fill" className="w-10 h-10 text-primary ml-1" />
                              </div>
                            </div>
                            {post.videoDuration && (
                              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-mono text-white shadow-lg">
                                {formatDuration(post.videoDuration)}
                              </div>
                            )}
                            {post.aiGenerated && (
                              <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                                <Sparkle weight="fill" className="w-3 h-3" />
                                AI Generated
                              </div>
                            )}
                          </div>
                        )}

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="text-xs hover:bg-primary/10 hover:border-primary/50 cursor-pointer transition-colors"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'gap-2 transition-all duration-300',
                                post.isLiked && 'text-red-500 hover:text-red-600'
                              )}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart 
                                weight={post.isLiked ? 'fill' : 'regular'} 
                                className={cn("w-5 h-5", post.isLiked && "animate-pulse")} 
                              />
                              <span className="font-medium">{post.likes.toLocaleString()}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 hover:text-primary transition-colors"
                              onClick={() => setSelectedPost(post)}
                            >
                              <ChatCircle weight="regular" className="w-5 h-5" />
                              <span className="font-medium">{post.comments}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 hover:text-accent transition-colors"
                              onClick={() => handleShare(post.id)}
                            >
                              <Share weight="regular" className="w-5 h-5" />
                              <span className="font-medium">{post.shares}</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'transition-all duration-300',
                              post.isBookmarked && 'text-accent'
                            )}
                            onClick={() => handleBookmark(post.id)}
                          >
                            <BookmarkSimple 
                              weight={post.isBookmarked ? 'fill' : 'regular'} 
                              className="w-5 h-5" 
                            />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visiblePosts.length < filteredPosts.length && (
                <div ref={observerRef} className="flex justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                    <span className="ml-2 text-sm">Loading more posts...</span>
                  </div>
                </div>
              )}

              {filteredPosts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Be the first to share something!'}
                    </p>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Fire weight="fill" className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {[
                { tag: 'AI-video-generation', posts: '2.3K', change: '+15%' },
                { tag: 'cinematic-editing', posts: '1.8K', change: '+8%' },
                { tag: '10K-HDR', posts: '1.5K', change: '+22%' },
                { tag: 'neural-synthesis', posts: '1.2K', change: '+12%' },
                { tag: 'collaborative-workflow', posts: '987', change: '+5%' }
              ].map((topic, idx) => (
                <div
                  key={topic.tag}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                      <span className="text-muted-foreground font-mono text-xs font-bold">#{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">#{topic.tag}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs h-5">
                          {topic.posts}
                        </Badge>
                        <span className="text-xs text-green-500 font-medium">{topic.change}</span>
                      </div>
                    </div>
                  </div>
                  <TrendUp weight="bold" className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 gap-2 hover:bg-primary/10">
              Show All
              <CaretDown weight="bold" className="w-4 h-4" />
            </Button>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Users weight="fill" className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-lg">Suggested Creators</h3>
            </div>
            <div className="space-y-4">
              {[
                { username: 'creative_studio', verified: true, followers: '24.5K', specialty: 'Cinematic' },
                { username: 'ai_filmmaker', verified: true, followers: '18.2K', specialty: 'AI & Tech' },
                { username: 'motion_designer', verified: false, followers: '12.8K', specialty: 'Animation' }
              ].map((creator) => (
                <div key={creator.username} className="flex items-center justify-between group hover:bg-muted/30 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`} />
                        <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {creator.verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center ring-2 ring-background">
                          <Sparkle weight="fill" className="w-2.5 h-2.5 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{creator.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{creator.followers} followers</span>
                        <span>•</span>
                        <span>{creator.specialty}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 gap-2 hover:bg-accent/10">
              Discover More
              <CaretDown weight="bold" className="w-4 h-4" />
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-primary/10 border-accent/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Eye weight="fill" className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-lg">Community Stats</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Active Users', value: '12.4K', icon: Users, color: 'text-blue-500' },
                { label: 'Posts Today', value: '1,847', icon: ChatCircle, color: 'text-green-500' },
                { label: 'Videos Shared', value: '892', icon: Play, color: 'text-purple-500' },
                { label: 'AI Generations', value: '456', icon: Sparkle, color: 'text-amber-500' }
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 group-hover:shadow-md transition-shadow", stat.color)}>
                      <stat.icon weight="fill" className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary via-accent to-primary shadow-lg text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />
            <div className="relative z-10">
              <Sparkle weight="fill" className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
              <p className="text-sm opacity-90 mb-4">
                Unlock AI-powered features, unlimited uploads, and advanced analytics
              </p>
              <Button className="w-full bg-white text-primary hover:bg-white/90 shadow-lg">
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {selectedPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-border bg-gradient-to-br from-card to-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChatCircle weight="fill" className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">Comments</h3>
                      <p className="text-sm text-muted-foreground">
                        {safeComments.filter((c) => c.postId === selectedPost.id).length} comments
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedPost(null)}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-full"
                  >
                    <span className="text-2xl leading-none">×</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} />
                    <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Write a thoughtful comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px] resize-none border-border/50 focus:border-primary/50"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {commentText.length} / 500 characters
                      </span>
                      <Button 
                        onClick={handleComment} 
                        size="sm" 
                        disabled={!commentText.trim()}
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Lightning weight="fill" className="w-4 h-4" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  {safeComments
                    .filter((c) => c.postId === selectedPost.id)
                    .map((comment, idx) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-3 group"
                      >
                        <Avatar className="w-9 h-9 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>{comment.author.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/50 group-hover:bg-muted p-4 rounded-xl rounded-tl-none transition-colors">
                            <span className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors">
                              {comment.author.username}
                            </span>
                            <p className="text-sm mt-1.5 leading-relaxed">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 px-2 text-xs text-muted-foreground">
                            <span>{formatTimestamp(comment.timestamp)}</span>
                            <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                              <Heart weight="regular" className="w-3.5 h-3.5" />
                              Like
                            </button>
                            <button className="hover:text-primary transition-colors">Reply</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {safeComments.filter((c) => c.postId === selectedPost.id).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <ChatCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h4 className="font-semibold text-lg mb-2">No comments yet</h4>
                      <p className="text-sm text-muted-foreground">
                        Be the first to share your thoughts!
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
