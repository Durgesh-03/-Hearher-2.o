import { z } from 'zod';

export const complaintSchema = z.object({
    // Step 1: Incident Details
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(2, 'Location is required'),
    type: z.enum(['verbal', 'physical', 'cyber', 'quid_pro_quo']).describe('Please select a complaint type'),

    // Step 2: Description
    description: z.string().min(20, 'Please provide more detail (at least 20 characters)'),
    severity: z.number().min(1).max(5).default(3),

    // Step 3: Involved Parties
    accusedName: z.string().optional(),
    witnesses: z.string().optional(),

    // Step 4: Evidence
    evidenceFiles: z.array(z.string()).optional(),

    // Meta
    isAnonymous: z.boolean().default(false),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

export const COMPLAINT_TYPES = [
    { value: 'verbal' as const, label: 'Verbal Harassment', icon: '🗣️', desc: 'Inappropriate comments, slurs, jokes' },
    { value: 'physical' as const, label: 'Physical Harassment', icon: '✋', desc: 'Unwanted touching, blocking, stalking' },
    { value: 'cyber' as const, label: 'Cyber Harassment', icon: '💻', desc: 'Online messages, emails, social media' },
    { value: 'quid_pro_quo' as const, label: 'Quid Pro Quo', icon: '⚖️', desc: 'Favors demanded in exchange for benefits' },
];
