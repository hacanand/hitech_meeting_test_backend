import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const CREDENTIALS_PATH = "credentials.json";
// Path to save the token
const TOKEN_PATH = "token.json";
// Scopes for accessing Google Calendar
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export function generateToken() {
  // Load client secrets from a local file
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
      console.error("Error loading client secret file:", err);
      return;
    }
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Generate the authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL:", authUrl);

    // Prompt user for the authorization code
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error("Error retrieving access token", err);
          return;
        }
        oAuth2Client.setCredentials(token);

        // Save the token to a file for future use
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
      });
    });
  });
}

export function authorize(callback) {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
  } else {
    console.log("Run the standalone script to generate a token.");
  }
}
