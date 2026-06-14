import { NextResponse } from 'next/server';
import { sendEmail, getContactNotificationTemplate } from '@/app/lib/send-email';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    
    const emailHtml = getContactNotificationTemplate({ name, email, message });

    
    const result = await sendEmail({
      to: process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1,
      subject: `📩 New Contact Message from ${name}`,
      html: emailHtml,
      doctorEmail: 'shrileela@vetmeds.com', 
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Your message has been sent successfully!' 
      });
    } else {
      throw new Error(result.error || 'Failed to send email');
    }

  } catch (error) {
    console.error('❌ Error handling contact form:', error);
    return NextResponse.json(
      { success: false, error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}
