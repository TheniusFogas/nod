import mongoose, { Schema, models } from 'mongoose';

const OpenCallSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    requirements: { type: String },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    showOnHomepage: { type: Boolean, default: false },
    coverImage: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    ogImage: { type: String },
}, { timestamps: true });

const OpenCallApplicationSchema = new Schema({
    callId: { type: Schema.Types.ObjectId, ref: 'OpenCall', required: true },
    callTitle: { type: String },
    artistName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    portfolioUrl: { type: String },
    videoLink: { type: String },
    statement: { type: String },
    cv: { type: String },
    images: [{
        url: { type: String },
        publicId: { type: String }
    }],
    agreeToContact: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const OpenCall = models.OpenCall || mongoose.model('OpenCall', OpenCallSchema);
export const OpenCallApplication = models.OpenCallApplication || mongoose.model('OpenCallApplication', OpenCallApplicationSchema);
