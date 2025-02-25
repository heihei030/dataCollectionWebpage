window.onload = function() {
    const cognitoConfig = {
        UserPoolId: 'ap-northeast-1_cx1YTWgh2',
        ClientId: '6lk2ne4rsvk63bmj2peqmi1es1'
    };

    // Use the global AmazonCognitoIdentity object 
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(cognitoConfig);

    function login(email, password) {
        const authenticationData = {
            Username: email,
            Password: password
        };

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        
        const userData = {
            Username: email,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function(result) {
                    console.log('Login successful!');
                    const token = result.getIdToken().getJwtToken();
                    console.log('Token details:', {
                        length: token.length,
                        start: token.substring(0, 10) + '...',
                        type: typeof token
                    });
                    localStorage.setItem('token', token);
                    resolve(token);
                },
                onFailure: function(err) {
                    console.error('Login failed:', err);
                    reject(err);
                },
                newPasswordRequired: function(userAttributes, requiredAttributes) {
                    // Don't pass any attributes back
                    const newAttributes = {};
                    
                    // Prompt user for new password
                    const newPassword = prompt('Please enter a new password:');
                    if (newPassword) {
                        cognitoUser.completeNewPasswordChallenge(newPassword, newAttributes, {
                            onSuccess: function(result) {
                                console.log('Password changed successfully');
                                const token = result.getIdToken().getJwtToken();
                                localStorage.setItem('token', token);
                                resolve(token);
                            },
                            onFailure: function(err) {
                                console.error('Failed to change password:', err);
                                reject(err);
                            }
                        });
                    } else {
                        reject(new Error('New password is required'));
                    }
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

    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        document.getElementById('login-section').classList.add('d-none');
        document.getElementById('dashboard').classList.remove('d-none');
        initDashboard();
    }
}; 