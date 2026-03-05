import mongoose, { Schema, models } from 'mongoose';

const PageContentSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    sidebarTitle: { type: String },
    sidebarContent: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    ogImage: { type: String },
}, { timestamps: true });

export const PageContent = models.PageContent || mongoose.model('PageContent', PageContentSchema);
