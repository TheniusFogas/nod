import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
    img: { type: String, required: true },
    eyebrow: { type: String },
    title: { type: String },
    subtitle: { type: String },
    link: { type: String },
});

const NavLinkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    href: { type: String, required: true },
    children: [{ label: String, href: String }],
});

const FooterLinkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    href: { type: String, required: true },
});

const FooterColumnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    links: [FooterLinkSchema],
});

const SettingsSchema = new mongoose.Schema({
    heroSlides: [HeroSlideSchema],
    galleryName: { type: String, default: 'NOD FLOW' },
    logoUrl: { type: String, default: '' },
    navLinks: [NavLinkSchema],
    footerColumns: [FooterColumnSchema],
    aboutText: { type: String },
    contactEmail: { type: String, default: 'info@nodflo.com' },
    contactPhone: { type: String },
    pressEmail: { type: String, default: 'press@nodflo.com' },
    address: { type: String, default: 'Bucharest, Romania' },
    hours: { type: String, default: 'Tuesday — Saturday, 11:00 — 18:00' },
    mapUrl: { type: String },
    footerDescription: { type: String, default: 'A contemporary art gallery dedicated to presenting groundbreaking exhibitions.' },
    footerText: { type: String, default: '© 2026 NOD FLOW. All rights reserved.' },
    socialLinks: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        youtube: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        x: { type: String, default: '' },
    },
    homepageExtraTitle: { type: String },
    homepageExtra2Content: { type: String },
    homepageExtra2Image: { type: String },
    googleVerification: { type: String, default: '' },
    customHeadScripts: { type: String, default: '' },
}, { timestamps: true });

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
export default Settings;
