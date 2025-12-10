'use client';

import { LicenseInfo } from '@mui/x-license-pro';

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY || '');

function MuiXLicense() {
  return null;
}

export default MuiXLicense;
export { MuiXLicense };
