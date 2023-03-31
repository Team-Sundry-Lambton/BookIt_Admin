const express = require('express')
let app = express.Router()
const session = require('express-session');
const admin = require('firebase-admin');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set secure: true if using HTTPS
    maxAge: 3600000 // Set the session to expire in 1 hour
  } 
}));
const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const cors = require('cors');
const bucket = admin.storage().bucket();
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const path = require('path');
const rootFolder = process.cwd();
const {
  getBooking
} = require(path.join(rootFolder, "/controllers/admin/bookingController"));


const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_MAILER_CLIENT_ID = '384103339430-27qqhu0at6qnh5of61onuvicaf1094kg.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04hMr66cGLALOCgYIARAAGAQSNwF-L9IrDapDARzYOx-pZV964EdVepXqqLMVYhpU3QVIJKzA9VPX_5bqLgdA3htPTq_Ywe__3IA'
const ADMIN_EMAIL_ADDRESS = 'bookit032023@gmail.com'

const myOAuth2Client = new OAuth2Client(
GOOGLE_MAILER_CLIENT_ID,
GOOGLE_MAILER_CLIENT_SECRET
)
myOAuth2Client.setCredentials({
refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

app.get('/export/:id', async (req, res) => {
    const bookingId = req.params.id;
    var data = await getBooking(bookingId);
    data = data[0];
    res.json(data);
  });


app.post('/email/send/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        var data = await getBooking(bookingId);
        data = data[0];
        email = data.client.email;
        emailCC = data.vendor.email;
        subject =  'Invoice #' + data.service.serviceId;
        content =  generateInvoiceHtml(bookingId, data);

        const myAccessTokenObject = await myOAuth2Client.getAccessToken()
        const myAccessToken = myAccessTokenObject?.token
        const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: ADMIN_EMAIL_ADDRESS,
            clientId: GOOGLE_MAILER_CLIENT_ID,
            clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
            refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
            accessToken: myAccessToken
        }
        })
        const mailOptions = {
            to: email,
            cc: emailCC,
            subject: subject,
            html: content,
            headers: {
                'Content-Type': 'text/html'
            }
        };
        await transport.sendMail(mailOptions)
        res.status(200).json({ message: 'Email sent successfully.' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ errors: error.message })
    }
})

function generateInvoiceHtml(bookingId, data) {
    var total = 0;
    var applicationFee = data.service.price/100*10;
    total = parseInt(data.service.price) + parseInt(applicationFee);
    const timeZone = 'America/New_York';
    const today = moment().tz(timeZone).format('MMMM DD, YYYY');
    return `
    <div id="invoice">
        <div class="aHl"></div>
        <div id=":4ob" tabindex="-1"></div>
        <div id=":4lr" class="ii gt" jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc2MTczODQ4OTMxMjM5MDg3NSIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW11d; 4:WyIjbXNnLWY6MTc2MTc5MzE5OTE0MzI4Mjg0NiIsbnVsbCxbXV0.">
        <div id=":4ls" class="a3s aiL msg-2308682559127387126">
            <u></u>
            <div style="background-color:#d6d6d5;margin:0;min-width:100%;padding:0;width:100%">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#d6d6d5;border:none;border-collapse:collapse;border-spacing:0;width:100%" bgcolor="#d6d6d5">
                <tbody>
                <tr>
                    <td align="center">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;max-width:700px;width:100%">
                        <tbody>
                        <tr>
                            <td style="background-color:#fff" align="center">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;margin:auto;max-width:700px;width:100%">
                                <tbody>
                                <tr>
                                    <td align="center">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fff;border:none;border-collapse:collapse;border-spacing:0;margin:auto;width:100%" bgcolor="#ffffff">
                                        <tbody>
                                        <tr>
                                            <td align="center">
                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="background-color:#fff">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                        <tbody>
                                                        <tr>
                                                            <td>
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td bgcolor="#ffffff">
                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                <tr>
                                                                                    <td bgcolor="#c6daff" style="direction:ltr;text-align:left">
                                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td align="center">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t11of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                        <tbody>
                                                                                                        <tr>
                                                                                                            <td align="center" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important">
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                    <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                <tbody>
                                                                                                                                <tr>
                                                                                                                                    <td class="m_-2308682559127387126logo" align="left" style="padding-top:45px;padding-bottom:40px;direction:ltr;text-align:left" valign="middle">
                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                        <tbody>
                                                                                                                                        
                                                                                                                                        </tbody>
                                                                                                                                    </table>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                    <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            </td>
                                                                                            <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    </td>
                                                                                </tr>
                                                                                </tbody>
                                                                            </table>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <span class="im">
                                                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                        <tbody>
                                                                            <tr>
                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                    <tr>
                                                                                    <td bgcolor="#c6daff" width="700" valign="top" style="background-repeat:no-repeat;background-position:100% 100%;direction:ltr;text-align:left">
                                                                                        <div>
                                                                                        <div style="font-size:0;line-height:0">
                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                                <td align="left" style="direction:ltr;text-align:left">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                        <td align="center">
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t11of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                            <tbody>
                                                                                                                <tr>
                                                                                                                <td align="center" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                        <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                        <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                            <tbody>
                                                                                                                                <tr>
                                                                                                                                <td style="direction:ltr;text-align:left">
                                                                                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                        <td align="left" style="font-size:0;direction:ltr;text-align:left">
                                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t7of12" style="border:none;border-collapse:collapse;border-spacing:0;display:inline-block;max-width:392px;vertical-align:bottom;width:100%">
                                                                                                                                            <tbody>
                                                                                                                                                <tr>
                                                                                                                                                <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                        <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126header_h3" style="color:#000;font-family:uber18-medium,Helvetica,Arial,sans-serif;font-size:34px;line-height:38px;padding-bottom:13px;direction:ltr;text-align:left">Thanks for your service, ${data.client.firstName} ${data.client.firstName}</td>
                                                                                                                                                        </tr>
                                                                                                                                                        <tr>
                                                                                                                                                        <td class="m_-2308682559127387126Uber18_text_p1" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t6of12" align="left" style="border:none;border-collapse:collapse;border-spacing:0;max-width:308px;width:100%">
                                                                                                                                                            <tbody>
                                                                                                                                                                <tr>
                                                                                                                                                                <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                                                    <tbody>
                                                                                                                                                                        <tr>
                                                                                                                                                                        </tr>
                                                                                                                                                                    </tbody>
                                                                                                                                                                    </table>
                                                                                                                                                                </td>
                                                                                                                                                                </tr>
                                                                                                                                                            </tbody>
                                                                                                                                                            </table>
                                                                                                                                                        </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                    </table>
                                                                                                                                                </td>
                                                                                                                                                </tr>
                                                                                                                                            </tbody>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                    </table>
                                                                                                                                </td>
                                                                                                                                </tr>
                                                                                                                            </tbody>
                                                                                                                            </table>
                                                                                                                        </td>
                                                                                                                        <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                                </tr>
                                                                                                            </tbody>
                                                                                                            </table>
                                                                                                        </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                                <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                                </table>
                                                                            </td>
                                                                            </tr>
                                                                        </tbody>
                                                                        </table>
                                                                    </span>
                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%;margin-bottom:20px">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                <tr>
                                                                                    <td align="center">
                                                                                    <table class="m_-2308682559127387126receipt_body" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%" bgcolor="#ffffff">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <td align="left" bgcolor="#ffffff" style="padding:45px 14px 0;direction:ltr;text-align:left">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td align="center">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                        <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding-left:0;padding-right:0">
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126total_head" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;padding-right:12px;direction:ltr;text-align:left">Total</td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126total_head" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;text-align:right;direction:ltr">CA$ ${total}</td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                <tbody>
                                                                                                                                <tr>
                                                                                                                                    <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#009eb7">&nbsp;</td>
                                                                                                                                </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <span class="im">
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p3" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">Service fee</td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p3" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-top:5px;text-align:right;direction:ltr">CA$ ${data.service.price}</td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p1" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">Application Fee (10&%)
                                                                                                                            </td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p1" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:0;padding-top:5px;text-align:right;direction:ltr">CA$ ${applicationFee}</td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                    </span>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#bdbdbd">&nbsp;</td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <span class="im">
                                                                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;direction:rtl;width:100%">
                                                                                                                <tbody>
                                                                                                                    <tr>
                                                                                                                    <td valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:0;line-height:28px;padding:5px 12px;text-align:left;direction:ltr">
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t7of12" style="border:none;border-collapse:collapse;border-spacing:0;direction:ltr;display:inline-block;max-width:392px;vertical-align:top;width:100%">
                                                                                                                                <tbody>
                                                                                                                                    <tr>
                                                                                                                                    <td style="padding:6px 0;direction:ltr;text-align:left">
                                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                        <tbody>
                                                                                                                                            <tr>
                                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                                <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:100%">
                                                                                                                                                <tbody>
                                                                                                                                                    <tr>
                                                                                                                                                    <td align="left" class="m_-2308682559127387126Uber18_text_p2" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:20px;text-align:left;direction:ltr">
                                                                                                                                                        <a href="${data.booking.invoiceURL}" style="text-decoration:none;color:#276ef1" target="_blank">Download PDF</a>
                                                                                                                                                    </td>
                                                                                                                                                    </tr>
                                                                                                                                                </tbody>
                                                                                                                                                </table>
                                                                                                                                            </td>
                                                                                                                                            </tr>
                                                                                                                                        </tbody>
                                                                                                                                        </table>
                                                                                                                                    </td>
                                                                                                                                    </tr>
                                                                                                                                </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                    </td>
                                                                                                                    </tr>
                                                                                                                </tbody>
                                                                                                                </table>
                                                                                                            </span>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    </td>
                                                                                </tr>
                                                                                </tbody>
                                                                            </table>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <div class="yj6qo"></div>
            <div class="adL"></div>
        </div>
        </div>
        <div id=":4n3" class="ii gt" style="display:none">
        <div id=":4n4" class="a3s aiL "></div>
        </div>
        <div class="hi"></div>
    </div>
  
    `;
    const invoiceDiv = document.getElementById('invoice');
    return invoiceDiv.innerHTML;
  }
module.exports = app
