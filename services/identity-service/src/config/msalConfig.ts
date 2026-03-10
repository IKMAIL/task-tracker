export interface MsalConfig {
  clientId: string | undefined;
  clientSecret: string | undefined;
  tenantId: string | undefined;
}

const msalConfig: MsalConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID,
};

export default msalConfig;
