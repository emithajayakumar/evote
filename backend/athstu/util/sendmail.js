import nodemailer from 'nodemailer'
import dotenv from 'dotenv'


dotenv.config();
 const transport=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
 });

export const sendOtp=async(email,otp)=>{
    const mailOption={
        from:process.env.EMAIL_USER,
        to:email,
        subject:'otp send',
        text:`your otp is ${otp}`
    }
    try {
        await transport.sendMail(mailOption);
        console.log('mail send successfully');
        
    } catch (error) {
        console.log('error occured at otp',error)
        throw new Error('failed to send otp')
    }
 }