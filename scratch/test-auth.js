const { login, isAuthorized } = require('../lib/admin-auth');

console.log('--- Testing Admin Authentication ---');

function mockReqRes(username, password) {
  return new Promise((resolve) => {
    const req = { body: { username, password } };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { resolve({ status: this.statusCode, data }); }
    };
    login(req, res);
  });
}

async function runTests() {
  // Test 1: Milan_Rathod with Milan@007
  const t1 = await mockReqRes('Milan_Rathod', 'Milan@007');
  console.log('Test 1 (Milan_Rathod, Milan@007):', t1.status === 200 ? 'SUCCESS' : 'FAILED', t1);
  if (t1.data && t1.data.token) {
    const authOk = isAuthorized({ headers: { authorization: `Bearer ${t1.data.token}` } });
    console.log('Token authorization check:', authOk ? 'VALID' : 'INVALID');
  }

  // Test 2: Case insensitive username: milan_rathod with Milan@007
  const t2 = await mockReqRes('milan_rathod', 'Milan@007');
  console.log('Test 2 (milan_rathod, Milan@007):', t2.status === 200 ? 'SUCCESS' : 'FAILED');

  // Test 3: milan_admin with Milan@007
  const t3 = await mockReqRes('milan_admin', 'Milan@007');
  console.log('Test 3 (milan_admin, Milan@007):', t3.status === 200 ? 'SUCCESS' : 'FAILED');

  // Test 4: Invalid password should fail with 401
  const t4 = await mockReqRes('Milan_Rathod', 'WrongPassword123');
  console.log('Test 4 (Wrong password):', t4.status === 401 ? 'SUCCESS (Rejected)' : 'FAILED');
}

runTests();
