import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: ts-node hash-password.ts <password>');
    process.exit(1);
  }

  const password = process.argv[2];
  try {
    const hashedPassword = await hashPassword(password);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

main();