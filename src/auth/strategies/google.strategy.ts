import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import * as config from "@nestjs/config";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";

// const test = new Strategy({
//     clientID:,
//     clientSecret:,
//     callbackURL:,
//     scope:,
// })

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(googleOauthConfig.KEY) 
        private googleConfiguration: config.ConfigType<typeof googleOauthConfig>,
        private authService: AuthService,
        private userService: UsersService
    ) {
        super({
            clientID: googleConfiguration.clientID!,
            clientSecret: googleConfiguration.clientSecret!,
            callbackURL: googleConfiguration.callbackURL!,
            scope: ['email', 'profile'],
        })
    }

    // async validate(
    //     accessToken: string,
    //     refreshToken: string,
    //     profile: any,
    //     done: VerifyCallback,
    // ) {
    //     console.log(profile)
    //     const user = await this.authService.validateGoogleUser({
    //         email: profile.emails[0].value,
    //         password: ""
    //     })
    //     done(null, user)
    // }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ) {
        const email = profile.emails[0].value;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            // Redirect the user to a registration page instead of throwing
            return done(null, false, { redirectUrl: `/register` });
        }

        done(null, user);
    }
}