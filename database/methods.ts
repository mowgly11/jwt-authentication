import auth_schema from "./schemas/auth_schema.ts";
import blacklist_schema from "./schemas/blacklist_schema.ts";
import type { GoogleProfile } from "../types/RouteDefinition.ts";

export class Authentication {
    static async findUserById(id: string): Promise<any> {
        try {
            const userProfile = await auth_schema.findOne({ id });
            if (userProfile != null) return userProfile;
        } catch (err) {
            return null;
        }
    }

    static async createUser(profile: GoogleProfile): Promise<any> {
        try {
            const newUser = await auth_schema.create({
                id: profile.id,
                username: profile.displayName?.trim().toLowerCase().replace(/ /g, "_") ?? "john_doe",
                creationDate: Date.now(),
                email: profile.email?.trim().toLowerCase()
            });

            if (newUser != null) return newUser;
        } catch (err) {
            console.log(err)
            return null;
        }
    }
}