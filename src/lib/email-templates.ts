function wrap(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#18181b">
<div style="background:#4f46e5;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0"><strong>ICT Mavi Imiliya Club</strong> · Learn. Build. Lead.</div>
<div style="border:1px solid #e4e4e7;border-top:0;padding:24px;border-radius:0 0 12px 12px">
<h2 style="margin:0 0 12px">${title}</h2>
${body}
<hr style="margin:24px 0;border:none;border-top:1px solid #e4e4e7"/>
<p style="font-size:12px;color:#71717a">This is an automated message from ICT Mavi Imiliya Club. Reply to ict@sorvx.com if you have questions.<br/>
<a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://ictmavi.example.com"}/dashboard" style="color:#4f46e5">View dashboard</a> · <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard" style="color:#4f46e5">Check status</a></p>
</div></body></html>`;
}

function kvTable(rows: [string,string][]) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k,v])=>`<tr><td style="padding:6px 8px;color:#71717a;width:35%">${k}</td><td style="padding:6px 8px;font-weight:600">${v||"—"}</td></tr>`).join("")}</table>`;
}

export function boardSubmittedEmail(a: { applicationNumber:string; fullName:string; email:string; phone:string; grade:string; section:string; studentId:string; firstChoice?:string; secondChoice?:string; motivation:string; timeCommitment:string }) {
  const subject = `Board Application Received — ${a.applicationNumber}`;
  const body = `<p>Hi ${a.fullName},</p><p>Your board application has been received and is under review.</p>
<p><strong>Application ID: ${a.applicationNumber}</strong></p>
<h3 style="margin:16px 0 8px">Your submission</h3>
${kvTable([["Name",a.fullName],["Email",a.email],["Phone",a.phone],["Grade",`${a.grade} — ${a.section}`],["Student ID",a.studentId],["First choice",a.firstChoice||"—"],["Second choice",a.secondChoice||"—"],["Time commitment",a.timeCommitment]])}
<div style="margin-top:12px;padding:12px;background:#f4f4f5;border-radius:8px"><p style="margin:0 0 4px;font-weight:600">Motivation</p><p style="margin:0;white-space:pre-wrap">${a.motivation}</p></div>
<p style="margin-top:16px">Check your status anytime at <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/board-recruitment/status" style="color:#4f46e5">Board Status</a> or <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard" style="color:#4f46e5">My Dashboard</a> using your Application ID and email.</p>`;
  return { subject, html: wrap("Application Received ✅", body) };
}

export function boardStatusEmail(a: { applicationNumber:string; fullName:string; status:string; adminNotes?:string|null }) {
  const msgs: Record<string,string> = {
    UNDER_REVIEW: "Your application is now under review.",
    SHORTLISTED: "Congratulations — you've been shortlisted!",
    INTERVIEW: "You've been invited for an interview. We'll contact you shortly with details.",
    SELECTED: "Congratulations — you've been selected for the board! 🎉",
    WAITLISTED: "You've been waitlisted. We'll reach out if a spot opens.",
    REJECTED: "Thank you for applying. This time you were not selected, but we encourage you to stay involved.",
  };
  const msg = msgs[a.status] || `Your application status is now: ${a.status}`;
  const subject = `Board Application ${a.status.replace(/_/g," ")} — ${a.applicationNumber}`;
  const body = `<p>Hi ${a.fullName},</p><p>${msg}</p><p><strong>${a.applicationNumber}</strong> · Status: <strong>${a.status.replace(/_/g," ")}</strong></p>${a.adminNotes?`<div style="margin-top:12px;padding:12px;background:#fef9c3;border-radius:8px"><strong>Note from admin:</strong><br/>${a.adminNotes}</div>`:""}<p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard" style="color:#4f46e5">View dashboard</a></p>`;
  return { subject, html: wrap(`Status: ${a.status.replace(/_/g," ")}`, body) };
}

export function hackathonRegisteredEmail(t: { teamNumber:string; teamName:string; projectTitle:string; category:string; description:string; members:{fullName:string;email:string;role:string;studentId:string}[] }) {
  const subject = `Hackathon Registration Confirmed — ${t.teamNumber}`;
  const membersHtml = t.members.map((m,i)=>`${i===0?"<strong>":""}${m.fullName} — ${m.role} (${m.studentId}) — ${m.email}${i===0?" (Leader)</strong>":""}`).join("<br/>");
  const body = `<p>Hi ${t.members[0]?.fullName || "Team Leader"},</p><p>Your hackathon team is registered and under review.</p>
<p><strong>Team ID: ${t.teamNumber}</strong> · Team: ${t.teamName}</p>
${kvTable([["Project",t.projectTitle],["Category",t.category]])}
<div style="margin-top:8px;padding:12px;background:#f4f4f5;border-radius:8px"><strong>Description</strong><br/>${t.description}</div>
<div style="margin-top:12px"><strong>Members (4)</strong><br/>${membersHtml}</div>
<p style="margin-top:16px">All 4 members received this confirmation. Check status at <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/hackathon/status" style="color:#4f46e5">Hackathon Status</a> or <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard" style="color:#4f46e5">My Dashboard</a>.</p>`;
  return { subject, html: wrap("Hackathon Registered ✅", body) };
}

export function hackathonStatusEmail(t: { teamNumber:string; teamName:string; status:string; adminNotes?:string|null }) {
  const msgs: Record<string,string> = {
    UNDER_REVIEW: "Your team is now under review.",
    APPROVED: "Congratulations — your team is approved! 🎉",
    WAITLISTED: "Your team is waitlisted.",
    REJECTED: "Thank you for registering. This time your team was not selected.",
    CHECKED_IN: "You're checked in — see you at the hackathon!",
  };
  const msg = msgs[t.status] || `Status: ${t.status}`;
  const subject = `Hackathon ${t.status.replace(/_/g," ")} — ${t.teamNumber}`;
  const body = `<p>Hi ${t.teamName},</p><p>${msg}</p><p><strong>${t.teamNumber}</strong> · Status: <strong>${t.status.replace(/_/g," ")}</strong></p>${t.adminNotes?`<div style="margin-top:12px;padding:12px;background:#fef9c3;border-radius:8px"><strong>Note:</strong><br/>${t.adminNotes}</div>`:""}`;
  return { subject, html: wrap(`Hackathon: ${t.status.replace(/_/g," ")}`, body) };
}

export function broadcastEmail(subject: string, htmlBody: string) {
  return { subject, html: wrap(subject, `<div>${htmlBody}</div>`) };
}
