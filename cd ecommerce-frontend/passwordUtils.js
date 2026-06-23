const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz'
const NUMBERS = '23456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{}?'

function randomChar(charset) {
  return charset[Math.floor(Math.random() * charset.length)]
}

function shuffle(values) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function generateStrongPassword(length = 16) {
  const safeLength = Math.max(length, 12)
  const allChars = `${UPPERCASE}${LOWERCASE}${NUMBERS}${SYMBOLS}`
  const password = [
    randomChar(UPPERCASE),
    randomChar(LOWERCASE),
    randomChar(NUMBERS),
    randomChar(SYMBOLS),
  ]

  while (password.length < safeLength) {
    password.push(randomChar(allChars))
  }

  return shuffle(password).join('')
}

export function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Enter a password',
      color: 'var(--text-secondary)',
      checks,
      isStrong: false,
    }
  }

  if (score <= 2) {
    return { score, label: 'Weak', color: '#ef4444', checks, isStrong: false }
  }

  if (score <= 4) {
    return { score, label: 'Medium', color: '#f59e0b', checks, isStrong: false }
  }

  return { score, label: 'Strong', color: '#22c55e', checks, isStrong: true }
}