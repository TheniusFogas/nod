import mongoose, { Schema, models } from 'mongoose';

const NewsSchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    excerpt: { type: String },
    content: { type: String },
    link: { type: String },
    image: { type: String },
    images: [{ type: String }],
    source: { type: String },
    featured: { type: Boolean, default: false },
    author: {
        name: { type: String },
        bio: { type: String },
        avatar: { type: String },
    },
}, { timestamps: true });

export const News = models.News || mongoose.model('News', NewsSchema);
