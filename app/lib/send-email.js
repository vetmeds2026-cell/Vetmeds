import nodemailer from 'nodemailer';


export const getDoctorServiceEmail = (doctorEmail) => {
  const email = doctorEmail?.toLowerCase();
  if (email === 'shrileela@vetmeds.com') {
    return process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1;
  } else if (email === 'omkar@vetmeds.com') {
    return process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC2;
  } else if (email === 'sanchit@vetmeds.com') {
    return process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC3;
  }
  return process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1; 
};


const getTransporter = (doctorEmail) => {
  const email = doctorEmail?.toLowerCase();
  let user, pass;

  
  if (email === 'shrileela@vetmeds.com') {
    user = process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1;
    pass = process.env.NEXT_PUBLIC_SERVICE_PASS_DOC1;
  } else if (email === 'omkar@vetmeds.com') {
    user = process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC2;
    pass = process.env.NEXT_PUBLIC_SERVICE_PASS_DOC2;
  } else if (email === 'sanchit@vetmeds.com') {
    user = process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC3;
    pass = process.env.NEXT_PUBLIC_SERVICE_PASS_DOC3;
  } else {
    
    user = process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1;
    pass = process.env.NEXT_PUBLIC_SERVICE_PASS_DOC1;
  }

  if (!user || !pass) {
    console.error('❌ Email credentials missing for doctor:', doctorEmail);
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};


export const sendEmail = async ({ to, subject, html, doctorEmail, attachments }) => {
  try {
    const transporter = getTransporter(doctorEmail);
    if (!transporter) throw new Error('Could not initialize email transporter');

    const mailOptions = {
      from: transporter.options.auth.user,
      to,
      subject,
      html,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email with Nodemailer:', error);
    return { success: false, error: error.message };
  }
};


export const getDoctorNotificationTemplate = (appointment) => {
  const petDetails = appointment.petProfileDetails ? JSON.parse(appointment.petProfileDetails) : {};
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <div style="background: #1b3a34; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Appointment Booked</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hello ${appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`},</p>
        <p>A new appointment has been scheduled with you. Here are the details:</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #1b3a34; margin-top: 0;">Schedule</h3>
          <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime} (${appointment.timeSlot})</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #1b3a34; margin-top: 0;">Pet Details</h3>
          <p><strong>Name:</strong> ${appointment.petName}</p>
          <p><strong>Species:</strong> ${petDetails.species || 'N/A'}</p>
          <p><strong>Breed:</strong> ${petDetails.breed || 'N/A'}</p>
          <p><strong>Age:</strong> ${petDetails.age || 'N/A'} years</p>
          <p><strong>Problem:</strong> ${appointment.petProblem}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3 style="color: #1b3a34; margin-top: 0;">Owner Info</h3>
          <p><strong>Name:</strong> ${appointment.ownerName}</p>
          <p><strong>Email:</strong> ${appointment.ownerEmail}</p>
        </div>

        <p style="margin-top: 30px;">Please login to your dashboard to manage this appointment.</p>
      </div>
      <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        Sent via VetMeds - Pet Health Partners
      </div>
    </div>
  `;
};


export const getUserNotificationTemplate = (appointment) => {
  const statusColor = appointment.status === 'confirmed' ? '#27ae60' : appointment.status === 'cancelled' ? '#c0392b' : '#2980b9';
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <div style="background: ${statusColor}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Appointment ${appointment.status.toUpperCase()}</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hello ${appointment.ownerName},</p>
        <p>Your appointment with <strong>${appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`}</strong> for <strong>${appointment.petName}</strong> has been <strong>${appointment.status}</strong>.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: ${statusColor}; margin-top: 0;">Appointment Details</h3>
          <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Doctor:</strong> ${appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`}</p>
        </div>

        ${appointment.status === 'completed' && appointment.medicines && appointment.medicines !== '[]' ? `
          <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
            <h3 style="color: #166534; margin-top: 0;">Prescribed Medications</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                  <th style="padding: 8px 0;">Medicine</th>
                  <th style="padding: 8px 0;">Dosage</th>
                  <th style="padding: 8px 0;">Duration</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  try {
                    const meds = JSON.parse(appointment.medicines);
                    return meds.map(med => `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0;">${med.name || '-'}</td>
                        <td style="padding: 8px 0;">${med.dosage || '-'}</td>
                        <td style="padding: 8px 0;">${med.duration || '-'}</td>
                      </tr>
                    `).join('');
                  } catch (e) {
                    return '<tr><td colspan="3" style="padding: 8px 0; text-align: center;">Details available in dashboard</td></tr>';
                  }
                })()}
              </tbody>
            </table>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">* Please follow the dosage instructions carefully.</p>
          </div>
        ` : ''}

        <p style="margin-top: 30px;">You can view more details in your dashboard.</p>
      </div>
      <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        Sent via VetMeds - Your Trusted Pet Health Partner
      </div>
    </div>
  `;
};

export const getEmergencyNotificationTemplate = (sos) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 2px solid #e74c3c; border-radius: 10px; overflow: hidden;">
      <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT 🚨</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p style="font-size: 18px; font-weight: bold; color: #e74c3c;">Immediate Attention Required!</p>
        <p>An emergency has been reported by a user. Here are the details:</p>
        
        <div style="background: #fff5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #feb2b2;">
          <h3 style="color: #c53030; margin-top: 0;">Emergency Details</h3>
          <p><strong>User Name:</strong> ${sos.userName}</p>
          <p><strong>User Email:</strong> ${sos.userEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Map Location:</strong> ${sos.address || 'Selected on map'}</p>
          ${sos.latitude && sos.longitude ? `
            <p><strong>Coordinates:</strong> ${sos.latitude}, ${sos.longitude}</p>
            <p style="margin-top: 10px; margin-bottom: 10px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${sos.latitude},${sos.longitude}" 
                 style="background: #c53030; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 13px;">
                📍 VIEW EXACT LOCATION ON MAP
              </a>
            </p>
          ` : ''}
          <p><strong>Incident Description:</strong></p>
          <div style="background: white; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
            ${sos.description.replace(/\n/g, '<br>')}
          </div>
        </div>

        ${sos.imageUrl ? `
          <div style="margin-bottom: 20px; text-align: center;">
            <p style="font-weight: bold;">Attached Emergency Image:</p>
            <img src="${sos.imageUrl}" alt="Emergency" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
          </div>
        ` : ''}

        <p style="background: #edf2f7; padding: 10px; border-radius: 4px; font-size: 14px;">
          <strong>Next Step:</strong> Please contact the user immediately or prepare for their arrival if they are heading to the clinic.
        </p>
      </div>
      <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        Sent via VetMeds Emergency System
      </div>
    </div>
  `;
};


export const getContactNotificationTemplate = (contact) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #1b3a34; border-radius: 10px; overflow: hidden;">
      <div style="background: #1b3a34; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>You have received a new message through the VetMeds Contact Us form.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ddd;">
          <h3 style="color: #1b3a34; margin-top: 0;">Sender Details</h3>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          <h3 style="color: #1b3a34; margin-top: 0;">Message Content</h3>
          <div style="background: white; padding: 10px; border: 1px solid #eee; border-radius: 4px; white-space: pre-wrap;">
            ${contact.message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          <strong>Action:</strong> Please respond to this inquiry as soon as possible.
        </p>
      </div>
      <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        Sent via VetMeds Customer Support System
      </div>
    </div>
  `;
};
