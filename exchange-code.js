// exchange-code.js
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
"401594956559-mn0l8h4emk41q7tu9lreeh6bjt6moo53.apps.googleusercontent.com",
  "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",
  "https://hunting-job-resume-gen.vercel.app/api/auth/callback/google"
);

async function main() {
  const { tokens } = await oauth2Client.getToken("4%2F0AeoWuM8kPHEXS4aR6HLCdT2VT51bVkcnX7p_lkM-HwjTVDpTvGBMMdQpOVU6ZNBPxNrOlg&redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&client_id=401594956559-mn0l8h4emk41q7tu9lreeh6bjt6moo53.apps.googleusercontent.com&client_secret=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&scope=&grant_type=authorization_code");
  console.log(tokens);
}

main();