// lib/models.ts
import { Artist } from '@/models/Artist';
import { Exhibition } from '@/models/Exhibition';
import { Settings } from '@/models/Settings';
import { News } from '@/models/News';
import { OpenCall, OpenCallApplication } from '@/models/OpenCall';
import { Sponsor } from '@/models/Sponsor';
import { TeamMember } from '@/models/TeamMember';
import { PageContent } from '@/models/PageContent';
import { ArtistContact } from '@/models/ArtistContact';
import { ContactInquiry } from '@/models/ContactInquiry';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';

/**
 * Centralized Model Registry
 * This ensures all Mongoose models are registered in the current process
 * before any operations (like populate) are performed. 
 * Critical for Vercel Serverless cold-starts.
 */
export const Models = {
    Artist,
    Exhibition,
    Settings,
    News,
    OpenCall,
    OpenCallApplication,
    Sponsor,
    TeamMember,
    PageContent,
    ArtistContact,
    ContactInquiry,
    NewsletterSubscriber,
};

console.log('✅ [Mongoose] Centralized Model Registry initialized.');
