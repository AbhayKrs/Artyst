import passport from 'passport';
import googlestrategy from 'passport-google-oauth20';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const GoogleStrategy = googlestrategy.Strategy;

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1.01/auth/google/callback",
        passReqToCallback: true,
        proxy: true
    },
        async function (accessToken, refreshToken, profile, cb) {
            console.log("user", profile);

            try {
                //Check user table for anyone with the Google ID
                const user = await User.findOne({ email: profile.emails[0].value });
                console.log("user", user);

                if (!user) {
                    //User does not exist in DB, create a new user entry with google creds
                    const newUser = new User({
                        google_id: profile.id,
                        google_authenticated: true,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value.substring(0, profile.emails[0].value.indexOf("@")),
                        password: 'test12',
                        avatar: {
                            icon: '6cbaa37fa59b0caee31dc4b8cdd67d72.png',
                            category: 'None'
                        }
                    })
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(res => {
                                return cb(null, profile);
                            });
                        })
                    })
                } else {
                    //User exist in DB, check if google authenticated
                    if (user.google_authenticated === false) {
                        user.google_id = profile.id;
                        user.google_authenticated = true;
                        user.save().then(res => {
                            return cb(null, user)
                        });
                    }
                    return cb(null, user)
                }
            } catch (err) {
                console.log("err", err);
                return cb(err, profile);
            }
        }))