import { defineConfig } from "vitepress";
import fs from "fs";
import path from "path";

// Support standard VitePress deployment patterns
const base = process.env.BASE_URL || (process.env.VITE_GITHUB_PAGES === 'true' ? '/wiki/' : '/');

function getUpdatesSidebar() {
    const updatesDir = path.resolve(process.cwd(), 'docs/updates');
    try {
        const files = fs.readdirSync(updatesDir);
        return files
            .filter(file => file.endsWith('.md') && file !== 'index.md')
            .map(file => {
                const name = file.replace('.md', '');
                let versionText = name;
                // e.g. 26-5-0 -> 26.5.0. If ends in .0, trim it for cleaner display.
                let parts = name.split('-');
                if (parts[parts.length - 1] === '0' && parts.length > 2) {
                    parts.pop();
                }
                versionText = 'v' + parts.join('.');

                return {
                    text: versionText,
                    link: `/updates/${name}`
                };
            })
            .sort((a, b) => {
                 const vA = (a.link.split('/').pop() || '').replace('.md', '').split('-').map(Number);
                 const vB = (b.link.split('/').pop() || '').replace('.md', '').split('-').map(Number);
                 for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
                     const numA = vA[i] || 0;
                     const numB = vB[i] || 0;
                     if (numA !== numB) return numB - numA;
                 }
                 return 0;
            });
    } catch (e) {
        console.error("Failed to read updates directory:", e);
        return [];
    }
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: base,

    title: "Bedrock Perfected Wiki",
    description: "A Wiki for Bedrock Perfected Addon",

    head: [["link", { rel: "icon", href: `${base}favicon.ico`.replace('//', '/') }]],

    cleanUrls: true,

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        search: {
            provider: "local",
        },

        logo: "/logo.svg",

        nav: [{ text: "Home", link: "/" }],

        sidebar: [
            {
                text: "Getting Started",
                collapsed: false,
                items: [
                    { text: "How To Navigate the Wiki", link: "/getting-started/how-to-navigate-the-wiki" },
                    { text: "Addon Configurations", link: "/getting-started/addon-configurations" },
                    // { text: "Latest Updates", link: "/getting-started/new-updates" }
                ],
            },
            {
                text: "Better UI",
                collapsed: false,
                items: [
                    { text: "Brewing Guide UI", link: "/better-ui/brewing-guide-ui" },
                    { text: "Clearer Wither Hearts", link: "/better-ui/clearer-wither-hearts" },
                    { text: "Dark UI", link: "/better-ui/dark-ui" },
                    { text: "Lower Shield", link: "/better-ui/lower-shield" },
                    { text: "No How To Play", link: "/better-ui/no-how-to-play" },
                    { text: "No Vignette", link: "/better-ui/no-vignette" },
                    { text: "Quick Crafting", link: "/better-ui/quick-crafting" },
                    { text: "Show All Trades", link: "/better-ui/show-all-trades" },
                ],
            },
            {
                text: "New Biomes",
                collapsed: false,
                items: [
                    { text: "Selena Basin", link: "/new-biomes/selena-basin" },
                    { text: "Sierra", link: "/new-biomes/sierra" },
                    { text: "Sunflower Fields", link: "/new-biomes/sunflower-fields" }
                ],
            },
            {
                text: "New Structures",
                collapsed: false,
                items: [
                    { text: "Carriage", link: "/new-structures/carriage" },
                    { text: "Crops", link: "/new-structures/crops" },
                    { text: "Lumber Piles", link: "/new-structures/lumber-piles" },
                ],
            },
            {
                text: "New Items",
                collapsed: false,
                items: [
                    { text: "Addon Configuration", link: "/new-items/addon-configuration" },
                    { text: "Scroll of the Hearth", link: "/new-items/scroll-of-the-hearth" },
                ],
            },
            {
                text: "New Mechanics",
                collapsed: false,
                items: [
                    { text: "Biome Notifier", link: "/new-mechanics/biome-notifier" },
                    { text: "Coordinates Compass", link: "/new-mechanics/coordinates-compass" },
                    { text: "Damage Indicator", link: "/new-mechanics/damage-indicator" },
                    { text: "Random Iron Golem Names", link: "/new-mechanics/random-iron-golem-names" },
                    { text: "Random Villager Names", link: "/new-mechanics/random-villager-names" },
                    { text: "Settlement", link: "/new-mechanics/settlement" },
                    { text: "Starter Kits", link: "/new-mechanics/starter-kits" },
                ],
            },
            {
                text: "Quality of Life",
                collapsed: false,
                items: [
                    { text: "Craftables", link: "/qol/craftables" },
                    { text: "Just More", link: "/qol/just-more" },
                    { text: "Smeltables", link: "/qol/smeltables" },
                    { text: "Stonecutterables", link: "/qol/stonecutterables" },
                    { text: "Unpackables", link: "/qol/unpackables" },
                ],
            },
            {
                text: "Texture Improvement",
                collapsed: false,
                items: [
                    { text: "Clear Glass", link: "/texture-improvement/clear-glass" },
                    { text: "Darker Dark Oak Leaves", link: "/texture-improvement/darker-dark-oak-leaves" },
                    { text: "Different Stems", link: "/texture-improvement/different-stems" },
                    { text: "Fancier Sunflower", link: "/texture-improvement/fancier-sunflower" },
                    { text: "Fully Grown Kelp", link: "/texture-improvement/fully-grown-kelp" },
                    { text: "Golden Savanna", link: "/texture-improvement/golden-savanna" },
                    { text: "Pink End Rods", link: "/texture-improvement/pink-end-rods" },
                    { text: "Sticky Piston Sides", link: "/texture-improvement/sticky-piston-sides" },
                    { text: "Texture Variations", link: "/texture-improvement/texture-variations" },
                    { text: "Villager Skin Tones", link: "/texture-improvement/villager-skin-tones" },
                    { text: "Zombie Variations", link: "/texture-improvement/zombie-variations" },
                ],
            },
            {
                text: "Updates",
                collapsed: false,
                items: getUpdatesSidebar(),
            },
        ],

        socialLinks: [
            { icon: "github", link: "https://github.com/daniswastaken/bedrock-perfected" },
            { icon: "discord", link: "https://discord.gg/R6b8HzYKtg" }
        ],
    },
});
