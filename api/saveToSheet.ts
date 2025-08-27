import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { UserAnswer } from '../types';

export const config = {
  runtime: 'nodejs', // Use Node.js runtime for broader API compatibility
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

  try {
    const { userAnswers, mindGrowthReport }: RequestBody = await req.json();

    const {
      GOOGLE_SHEET_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY,
    } = process.env;

    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.error('Google Sheets environment variables not set');
      // Do not expose detailed error to client
      return new Response(JSON.stringify({ error: 'Server configuration error for saving data.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Authenticate with Google Sheets API
    const auth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = 'Sheet1'; // Or use another env var for sheet name

    // Flatten the user answers into a single row array
    const rowData: (string | number)[] = [new Date().toISOString()];
    
    // Assuming 3 scenarios as per TOTAL_SCENARIOS in the frontend
    for (let i = 0; i < 3; i++) {
        const answer = userAnswers[i];
        if (answer) {
            rowData.push(
                answer.scenario || '',
                answer.selectedEmotionTexts.join(', ') || '',
                answer.selectedResponseText || '',
                answer.writtenResponse || ''
            );
        } else {
            // Push empty strings if an answer is missing
            rowData.push('', '', '', '');
        }
    }
    
    rowData.push(mindGrowthReport || '');
    
    // Append the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!A1`, // Append after the last row in this sheet
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to save data.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}