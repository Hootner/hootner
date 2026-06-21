import { useState } from "react";
import { usePlatformKV } from "@/shared/hooks/usePlatformKV";
import {
  MagnifyingGlass,
  Star,
  Download,
  ShoppingCart,
  Sparkle,
  Crown,
  TrendUp,
  Tag,
  CheckCircle,
  Package,
  Brain,
  FilmStrip,
  PuzzlePiece,
  Fire,
} from "@phosphor-icons/react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type MarketplaceCategory = "all" | "ai-models" | "templates" | "plugins" | "effects";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  rating: number;
  downloads: number;
  author: string;
  thumbnail: string;
  featured: boolean;
  trending: boolean;
  verified: boolean;
  tags: string[];
  version: string;
  compatibility: string[];
}

interface PurchasedItem {
  itemId: string;
  purchaseDate: string;
  price: number;
}

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    name: "Neural Scene Generator Pro",
    description:
      "Advanced AI model for generating cinematic scenes with photorealistic quality. Supports 10K UHD output with HDR10+ and custom camera movements.",
    category: "ai-models",
    price: 299,
    rating: 4.9,
    downloads: 12543,
    author: "VisionLabs AI",
    thumbnail: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400",
    featured: true,
    trending: true,
    verified: true,
    tags: ["AI Generation", "Cinematic", "HDR", "Professional"],
    version: "2.5.0",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
  {
    id: "2",
    name: "Cinematic Title Pack",
    description:
      "50 premium animated title templates with customizable colors, fonts, and effects. Perfect for documentaries and corporate videos.",
    category: "templates",
    price: 49,
    rating: 4.7,
    downloads: 28901,
    author: "MotionDesignCo",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
    featured: true,
    trending: false,
    verified: true,
    tags: ["Templates", "Titles", "Animation", "Corporate"],
    version: "1.8.2",
    compatibility: ["All versions"],
  },
  {
    id: "3",
    name: "Smart Auto-Edit Plugin",
    description:
      "AI-powered plugin that automatically cuts and edits your footage based on beat detection, scene analysis, and pacing optimization.",
    category: "plugins",
    price: 149,
    rating: 4.8,
    downloads: 8234,
    author: "EditFlow AI",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
    featured: false,
    trending: true,
    verified: true,
    tags: ["Automation", "AI Editing", "Music Video", "Time-saver"],
    version: "3.1.0",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
  {
    id: "4",
    name: "Color Grading LUTs Bundle",
    description:
      "100 professional LUTs covering cinematic, vintage, modern, and stylized looks. Created by Hollywood colorists.",
    category: "effects",
    price: 79,
    rating: 4.9,
    downloads: 45672,
    author: "CinemaColor Studios",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
    featured: true,
    trending: false,
    verified: true,
    tags: ["Color Grading", "LUTs", "Cinematic", "Professional"],
    version: "2.0.1",
    compatibility: ["All versions"],
  },
  {
    id: "5",
    name: "Voice Synthesis AI",
    description:
      "Generate realistic voiceovers in 40+ languages with emotion control, accent selection, and professional narration quality.",
    category: "ai-models",
    price: 199,
    rating: 4.6,
    downloads: 6789,
    author: "AudioGen Labs",
    thumbnail: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400",
    featured: false,
    trending: true,
    verified: true,
    tags: ["Voice AI", "Text-to-Speech", "Multilingual", "Narration"],
    version: "1.4.5",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
  {
    id: "6",
    name: "Particle Effects Library",
    description:
      "200+ particle effects including fire, smoke, sparks, magic, weather, and abstract particles. Real-time preview and customization.",
    category: "effects",
    price: 89,
    rating: 4.8,
    downloads: 15234,
    author: "FX Masters",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
    featured: false,
    trending: false,
    verified: true,
    tags: ["VFX", "Particles", "Effects", "Animation"],
    version: "1.9.3",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
  {
    id: "7",
    name: "Motion Tracking Suite",
    description:
      "Advanced motion tracking and 3D camera solver with planar tracking, object removal, and stabilization tools.",
    category: "plugins",
    price: 249,
    rating: 4.9,
    downloads: 4521,
    author: "TrackTech Pro",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    featured: true,
    trending: false,
    verified: true,
    tags: ["Tracking", "VFX", "3D", "Professional"],
    version: "4.2.0",
    compatibility: ["HOOTNER Enterprise"],
  },
  {
    id: "8",
    name: "Social Media Templates",
    description:
      "Pre-sized templates for Instagram, TikTok, YouTube, and Facebook with trendy animations and music sync capabilities.",
    category: "templates",
    price: 39,
    rating: 4.5,
    downloads: 67890,
    author: "SocialVid Studio",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    featured: false,
    trending: true,
    verified: false,
    tags: ["Social Media", "Templates", "Viral", "Quick"],
    version: "2.3.1",
    compatibility: ["All versions"],
  },
  {
    id: "9",
    name: "Background Removal AI",
    description:
      "One-click background removal and replacement powered by advanced segmentation AI. Perfect for green screen alternative.",
    category: "ai-models",
    price: 129,
    rating: 4.7,
    downloads: 19876,
    author: "SegmentPro AI",
    thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400",
    featured: false,
    trending: false,
    verified: true,
    tags: ["AI", "Compositing", "Background", "Keying"],
    version: "1.7.2",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
  {
    id: "10",
    name: "Transition Master Pack",
    description:
      "300 creative transitions including glitch, zoom, slide, warp, and 3D transitions with audio sync and timing controls.",
    category: "effects",
    price: 59,
    rating: 4.6,
    downloads: 34567,
    author: "TransitionFX",
    thumbnail: "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=400",
    featured: false,
    trending: false,
    verified: true,
    tags: ["Transitions", "Effects", "Creative", "Pack"],
    version: "3.0.0",
    compatibility: ["All versions"],
  },
  {
    id: "11",
    name: "Upscale AI 10K",
    description:
      "AI-powered video upscaling to 10K UHD resolution with detail enhancement, noise reduction, and frame interpolation.",
    category: "ai-models",
    price: 349,
    rating: 5.0,
    downloads: 3456,
    author: "ResolutionAI",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    featured: true,
    trending: true,
    verified: true,
    tags: ["AI", "Upscaling", "10K", "Enhancement"],
    version: "1.2.0",
    compatibility: ["HOOTNER Enterprise"],
  },
  {
    id: "12",
    name: "Audio Enhancement Suite",
    description:
      "Professional audio tools including noise removal, dialogue enhancement, room reverb, and Dolby Atmos spatial audio mixer.",
    category: "plugins",
    price: 179,
    rating: 4.8,
    downloads: 11234,
    author: "SoundForge Pro",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    featured: false,
    trending: false,
    verified: true,
    tags: ["Audio", "Dolby Atmos", "Enhancement", "Professional"],
    version: "2.1.4",
    compatibility: ["HOOTNER Pro", "HOOTNER Enterprise"],
  },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>("all");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest" | "price-low" | "price-high">("popular");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchasedItems, setPurchasedItems] = usePlatformKV<PurchasedItem[]>("hootner-purchased-items", []);
  const [cart, setCart] = usePlatformKV<string[]>("hootner-cart", []);

  const filteredItems = mockItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return 0;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const isPurchased = (itemId: string) => {
    return purchasedItems?.some((p) => p.itemId === itemId) ?? false;
  };

  const isInCart = (itemId: string) => {
    return cart?.includes(itemId) ?? false;
  };

  const handlePurchase = (item: MarketplaceItem) => {
    setPurchasedItems([
      ...(purchasedItems || []),
      {
        itemId: item.id,
        purchaseDate: new Date().toISOString(),
        price: item.price,
      },
    ]);

    setCart((cart || []).filter((id) => id !== item.id));

    setShowPurchaseDialog(false);
    toast.success(`Successfully purchased ${item.name}!`, {
      description: "Item has been added to your library and is ready to use.",
    });
  };

  const handleAddToCart = (itemId: string) => {
    if (!isInCart(itemId)) {
      setCart([...(cart || []), itemId]);
      toast.success("Added to cart");
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((cart || []).filter((id) => id !== itemId));
    toast.success("Removed from cart");
  };

  const getCategoryIcon = (category: MarketplaceCategory) => {
    switch (category) {
      case "ai-models":
        return Brain;
      case "templates":
        return FilmStrip;
      case "plugins":
        return PuzzlePiece;
      case "effects":
        return Sparkle;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-accent" weight="fill" />
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover AI models, templates, plugins, and effects to enhance your videos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="relative">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {(cart?.length ?? 0) > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground px-2 py-0.5">
                {cart?.length ?? 0}
              </Badge>
            )}
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Download className="w-5 h-5 mr-2" />
            My Library ({purchasedItems?.length ?? 0})
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-accent" weight="fill" />
              <h3 className="text-xl font-semibold">Featured Items</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Hand-picked by our team &bull; Updated weekly &bull; Premium quality guaranteed
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Fire className="w-3 h-3 mr-1" weight="fill" />
              Trending
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <TrendUp className="w-3 h-3 mr-1" />
              Top Rated
            </Badge>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-full md:w-48 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MarketplaceCategory)}>
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="all" className="flex-col gap-1 py-3">
            <Package className="w-5 h-5" />
            <span className="text-xs">All</span>
          </TabsTrigger>
          <TabsTrigger value="ai-models" className="flex-col gap-1 py-3">
            <Brain className="w-5 h-5" />
            <span className="text-xs">AI Models</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-col gap-1 py-3">
            <FilmStrip className="w-5 h-5" />
            <span className="text-xs">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex-col gap-1 py-3">
            <PuzzlePiece className="w-5 h-5" />
            <span className="text-xs">Plugins</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex-col gap-1 py-3">
            <Sparkle className="w-5 h-5" />
            <span className="text-xs">Effects</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const purchased = isPurchased(item.id);
            const inCart = isInCart(item.id);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  {item.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-accent text-accent-foreground">
                        <Crown className="w-3 h-3 mr-1" weight="fill" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  {item.trending && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="destructive">
                        <Fire className="w-3 h-3 mr-1" weight="fill" />
                        Trending
                      </Badge>
                    </div>
                  )}

                  <div
                    className="relative aspect-video overflow-hidden bg-muted"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowPurchaseDialog(true);
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold line-clamp-1 group-hover:text-accent transition-colors"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowPurchaseDialog(true);
                          }}
                        >
                          {item.name}
                        </h3>
                        <CategoryIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star weight="fill" className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{item.rating}</span>
                      </div>
                      <span className="text-muted-foreground">&bull;</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="w-4 h-4" />
                        <span>{item.downloads.toLocaleString()}</span>
                      </div>
                      {item.verified && (
                        <>
                          <span className="text-muted-foreground">&bull;</span>
                          <CheckCircle weight="fill" className="w-4 h-4 text-accent" />
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-accent">${item.price}</span>
                        <span className="text-xs text-muted-foreground">v{item.version}</span>
                      </div>

                      {purchased ? (
                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                          <CheckCircle weight="fill" className="w-4 h-4 mr-2" />
                          Purchased
                        </Button>
                      ) : inCart ? (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowPurchaseDialog(true);
                            }}
                          >
                            Buy Now
                          </Button>
                          <Button variant="outline" onClick={() => handleRemoveFromCart(item.id)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" onClick={() => handleAddToCart(item.id)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you&apos;re looking for
          </p>
        </Card>
      )}

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  by {selectedItem.author}{" "}
                  {selectedItem.verified && (
                    <CheckCircle weight="fill" className="inline w-4 h-4 text-accent" />
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <img
                  src={selectedItem.thumbnail}
                  alt={selectedItem.name}
                  className="w-full aspect-video object-cover rounded-lg"
                />

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Star weight="fill" className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold">{selectedItem.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Download className="w-5 h-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {(selectedItem.downloads / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-bold block">{selectedItem.version}</span>
                    <p className="text-xs text-muted-foreground">Version</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-accent block">
                      ${selectedItem.price}
                    </span>
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Compatibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.compatibility.map((comp) => (
                      <Badge key={comp} variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                {isPurchased(selectedItem.id) ? (
                  <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" disabled>
                    <CheckCircle weight="fill" className="w-4 h-4 mr-2" />
                    Already Purchased
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handlePurchase(selectedItem)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase for ${selectedItem.price}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
