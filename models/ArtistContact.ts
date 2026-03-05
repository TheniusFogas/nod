import mongoose, { Schema } from 'mongoose';

const ArtistContactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    website: { type: String },
    consentToContact: { type: Boolean, default: false },
    lastAppliedDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const ArtistContact = mongoose.models.ArtistContact || mongoose.model('ArtistContact', ArtistContactSchema);
export default ArtistContact;
