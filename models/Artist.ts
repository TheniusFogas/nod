import mongoose, { Schema, models } from 'mongoose';

const ArtistSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String }, // Short bio for listing
    content: { type: String }, // Rich text for detail page
    nationality: { type: String },
    website: { type: String },
    photo: { type: String },
    gallery: [{ type: String }], // Array of image URLs
    membership: {
        type: String,
        enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
        default: 'Bronze'
    },
    order: { type: Number, default: 0 }, // For Platinum sorting
    visibilityEnd: { type: Date }, // Until when it shows on site
    featured: { type: Boolean, default: false },
}, { timestamps: true });

export default models.Artist || mongoose.model('Artist', ArtistSchema);
