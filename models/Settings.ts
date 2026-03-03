import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
    img: { type: String, required: true },
    eyebrow: { type: String },
    title: { type: String },
    subtitle: { type: String },
    link: { type: String },
});

const SettingsSchema = new mongoose.Schema({
    heroSlides: [HeroSlideSchema],
    galleryName: { type: String, default: 'NOD FLOW' },
    aboutText: { type: String },
    contactEmail: { type: String },
    footerText: { type: String, default: '© 2026 NOD FLOW. All rights reserved.' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
