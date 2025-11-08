import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (
    payload: Record<string, unknown>,
    secret: Secret,
    expiresIn: string,
): string => {
    const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn,
    } as SignOptions);

    return token;
};

const verifyToken = (token: string, secret: Secret) => {
    const [, tokenValue] = token.split(" ");

    return jwt.verify(tokenValue, secret) as JwtPayload;
};

export const jwtHelpers = {
    generateToken,
    verifyToken,
};
