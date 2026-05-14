import { defineConfig } from "vitepress";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import fs from "fs";
import path from "path";
import sharp from "sharp";

function formatTitle(text: string) {
    if (text === 'qol') return 'Quality of Life';
    return text.split('-').map(word => {
        if (word.toLowerCase() === 'ui') return 'UI';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function getSidebar() {
    const docsDir = path.resolve(process.cwd(), 'docs');
    const categories = ['getting-started', 'better-ui', 'new-biomes', 'new-structures', 'new-items', 'new-mobs', 'new-mechanics', 'qol', 'texture-improvement', 'updates'];
    
    const sidebar: any[] = [];

    for (const category of categories) {
        const categoryDir = path.join(docsDir, category);
        if (!fs.existsSync(categoryDir)) continue;

        const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md') && f !== 'index.md');
        
        let items = files.map(file => {
            const name = file.replace('.md', '');
            
            // Special handling for updates version formatting
            if (category === 'updates') {
                let versionText = name;
                let parts = name.split('-');
                if (parts[parts.length - 1] === '0' && parts.length > 2) {
                    parts.pop();
                }
                versionText = 'v' + parts.join('.');
                return { text: versionText, link: `/${category}/${name}` };
            }
            
            return {
                text: formatTitle(name),
                link: `/${category}/${name}`
            };
        });

        // Special sorting for updates
        if (category === 'updates') {
            items.sort((a, b) => {
                 const vA = (a.link.split('/').pop() || '').replace('.md', '').split('-').map(Number);
                 const vB = (b.link.split('/').pop() || '').replace('.md', '').split('-').map(Number);
                 for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
                     const numA = vA[i] || 0;
                     const numB = vB[i] || 0;
                     if (numA !== numB) return numB - numA;
                 }
                 return 0;
            });
        }

        sidebar.push({
            text: formatTitle(category),
            collapsed: false,
            items: items
        });
    }

    return sidebar;
}

function getLatestUpdate() {
    const updatesDir = path.resolve(process.cwd(), 'docs/updates');
    if (!fs.existsSync(updatesDir)) return 'index';
    const files = fs.readdirSync(updatesDir).filter(f => f.endsWith('.md') && f !== 'index.md');
    if (files.length === 0) return 'index';
    
    return files.sort((a, b) => {
        const vA = a.replace('.md', '').split('-').map(Number);
        const vB = b.replace('.md', '').split('-').map(Number);
        for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
            const numA = vA[i] || 0;
            const numB = vB[i] || 0;
            if (numA !== numB) return numB - numA;
        }
        return 0;
    })[0].replace('.md', '');
}

const latestUpdate = getLatestUpdate();

/**
 * Automatically converts all PNG/JPG/JPEG files in public/src to WebP
 * so the user can just drop them in and have them optimized.
 */
async function convertImagesToWebp() {
    const srcDir = path.resolve(process.cwd(), 'docs/public/src');
    if (!fs.existsSync(srcDir)) return;

    const processFiles = async (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await processFiles(fullPath);
            } else if (/\.(png|jpg|jpeg|jfif|gif)$/i.test(entry.name)) {
                const webpPath = fullPath.replace(/\.[^.]+$/, '.webp');
                // Only convert if webp doesn't exist or is older than source
                if (!fs.existsSync(webpPath) || fs.statSync(fullPath).mtime > fs.statSync(webpPath).mtime) {
                    console.log(`[WebP Converter] Optimizing ${entry.name} -> .webp`);
                    try {
                        const isGif = /\.gif$/i.test(entry.name);
                        await sharp(fullPath, { animated: isGif }).webp({ quality: 80 }).toFile(webpPath);
                    } catch (e) {
                        console.error(`Failed to convert ${entry.name}:`, e);
                    }
                }
            }
        }
    };
    await processFiles(srcDir);
}

// https://vitepress.dev/reference/site-config
const SITE_URL = 'https://wiki.handaru.dev';

export default defineConfig({
    base: '/',
    appearance: 'force-dark',

    title: "Bedrock Perfected Wiki",
    titleTemplate: ':title | Bedrock Perfected Wiki',
    description: "The official wiki for Bedrock Perfected — a Minecraft Bedrock Edition addon that adds new biomes, structures, items, mechanics, and quality-of-life improvements.",

    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        // Global SEO keywords for Google signals
        ["meta", { name: "keywords", content: "Bedrock Perfected, Bedrock Perfected Wiki, Minecraft Bedrock addon, Minecraft addon wiki, bedrock perfected addon" }],
        ["meta", { name: "author", content: "Bedrock Perfected" }],
        ["meta", { name: "robots", content: "index, follow" }],
    ],

    sitemap: {
        hostname: SITE_URL,
    },

    cleanUrls: true,

    // Replace all .png/.jpg/.gif references in HTML with .webp
    transformHtml(code) {
        return code.replace(/(src|href)="([^"]+)\.(png|jpg|jpeg|jfif|gif)"/g, '$1="$2.webp"');
    },

    transformHead({ page, pageData, title, description }) {
        const cleanPage = page.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1');
        const pageUrl = `${SITE_URL}/${cleanPage}`.replace(/\/$/, '') || SITE_URL;
        const isHome = page === 'index.md';

        const pageTitle = isHome
            ? 'Bedrock Perfected Wiki'
            : `${title} | Bedrock Perfected Wiki`;

        const defaultDesc = "The official wiki for Bedrock Perfected — a Minecraft Bedrock Edition addon that adds new biomes, structures, items, mechanics, and quality-of-life improvements.";
        const pageDesc = pageData.frontmatter?.description || description || defaultDesc;

        const ogImage = `${SITE_URL}/logo.svg`;

        const head: [string, Record<string, string>][] = [
            // Description
            ['meta', { name: 'description', content: pageDesc }],
            // Canonical
            ['link', { rel: 'canonical', href: isHome ? SITE_URL : pageUrl }],
            // Open Graph
            ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
            ['meta', { property: 'og:site_name', content: 'Bedrock Perfected Wiki' }],
            ['meta', { property: 'og:title', content: pageTitle }],
            ['meta', { property: 'og:description', content: pageDesc }],
            ['meta', { property: 'og:url', content: isHome ? SITE_URL : pageUrl }],
            ['meta', { property: 'og:image', content: ogImage }],
            // Twitter Card
            ['meta', { name: 'twitter:card', content: 'summary' }],
            ['meta', { name: 'twitter:title', content: pageTitle }],
            ['meta', { name: 'twitter:description', content: pageDesc }],
            ['meta', { name: 'twitter:image', content: ogImage }],
        ];

        // JSON-LD Structured Data
        const jsonLd = isHome
            ? {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Bedrock Perfected Wiki',
                alternateName: 'Bedrock Perfected',
                description: defaultDesc,
                url: SITE_URL,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?search={search_term_string}` },
                    'query-input': 'required name=search_term_string'
                }
            }
            : {
                '@context': 'https://schema.org',
                '@type': 'TechArticle',
                name: title,
                description: pageDesc,
                url: pageUrl,
                isPartOf: {
                    '@type': 'WebSite',
                    name: 'Bedrock Perfected Wiki',
                    url: SITE_URL
                }
            };

        (head as any[]).push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)]);

        return head as any;
    },

    themeConfig: {
        search: {
            provider: "local",
        },
        logo: "/logo.svg",
        nav: [{ text: "Home", link: "/" }],
        sidebar: getSidebar(),
        socialLinks: [
            { 
                icon: {
                    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>CurseForge</title><path d="M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z"/></svg>'
                },
                link: "https://www.curseforge.com/minecraft-bedrock/addons/bedrock-perfected" 
            },
            { icon: "discord", link: "https://discord.gg/R6b8HzYKtg" }
        ],
    },
    
    vite: {
        resolve: {
            alias: [
                { find: '/src', replacement: path.resolve(process.cwd(), 'docs/public/src') }
            ]
        },
        define: {
            __LATEST_UPDATE__: JSON.stringify(latestUpdate)
        },
        plugins: [
            {
                name: 'webp-converter',
                async buildStart() {
                    await convertImagesToWebp();
                }
            },
            ViteImageOptimizer({
                png: { quality: 80 },
                webp: { quality: 80 },
                jpeg: { quality: 80 },
            })
        ]
    }
});
