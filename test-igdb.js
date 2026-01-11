const fs = require('fs');
const https = require('https');

// Simple validation of .env.local reading
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const getEnv = (key) => {
        const match = env.match(new RegExp(`${key}=([^\\s]+)`)); // simple regex preventing trailing spaces/newlines issues
        return match ? match[1] : null;
    };

    const clientId = getEnv('IGDB_CLIENT_ID');
    const clientSecret = getEnv('IGDB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
        console.error('Missing credentials in .env.local');
        process.exit(1);
    }

    console.log(`Testing credentials...`);
    // console.log(`Client ID: ${clientId}`);

    const req = https.request(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    }, (res) => {
        console.log(`Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (d) => data += d);
        res.on('end', () => {
            console.log('Response:', data);
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    req.end();

} catch (e) {
    console.error('Error reading .env.local', e);
}
