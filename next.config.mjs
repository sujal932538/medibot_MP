import { fileURLToPath } from 'url';
import path, { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aggressive performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Disable unused features for faster builds
  typescript: {
    ignoreBuildErrors: false, // Keep this false for production
  },
  
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds for speed
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'lucide-react',
      'recharts'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Disable problematic CSS optimization
    optimizeCss: false,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')())({
          enabled: true,
        })
      );
      return config;
    },
  }),

  webpack: (config, { isServer, dev, webpack, name }) => {
    // Give each compiler a truly unique cache name
    let cacheName;
    if (name === 'edge-server') {
      cacheName = `edge-server-cache-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    } else if (isServer) {
      cacheName = `server-cache-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    } else {
      cacheName = `client-cache-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    // Enable filesystem caching for better performance
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(process.cwd(), '.next', 'cache'),
      compression: 'gzip',
      maxAge: 172800000, // 2 days
      // Unique cache name for each compiler
      name: cacheName,
      version: '1.0.0',
    store: 'pack',
    };

    // Only apply client-specific optimizations for client builds
    if (!isServer) {
      // Aggressive optimization
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'initial',
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 20,
              chunks: 'all',
            },
            // Separate large libraries
            convex: {
              test: /[\\/]node_modules[\\/]convex[\\/]/,
              name: 'convex',
              priority: 30,
              chunks: 'all',
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 30,
              chunks: 'all',
            },
          },
        },
        // Remove console logs in production
        ...(process.env.NODE_ENV === 'production' && {
          minimizer: [
            new webpack.TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                },
              },
            }),
          ],
        }),
      };

      // Tree shaking
      config.optimization.sideEffects = false;
    }

    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }

    // Remove unused modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;