const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const socialLogin = async (provider, token) => {
  try {
    // Call your backend to verify token and get user info
    // The backend should verify the token with Google/Facebook APIs
    const response = await fetch(`${API_URL}/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        token
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Social login error:', error);
    throw error;
  }
};

// Handle Google Credential Response
export const handleGoogleLogin = (response) => {
  if (response.credential) {
    return {
      token: response.credential,
      provider: 'google'
    };
  }
};

// Handle Facebook Login Response
export const handleFacebookLogin = (response) => {
  if (response.authResponse) {
    return {
      token: response.authResponse.accessToken,
      provider: 'facebook'
    };
  }
};