import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { GoogleIdentity } from './google-identity.js';

@Injectable()
export class GoogleCredentialVerifier {
  async verify(credential: string, audience: string): Promise<GoogleIdentity> {
    try {
      const client = new OAuth2Client(audience);
      const ticket = await client.verifyIdToken({ idToken: credential, audience });
      const payload = ticket.getPayload();
      const email = payload?.email?.trim();
      const subject = payload?.sub?.trim();
      if (!payload?.email_verified || !email || !subject) {
        throw invalidCredential();
      }
      return {
        email,
        subject,
        givenName: stringClaim(payload.given_name),
        familyName: stringClaim(payload.family_name),
        pictureUrl: stringClaim(payload.picture),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw invalidCredential();
    }
  }
}

function stringClaim(value: string | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

function invalidCredential(): UnauthorizedException {
  return new UnauthorizedException('Invalid Google credential');
}
