import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function submitFeedbackAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const authorId = cookieStore.get("userId")?.value;
  if (!authorId) redirect("/login");

  const text = formData.get("text") as string;
  const polish = formData.get("polish") === "on";
  const employeeId = (formData.get("employeeId") as string) || authorId;

  let polishedText: string | undefined = undefined;
  if (polish && text && process.env.HUGGINGFACE_API_TOKEN) {
    // Call HuggingFace Inference API for text polishing
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      const result = await response.json();
      polishedText = result[0]?.summary_text || text;
    } catch (error) {
      console.error("Failed to polish feedback with AI:", error);
      // Fallback to original text if API fails
      polishedText = text;
    }
  }

  await prisma.feedback.create({
    data: {
      text,
      polishedText,
      authorId,
      employeeId,
    },
  });

  redirect("/dashboard");
}
