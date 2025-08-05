import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen lang sein"),
  privacy: z.boolean().refine(val => val === true, "Datenschutzerklärung muss akzeptiert werden")
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body
      const validatedData = contactSchema.parse(req.body);
      
      // Check honeypot field for spam protection
      if (req.body.honeypot && req.body.honeypot !== '') {
        return res.status(400).json({ message: "Spam detected" });
      }

      // Here you would normally send an email using nodemailer
      // For now, we'll just log the contact form submission
      console.log("Contact form submission:", validatedData);

      res.json({ message: "Nachricht erfolgreich gesendet" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validierungsfehler", 
          errors: error.errors 
        });
      }
      
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
