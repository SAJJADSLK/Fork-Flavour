import { useState } from "react";
import { Mail, MapPin, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useDocumentMeta({
    title: "Contact Us | Fork & Flavor",
    description: "Get in touch with the Fork & Flavor editorial and culinary team for inquiries, feedback, or recipe corrections.",
    canonicalPath: "/contact",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3">Get in Touch</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Contact Our Editorial Team
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Have questions about a recipe, dietary substitutions, copyright, or partnerships? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-12">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Direct Inquiries</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We review every reader submission, recipe feedback, and technical question. Our team typically responds within 24 to 48 business hours.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <a href="mailto:contact@forkflavour.com" className="text-sm text-primary hover:underline">
                    contact@forkflavour.com
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">Editorial & general inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recipe Feedback</h3>
                  <a href="mailto:editor@forkflavour.com" className="text-sm text-primary hover:underline">
                    editor@forkflavour.com
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">Submit corrections or tips</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Headquarters</h3>
                  <p className="text-sm text-muted-foreground">
                    Fork & Flavor Editorial Studio<br />
                    Digital Publishing & Culinary Research
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground mb-1">AdSense & Advertiser Inquiries</p>
              For advertising queries, sponsored collaborations, or reporting issues with displayed ads, please include "[Advertising]" in your email subject line.
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Message Sent</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Thank you for reaching out, {name}! A member of our team will review your message and reply to {email} shortly.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-4">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Send a Message</h2>
                <div>
                  <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind or share your recipe feedback..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full font-medium">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

