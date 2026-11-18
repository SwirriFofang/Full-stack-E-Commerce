export const PASSWORD_RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One capital letter", (p) => /[A-Z]/.test(p)],
  ["One number", (p) => /[0-9]/.test(p)],
  ["One special character, for example ! @ # $ %", (p) => /[^A-Za-z0-9]/.test(p)],
];

export const isStrongPassword = (p) => p.length <= 72 && PASSWORD_RULES.every(([, test]) => test(p));