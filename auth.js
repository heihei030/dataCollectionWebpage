const AmazonCognitoIdentity = AWSCognito.CognitoIdentityServiceProvider;

const cognitoConfig = {
    UserPoolId: 'YOUR_USER_POOL_ID',
    ClientId: 'YOUR_CLIENT_ID'
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(cognitoConfig);

function login(email, password) {
    const authData = {
        Username: email,
        Password: password
    };

    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);
    const userData = {
        Username: email,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
                const token = result.getIdToken().getJwtToken();
                localStorage.setItem('token', token);
                resolve(token);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
}

function showSignup() {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('signup-section').classList.remove('d-none');
}

function showLogin() {
    document.getElementById('signup-section').classList.add('d-none');
    document.getElementById('login-section').classList.remove('d-none');
}

function signUp(email, password) {
    return new Promise((resolve, reject) => {
        const attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'email',
                Value: email
            })
        ];

        userPool.signUp(email, password, attributeList, null, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result.user);
        });
    });
}

// Add signup form handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        await signUp(email, password);
        alert('Sign up successful! Please check your email for verification code.');
        showLogin();
    } catch (error) {
        alert('Sign up failed: ' + error.message);
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await login(email, password);
        document.getElementById('login-section').classList.add('d-none');
        document.getElementById('dashboard').classList.remove('d-none');
        initDashboard();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}); 