import mongoose, { Schema, models } from 'mongoose';

const TeamMemberSchema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String },
    photo: { type: String },
    order: { type: Number, default: 0 },
    email: { type: String },
    website: { type: String },
}, { timestamps: true });

export const TeamMember = models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
export default TeamMember;
