import mongoose, { Schema, models } from 'mongoose';

const NewsletterSubscriberSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["artist", "lover"], default: "lover" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const NewsletterSubscriber = models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
