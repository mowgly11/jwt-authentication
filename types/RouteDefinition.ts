import type { Profile } from "passport";

export interface GoogleProfile extends Profile {
    email: string;
    email_verified: boolean;
}