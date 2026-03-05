import mongoose, { Schema, models } from 'mongoose';

const ExhibitionSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    artist: { type: String }, // Keep for backward compatibility or as summary
    artists: [{
        artist: { type: Schema.Types.ObjectId, ref: 'Artist' },
        manualName: { type: String }
    }],
    exhibitionType: { type: String, enum: ['Solo', 'Group'], default: 'Solo' },
    type: { type: String, enum: ['current', 'upcoming', 'past'], default: 'current' },
    startDate: { type: Date },
    endDate: { type: Date },
    location: {
        name: { type: String, default: 'NOD FLOW Gallery' },
        address: { type: String },
        mapUrl: { type: String }
    },
    coverImage: { type: String },
    images: [{ type: String }],
    description: { type: String },
    pressRelease: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    ogImage: { type: String },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

ExhibitionSchema.index({ slug: 1 }, { unique: true });
ExhibitionSchema.index({ type: 1, startDate: -1 }); // Critical Compound Index for 'Currently on View', 'Past' queries

export default models.Exhibition || mongoose.model('Exhibition', ExhibitionSchema);
