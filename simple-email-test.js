// Simple email test
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'gadiazsaavedra@gmail.com',
    pass: 'vvsurjyyatvoxblh'
  }
});

async function testEmail() {
  try {
    console.log('Testing Gmail configuration...');
    await transporter.verify();
    console.log('✅ Gmail configuration is valid!');
    console.log('✅ Email service ready for production');
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
  }
}

testEmail();