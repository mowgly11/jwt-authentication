import { Strategy } from 'passport-google-oauth2';
import passport, { type DoneCallback } from 'passport';
import type { Request } from 'express';
import type { GoogleProfile } from "../types/RouteDefinition.ts";
import { Authentication } from "../database/methods.ts";

function initializePassport() {
    passport.use(
        new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL!,
                passReqToCallback: true,
                scope: ['profile', 'email']
            },
            async function (
                req: Request,
                accessToken: string,
                refreshToken: string,
                profile: GoogleProfile,
                done: DoneCallback
            ) {
                if(!profile) return done("No user found", false);
                const user = await Authentication.findUserById(profile.id);
                if(user) return done(null, profile);
                
                let newUser = await Authentication.createUser(profile);
                if(!newUser) return done("Failed to create new user", false);

                await newUser.save();

                return done(null, profile);
            }
        )
    );
}

export default initializePassport;