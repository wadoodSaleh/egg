const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 9000;
const HOST = 'localhost';

function makeRequest(path, method, data, cookies = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

function parseCookies(response) {
  const list = {};
  const rc = response.headers['set-cookie'];

  rc && rc.forEach((cookie) => {
    const parts = cookie.split(';')[0].split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

async function runTest() {
  console.log('--- Starting Session Integrity Test ---');

  // 1. Create a User / Login
  const username = 'testuser_' + Date.now();
  const email = `${username}@example.com`;
  const password = 'password123';
  const postData = querystring.stringify({
    username,
    email,
    password
  });

  console.log(`\n1. Registering/Logging in user: ${email}`);
  try {
    const loginRes = await makeRequest('/login', 'POST', postData);
    
    // Check if we got a redirect (likely to /menu)
    if (loginRes.statusCode !== 302) {
      console.error('Failed to login. Status:', loginRes.statusCode);
      // console.error('Body:', loginRes.body);
      return;
    }

    // Get the cookie
    const rawCookies = loginRes.headers['set-cookie'];
    if (!rawCookies) {
      console.error('No cookies received!');
      return;
    }
    
    console.log('Login successful. Received cookies:', rawCookies);

    // Filter for our session cookie (userId)
    // Express signed cookie starts with s:
    const sessionCookieStr = rawCookies.find(c => c.startsWith('userId='));
    const sessionCookieVal = sessionCookieStr.split(';')[0]; // userId=s%3A...
    
    console.log(`Session Cookie: ${sessionCookieVal}`);

    if (!sessionCookieVal.includes('s%3A')) {
        console.warn("WARNING: Cookie does not appear to be signed (missing 's:' prefix)!");
    } else {
        console.log("Cookie format looks signed (contains 's:').");
    }

    // 2. Verify Valid Access
    console.log('\n2. Verifying access with VALID cookie...');
    const accessRes = await makeRequest('/menu', 'GET', null, sessionCookieVal);
    
    if (accessRes.statusCode === 200) {
        console.log('SUCCESS: Access granted with valid cookie.');
    } else {
        console.error(`FAILURE: Valid cookie was rejected? Status: ${accessRes.statusCode}`);
    }

    // 3. Verify Tampered Access
    console.log('\n3. Verifying access with TAMPERED cookie...');
    
    // Tamper the cookie: Change the payload part or signature
    // Format is likely: userId=s%3A<value>.<signature>
    // Let's modify the signature (last part)
    let tamperedCookieVal = sessionCookieVal;
    if (tamperedCookieVal.includes('.')) {
        // Change the last character
        tamperedCookieVal = tamperedCookieVal.substring(0, tamperedCookieVal.length - 1) + 'X';
    } else {
        tamperedCookieVal = tamperedCookieVal + 'tampered';
    }

    console.log(`Tampered Cookie: ${tamperedCookieVal}`);

    const tamperedRes = await makeRequest('/menu', 'GET', null, tamperedCookieVal);
    
    if (tamperedRes.statusCode === 302) {
        // Assuming redirect to / login page on failure
        if (tamperedRes.headers.location === '/') {
            console.log('SUCCESS: Tampered cookie was REJECTED (Redirected to /).');
        } else {
            console.log(`PARTIAL: Redirected to ${tamperedRes.headers.location}, assuming rejection.`);
        }
    } else if (tamperedRes.statusCode === 200) {
        console.error('CRITICAL FAILURE: Tampered cookie was ACCEPTED!');
    } else {
        console.log(`SUCCESS: Tampered cookie resulted in status ${tamperedRes.statusCode} (Expected non-200).`);
    }

  } catch (err) {
    console.error('Test Error:', err);
  }
}

runTest();
