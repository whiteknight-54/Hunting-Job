// get-refresh-token.js
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  "401594956559-mn0l8h4emk41q7tu9lreeh6bjt6moo53.apps.googleusercontent.com",
  "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",
  "https://hunting-job-resume-gen.vercel.app/api/auth/callback/google"
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

console.log(url);