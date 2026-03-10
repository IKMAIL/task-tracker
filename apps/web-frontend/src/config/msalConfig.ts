import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId:    process.env.REACT_APP_MICROSOFT_CLIENT_ID as string,
    authority:   `https://login.microsoftonline.com/${process.env.REACT_APP_MICROSOFT_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const loginRequest = { scopes: ['openid', 'profile', 'email'] };
