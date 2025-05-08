import passport from 'passport';

export default {
  methods: ["get"],
  endpoint: "/auth/google",
  middleware: false,
  Get: passport.authenticate('google', { scope: ['profile', "email"] })
};