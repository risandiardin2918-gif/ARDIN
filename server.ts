import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  AnalyticsSummary,
  MediaItem,
  Post,
  SocialAccount,
  UserProfile,
} from './src/types';
import { SocialPublisherService } from './src/server/publishers/SocialPublisherService';
import { GeminiCaptionService } from './src/server/publishers/GeminiCaptionService';
import { SchedulerService } from './src/server/publishers/SchedulerService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- In-Memory Store & Initial Seed Data ---
  let currentUser: UserProfile = {
    id: 'usr_101',
    name: 'Sarah Connor',
    email: 'sarah@contentstudio.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: 'Lead Content Creator',
    company: 'Nexus Media Lab',
  };

  let connectedAccounts: SocialAccount[] = [
    {
      id: 'acc_ig_01',
      platform: 'instagram',
      accountName: 'Nexus Studio Official',
      handle: '@nexus_studio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      isConnected: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      followersCount: 142500,
      tokenEncrypted: 'enc_meta_graph_access_token_v19_live',
      accountType: 'Instagram Business',
    },
    {
      id: 'acc_tt_02',
      platform: 'tiktok',
      accountName: 'NexusStudio.TikTok',
      handle: '@nexusstudiott',
      avatarUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&q=80',
      isConnected: true,
      expiresAt: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
      followersCount: 389000,
      tokenEncrypted: 'enc_tiktok_open_api_v2_token_live',
      accountType: 'TikTok Creator Pro',
    },
    {
      id: 'acc_yt_03',
      platform: 'youtube',
      accountName: 'Nexus Studio Shorts',
      handle: '@NexusStudioShorts',
      avatarUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80',
      isConnected: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      followersCount: 82100,
      tokenEncrypted: 'enc_google_oauth_yt_data_api_v3',
      accountType: 'YouTube Verified Creator',
    },
    {
      id: 'acc_fb_04',
      platform: 'facebook',
      accountName: 'Nexus Studio Global Page',
      handle: '@nexusstudioglobal',
      avatarUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=150&q=80',
      isConnected: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      followersCount: 54300,
      tokenEncrypted: 'enc_facebook_page_access_token',
      accountType: 'Facebook Verified Page',
    },
  ];

  let mediaLibrary: MediaItem[] = [
    {
      id: 'med_01',
      title: 'Neon Futuristic Cyberpunk Reel',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-at-night-41544-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      size: '14.2 MB',
      duration: '0:22',
      dimensions: '1080x1920 (9:16)',
      uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      tags: ['Cyberpunk', 'Vertical', 'Reel', 'Product Launch'],
    },
    {
      id: 'med_02',
      title: 'Minimalist Studio Desk Setup',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      size: '3.8 MB',
      dimensions: '1920x1080 (16:9)',
      uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      tags: ['Workspace', 'Setup', 'Tech', 'Minimal'],
    },
    {
      id: 'med_03',
      title: 'AI Workflow Animation Trailer',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-fast-on-a-laptop-keyboard-42533-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      size: '18.5 MB',
      duration: '0:18',
      dimensions: '1080x1920 (9:16)',
      uploadedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      tags: ['AI', 'Tech', 'Teaser', 'Shorts'],
    },
    {
      id: 'med_04',
      title: 'Creative Design Agency Showcase',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      size: '4.1 MB',
      dimensions: '1080x1350 (4:5)',
      uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      tags: ['Design', 'Agency', 'Branding'],
    },
  ];

  let postsStore: Post[] = [
    {
      id: 'post_101',
      title: '2026 AI Content Workflow Unveiled',
      caption: '🚀 Revolutionizing the way creators publish across multiple channels! Watch how OmniPublish automates video distribution in 1 click.',
      hashtags: ['#AIContent', '#ContentCreator', '#TikTokGrowth', '#YouTubeShorts', '#ReelsTips'],
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-at-night-41544-large.mp4',
      mediaType: 'video',
      targetPlatforms: ['instagram', 'tiktok', 'youtube', 'facebook'],
      status: 'published',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      publishLogs: {
        instagram: {
          platform: 'instagram',
          status: 'success',
          externalPostId: 'ig_17892304918203',
          publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        tiktok: {
          platform: 'tiktok',
          status: 'success',
          externalPostId: 'v_tt_9921049201',
          publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        youtube: {
          platform: 'youtube',
          status: 'success',
          externalPostId: 'yt_short_x92a019b',
          publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        facebook: {
          platform: 'facebook',
          status: 'success',
          externalPostId: 'fb_page_8819201948',
          publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
      },
      analytics: {
        views: 48200,
        likes: 5410,
        comments: 630,
        shares: 410,
        reach: 89000,
      },
    },
    {
      id: 'post_102',
      title: 'Ultimate Desk Setup for Creators',
      caption: 'Organized space = organized mind. Here is a breakdown of our high-productivity editing suite for 2026.',
      hashtags: ['#DeskSetup', '#CreatorStudio', '#Minimalism', '#TechGear'],
      mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      targetPlatforms: ['instagram', 'facebook'],
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours from now
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      publishLogs: {
        instagram: { platform: 'instagram', status: 'pending' },
        facebook: { platform: 'facebook', status: 'pending' },
        tiktok: { platform: 'tiktok', status: 'pending' },
        youtube: { platform: 'youtube', status: 'pending' },
      },
    },
    {
      id: 'post_103',
      title: 'Productivity Hacks Demo',
      caption: '3 secret keyboard shortcuts that will save you 2 hours every single day! ⚡',
      hashtags: ['#Productivity', '#Shorts', '#LifeHacks'],
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-fast-on-a-laptop-keyboard-42533-large.mp4',
      mediaType: 'video',
      targetPlatforms: ['instagram', 'tiktok', 'youtube'],
      status: 'failed',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      publishLogs: {
        instagram: {
          platform: 'instagram',
          status: 'success',
          externalPostId: 'ig_99210491823',
          publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
        tiktok: {
          platform: 'tiktok',
          status: 'failed',
          errorMessage: 'TikTok Open API Error 40001: Video framerate did not meet TikTok requirements.',
        },
        youtube: {
          platform: 'youtube',
          status: 'success',
          externalPostId: 'yt_short_k2019a',
          publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
        facebook: { platform: 'facebook', status: 'pending' },
      },
    },
  ];

  // --- Services ---
  const publisherService = new SocialPublisherService();
  const captionService = new GeminiCaptionService();
  const schedulerService = new SchedulerService();

  // Start background scheduler runner
  schedulerService.startCronRunner(
    () => postsStore,
    (updatedPost) => {
      const idx = postsStore.findIndex((p) => p.id === updatedPost.id);
      if (idx !== -1) {
        postsStore[idx] = updatedPost;
      } else {
        postsStore.unshift(updatedPost);
      }
    },
    () => connectedAccounts
  );

  // --- API Routes ---

  // Auth Status & User Profile
  app.get('/api/auth/me', (req, res) => {
    res.json({ user: currentUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    currentUser = {
      ...currentUser,
      email: email || currentUser.email,
    };
    res.json({ success: true, user: currentUser, token: 'mock_jwt_token_2026_omnipublish' });
  });

  // Social Accounts API
  app.get('/api/accounts', (req, res) => {
    res.json({ accounts: connectedAccounts });
  });

  app.post('/api/accounts/connect', (req, res) => {
    const { platform, accountName, handle } = req.body;
    const existing = connectedAccounts.find((a) => a.platform === platform);

    if (existing) {
      existing.isConnected = true;
      existing.expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();
      if (accountName) existing.accountName = accountName;
      if (handle) existing.handle = handle;
      res.json({ success: true, account: existing });
    } else {
      const newAcc: SocialAccount = {
        id: `acc_${platform}_${Date.now()}`,
        platform,
        accountName: accountName || `${platform.toUpperCase()} Account`,
        handle: handle || `@${platform}_user`,
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        isConnected: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        followersCount: Math.floor(10000 + Math.random() * 500000),
        tokenEncrypted: `enc_${platform}_oauth_token_active`,
      };
      connectedAccounts.push(newAcc);
      res.json({ success: true, account: newAcc });
    }
  });

  app.post('/api/accounts/disconnect', (req, res) => {
    const { id } = req.body;
    const acc = connectedAccounts.find((a) => a.id === id);
    if (acc) {
      acc.isConnected = false;
      res.json({ success: true, account: acc });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  });

  // Posts API
  app.get('/api/posts', (req, res) => {
    res.json({ posts: postsStore });
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const {
        title,
        caption,
        hashtags,
        mediaUrl,
        mediaType,
        targetPlatforms,
        publishType, // 'now' | 'schedule' | 'draft'
        scheduledFor,
      } = req.body;

      const newPost: Post = {
        id: `post_${Date.now()}`,
        title: title || 'Untitled Social Post',
        caption: caption || '',
        hashtags: Array.isArray(hashtags) ? hashtags : [],
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        mediaType: mediaType || 'video',
        targetPlatforms: Array.isArray(targetPlatforms) && targetPlatforms.length > 0 ? targetPlatforms : ['instagram'],
        status: publishType === 'schedule' ? 'scheduled' : publishType === 'draft' ? 'draft' : 'scheduled',
        scheduledFor: scheduledFor || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishLogs: {
          instagram: { platform: 'instagram', status: 'pending' },
          tiktok: { platform: 'tiktok', status: 'pending' },
          youtube: { platform: 'youtube', status: 'pending' },
          facebook: { platform: 'facebook', status: 'pending' },
        },
      };

      if (publishType === 'now') {
        const { post: publishedPost } = await publisherService.publishPost(newPost, connectedAccounts);
        postsStore.unshift(publishedPost);
        res.json({ success: true, post: publishedPost });
      } else {
        postsStore.unshift(newPost);
        res.json({ success: true, post: newPost });
      }
    } catch (err: any) {
      console.error('[API /api/posts] Error creating post:', err);
      res.status(500).json({ error: err.message || 'Failed to create post' });
    }
  });

  app.post('/api/posts/:id/publish-now', async (req, res) => {
    try {
      const postId = req.params.id;
      const postIdx = postsStore.findIndex((p) => p.id === postId);
      if (postIdx === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const existingPost = postsStore[postIdx];
      const { post: updatedPost } = await publisherService.publishPost(existingPost, connectedAccounts);
      postsStore[postIdx] = updatedPost;

      res.json({ success: true, post: updatedPost });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Publish now failed' });
    }
  });

  app.post('/api/posts/:id/retry', async (req, res) => {
    try {
      const postId = req.params.id;
      const { platformsToRetry } = req.body;
      const postIdx = postsStore.findIndex((p) => p.id === postId);

      if (postIdx === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const existingPost = postsStore[postIdx];
      const { post: updatedPost } = await publisherService.publishPost(
        existingPost,
        connectedAccounts,
        platformsToRetry
      );

      postsStore[postIdx] = updatedPost;
      res.json({ success: true, post: updatedPost });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Retry failed' });
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    postsStore = postsStore.filter((p) => p.id !== postId);
    res.json({ success: true, deletedId: postId });
  });

  // Media Library API
  app.get('/api/media', (req, res) => {
    res.json({ media: mediaLibrary });
  });

  app.post('/api/media', (req, res) => {
    const { title, type, url, thumbnailUrl, size, duration, dimensions, tags } = req.body;
    const newItem: MediaItem = {
      id: `med_${Date.now()}`,
      title: title || 'New Media Asset',
      type: type || 'video',
      url: url || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-at-night-41544-large.mp4',
      thumbnailUrl: thumbnailUrl || url,
      size: size || '12.4 MB',
      duration: duration || '0:15',
      dimensions: dimensions || '1080x1920 (9:16)',
      uploadedAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : ['Upload'],
    };
    mediaLibrary.unshift(newItem);
    res.json({ success: true, media: newItem });
  });

  app.delete('/api/media/:id', (req, res) => {
    const id = req.params.id;
    mediaLibrary = mediaLibrary.filter((m) => m.id !== id);
    res.json({ success: true, deletedId: id });
  });

  // Gemini AI Caption Assistant API
  app.post('/api/ai/generate-caption', async (req, res) => {
    try {
      const { topic, mediaType, targetPlatforms, tone } = req.body;
      const result = await captionService.generateCaptions({
        topic: topic || 'New product update launch',
        mediaType,
        targetPlatforms: targetPlatforms || ['instagram', 'tiktok', 'youtube'],
        tone: tone || 'engaging',
      });
      res.json(result);
    } catch (err: any) {
      console.error('[API /api/ai/generate-caption] Error:', err);
      res.status(500).json({ error: err.message || 'AI Caption Generation Failed' });
    }
  });

  // Analytics Overview API
  app.get('/api/analytics', (req, res) => {
    const publishedPosts = postsStore.filter((p) => p.status === 'published');
    const totalPosts = publishedPosts.length;

    let totalReach = 0;
    let totalEngagement = 0;

    publishedPosts.forEach((p) => {
      if (p.analytics) {
        totalReach += p.analytics.reach || 0;
        totalEngagement += (p.analytics.likes || 0) + (p.analytics.comments || 0) + (p.analytics.shares || 0);
      }
    });

    const summary: AnalyticsSummary = {
      totalPosts,
      totalReach: totalReach || 248500,
      totalEngagement: totalEngagement || 19400,
      avgEngagementRate: 7.8,
      followersByPlatform: {
        instagram: 142500,
        tiktok: 389000,
        youtube: 82100,
        facebook: 54300,
      },
      timelineChart: [
        { date: 'Mon', instagram: 12000, tiktok: 28000, youtube: 8500, facebook: 4200 },
        { date: 'Tue', instagram: 15400, tiktok: 34200, youtube: 11000, facebook: 5100 },
        { date: 'Wed', instagram: 18900, tiktok: 42000, youtube: 14500, facebook: 6300 },
        { date: 'Thu', instagram: 22100, tiktok: 49500, youtube: 19000, facebook: 7800 },
        { date: 'Fri', instagram: 31000, tiktok: 68000, youtube: 24000, facebook: 9400 },
        { date: 'Sat', instagram: 39500, tiktok: 89000, youtube: 31000, facebook: 12000 },
        { date: 'Sun', instagram: 48200, tiktok: 112000, youtube: 38000, facebook: 14500 },
      ],
      platformBreakdown: [
        { platform: 'tiktok', postsCount: 14, totalViews: 412000, engagement: 29400 },
        { platform: 'instagram', postsCount: 18, totalViews: 198000, engagement: 18200 },
        { platform: 'youtube', postsCount: 9, totalViews: 145000, engagement: 12100 },
        { platform: 'facebook', postsCount: 12, totalViews: 64000, engagement: 4300 },
      ],
    };

    res.json(summary);
  });

  // System Health API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'OmniPublish Unified Dispatcher v2.6',
      activeAccounts: connectedAccounts.filter((a) => a.isConnected).length,
      scheduledPostsQueue: postsStore.filter((p) => p.status === 'scheduled').length,
    });
  });

  // --- Vite Dev Middleware or Static File Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniPublish Engine] Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
