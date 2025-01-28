export async function onRequestPost(context) {
  try {
    let input = await context.request.formData();
    let output = {};
    for (let [key, value] of input) {
      let tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }

    // Send email using Cloudflare Email Workers
    const send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "your@email.com", name: "Your Name" }],
          },
        ],
        from: {
          email: "no-reply@yourdomain.com",
          name: "Contact Form",
        },
        subject: "New Contact Form Submission",
        content: [
          {
            type: "text/plain",
            value: JSON.stringify(output, null, 2),
          },
        ],
      }),
    });

    await fetch(send_request);

    return Response.redirect("/contact/thanks", 302);
  } catch (err) {
    return new Response("Error processing form", { status: 400 });
  }
}
