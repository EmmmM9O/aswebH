import nodemailer from 'nodemailer';
import MailConfig from '../QQEmail';
var transporter = nodemailer.createTransport(MailConfig);
export default {
    transporter:transporter
}