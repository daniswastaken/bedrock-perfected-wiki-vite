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
    const categories = ['getting-started', 'better-ui', 'new-biomes', 'new-structures', 'new-items', 'new-mechanics', 'qol', 'texture-improvement', 'updates'];
    
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
export default defineConfig({
    base: '/',
    appearance: 'force-dark',

    title: "Bedrock Perfected Wiki",
    description: "A Wiki for Bedrock Perfected Addon",

    head: [["link", { rel: "icon", href: "/favicon.ico" }]],

    cleanUrls: true,

    // Replace all .png/.jpg/.gif references in HTML with .webp
    transformHtml(code) {
        return code.replace(/(src|href)="([^"]+)\.(png|jpg|jpeg|jfif|gif)"/g, '$1="$2.webp"');
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
