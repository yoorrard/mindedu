import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { UserAnswer } from '../types';

export const config = {
  runtime: 'nodejs',
};

interface RequestBody {
    userAnswers: UserAnswer[];
    mindGrowthReport: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log("Received request to save data to Google Sheet.");

  try {
    const { userAnswers, mindGrowthReport }: RequestBody = await req.json();

    const {
      GOOGLE_SHEET_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY,
      GOOGLE_SHEET_NAME, // New optional env var
    } = process.env;

    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.error('One or more required Google Sheets environment variables are missing.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log("All required environment variables are present.");

    // The private key from Vercel env vars often has escaped newlines.
    // We need to replace them with actual newline characters.
    const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = GOOGLE_SHEET_NAME || 'Sheet1';
    console.log(`Attempting to write to sheet: ${sheetName}`);

    // Flatten the user answers into a single row array
    const rowData: (string | number)[] = [new Date().toISOString()];
    
    // Assuming 3 scenarios as per TOTAL_SCENARIOS in the frontend
    for (let i = 0; i < 3; i++) {
        const answer = userAnswers[i];
        rowData.push(
            answer?.scenario || '',
            answer?.selectedEmotionTexts.join(', ') || '',
            answer?.selectedResponseText || '',
            answer?.writtenResponse || ''
        );
    }
    
    rowData.push(mindGrowthReport || '');
    
    console.log("Row data prepared. Appending to sheet...");

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!A1`, // Append after the last row in this sheet
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });
    
    console.log("Successfully appended data to Google Sheet.", response.data);


    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // Log the detailed error on the server for debugging
    console.error('!!! Critical Error saving to Google Sheet:', error);
     if (error.response && error.response.data) {
         console.error('Google API Error Details:', error.response.data.error);
    }

    // Return a generic error to the client
    return new Response(JSON.stringify({ error: 'Failed to save data due to a server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
