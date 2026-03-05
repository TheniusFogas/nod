import mongoose, { Schema, models } from 'mongoose';

const ContactInquirySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export const ContactInquiry = models.ContactInquiry || mongoose.model('ContactInquiry', ContactInquirySchema);
export default ContactInquiry;
