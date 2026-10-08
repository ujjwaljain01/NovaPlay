//config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
      passReqToCallback: false, // Set to true only if you need access to the 'req' object inside this function
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile) {
          return done(new Error("Failed to fetch profile from Google"), null);
        }

        return done(null, profile);
      } catch (error) {
        // Safely forward any unexpected authentication errors to the Express pipeline
        return done(error, null);
      }
    }
  )
);
