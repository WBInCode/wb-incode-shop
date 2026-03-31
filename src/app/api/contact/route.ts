import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail, sendContactConfirmation } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, _hp } = body;

    // Honeypot — if filled, silently succeed (bot trap)
    if (_hp) {
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Podaj poprawny adres email." },
        { status: 400 }
      );
    }

    if (message.trim().length > 5000) {
      return NextResponse.json(
        { error: "Wiadomość jest zbyt długa (max 5000 znaków)." },
        { status: 400 }
      );
    }

    const sanitized = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    // Send email to support team
    await sendContactEmail(sanitized);

    // Send confirmation to the sender
    await sendContactConfirmation(sanitized);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
