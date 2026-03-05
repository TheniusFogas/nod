import mongoose, { Schema, models } from 'mongoose';

const ArtistSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String }, // Short bio for listing
    content: { type: String }, // Rich text for detail page
    nationality: { type: String },
    photo: { type: String }, // Legacy fallback
    profileImage: {
        public_id: { type: String },
        url: { type: String },
        blurDataURL: { type: String }
    },
    socials: {
        instagram: { type: String },
        website: { type: String }
    },
    tags: [{ type: String }], // Fast filtering
    exhibitions: [{ type: Schema.Types.ObjectId, ref: 'Exhibition' }], // True relational architecture
    gallery: [{ type: String }], // Array of image URLs (can be refactored to Object later)
    membership: {
        type: String,
        enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
        default: 'Bronze'
    },
    order: { type: Number, default: 0 }, // For Platinum sorting
    visibilityEnd: { type: Date }, // Until when it shows on site
    featured: { type: Boolean, default: false },
}, { timestamps: true, autoIndex: false });

ArtistSchema.index({ tags: 1 }); // Required index for filtering arrays instantly
ArtistSchema.index({ membership: 1, order: 1 }); // Critical Compound Index for hierarchical rendering
ArtistSchema.index({ featured: 1, order: 1 }); // Performance for Homepage featured artists

export const Artist = models.Artist || mongoose.model('Artist', ArtistSchema);
export default Artist;
