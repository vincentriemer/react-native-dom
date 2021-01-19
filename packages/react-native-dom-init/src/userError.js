export class UserError extends Error {
    constructor(message, exitCode) {
        super(message);
        this.exitCode = exitCode;
    }
}

export const userError = (err, exitCode) => {
    throw new UserError(err, exitCode);
}
