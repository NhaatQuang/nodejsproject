require('dotenv').config();
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Kiểm tra API key
if (!GEMINI_API_KEY) {
    console.error('❌ CẢNH BÁO: GEMINI_API_KEY chưa được cấu hình trong file .env');
    process.exit(1);
}

console.log('✅ Gemini API Key đã load:', 
    process.env.GEMINI_API_KEY.substring(0, 10) + '...'
);

async function generateContent(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(body);
                    
                    if (jsonResponse.candidates && jsonResponse.candidates[0]) {
                        const text = jsonResponse.candidates[0].content.parts[0].text;
                        resolve({
                            response: {
                                text: () => text
                            }
                        });
                    } else if (jsonResponse.error) {
                        reject(new Error(jsonResponse.error.message));
                    } else {
                        reject(new Error('Unexpected response format'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    generateContent: generateContent
};