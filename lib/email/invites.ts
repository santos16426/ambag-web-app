// Email invitation utilities
// TODO: Integrate with actual email service (Resend, SendGrid, etc.)

export type InviteEmailData = {
  toEmail: string;
  groupName: string;
  inviterName: string;
  inviteLink: string;
};

/**
 * Send email invitation to a non-existing user
 * This is a placeholder - integrate with your email service
 */
export async function sendGroupInviteEmail(data: InviteEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 Sending invite email:', {
      to: data.toEmail,
      group: data.groupName,
      inviter: data.inviterName,
      link: data.inviteLink,
    });

    // TODO: Replace with actual email service integration
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: data.toEmail,
    //   subject: `You've been invited to join ${data.groupName}`,
    //   html: `
    //     <h1>Join ${data.groupName}</h1>
    //     <p>${data.inviterName} has invited you to join their group.</p>
    //     <a href="${data.inviteLink}">Accept Invitation</a>
    //   `
    // });

    // For now, just log it
    return { success: true };
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Send multiple invite emails
 */
export async function sendBulkGroupInviteEmails(invites: InviteEmailData[]): Promise<{
  successful: string[];
  failed: string[];
}> {
  const results = await Promise.allSettled(
    invites.map(invite => sendGroupInviteEmail(invite))
  );

  const successful: string[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    const email = invites[index].toEmail;
    if (result.status === 'fulfilled' && result.value.success) {
      successful.push(email);
    } else {
      failed.push(email);
    }
  });

  return { successful, failed };
}
