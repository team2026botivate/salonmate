import { Resend } from 'resend'

export const sendSms = async (message, to) => {
  const resend = new Resend('re_41qhc6RJ_6eSeujjosxozM8p2hgVhHHE4')

  resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'team1.interns@botivate.in',
    subject: '',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  })
}
