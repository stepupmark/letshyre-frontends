export type Strength = 0 | 1 | 2 | 3 | 4

const COMMON =
  /^(password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|abc123|123456|111111)/i
const CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]

/** 0 empty, 1 weak, 2 fair, 3 good, 4 strong. A rough guide, not a gate. */
export function passwordStrength(password: string): Strength {
  if (!password) return 0
  if (password.length < 8 || COMMON.test(password) || /^(.)\1+$/.test(password))
    return 1
  const variety = CLASSES.filter((re) => re.test(password)).length
  const points =
    variety + (password.length >= 12 ? 1 : 0) + (password.length >= 16 ? 1 : 0)
  return points >= 5 ? 4 : points >= 4 ? 3 : 2
}
