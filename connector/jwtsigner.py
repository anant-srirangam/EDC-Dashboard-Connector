import jwt
import json
import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization

# ========== Your JWK ==========

jwk = {"kty":"OKP","d":"TKCye-NsP8zT6ZwblQZLvAq2Xg4DraThppFU0Kojsj8","crv":"Ed25519","kid":"did:web:host.docker.internal%3A7083#key-1","x":"2EI7Q8lNEwJKGiaIEIysPX-3CL7TX1QTYwZOufgdslg"}

# Decode the private key (d) from Base64URL:
d_b64 = jwk["d"]
# Add padding if needed
padding = '=' * ((4 - len(d_b64) % 4) % 4)
d_bytes = base64.urlsafe_b64decode(d_b64 + padding)

private_key = Ed25519PrivateKey.from_private_bytes(d_bytes)

# ========== JWT Header & Payload ==========

header = {
    "alg": "EdDSA",
    "kid": jwk["kid"],
    "typ": "JWT"
}

payload = {
              "iss": "did:web:host.docker.internal%3A7083",
              "sub": "did:web:host.docker.internal%3A27083",
              "vc": {
                  "@context": [
                      "https://www.w3.org/2018/credentials/v1",
                      "https://w3id.org/security/suites/jws-2020/v1",
                      "https://www.w3.org/ns/did/v1",
                      {
                          "mvd-credentials": "https://w3id.org/mvd/credentials/",
                          "membership": "mvd-credentials:membership",
                          "membershipType": "mvd-credentials:membershipType",
                          "website": "mvd-credentials:website",
                          "contact": "mvd-credentials:contact",
                          "since": "mvd-credentials:since"
                      }
                  ],
                  "id": "http://org.yourdataspace.com/credentials/fed-mem",
                  "type": [
                      "VerifiableCredential",
                      "MembershipCredential"
                  ],
                  "issuer": "did:web:host.docker.internal%3A7083",
                  "issuanceDate": "2023-08-18T00:00:00Z",
                  "credentialSubject": {
                      "id": "did:web:host.docker.internal%3A27083",
                      "membership": {
                          "membershipType": "FullMember",
                          "website": "www.whatever.com",
                          "contact": "mix.max@whatever.com",
                          "since": "2023-01-01T00:00:00Z",
                          "testKey": "rawVc"
                      }
                  }
              }
          }

# ========== Encode / Sign JWT ==========

raw_vc_jwt = jwt.encode(
    payload,
    private_key,
    algorithm="EdDSA",
    headers=header
)

print("Signed JWT (rawVc):")
print(raw_vc_jwt)
