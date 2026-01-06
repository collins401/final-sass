import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Globe,
  LayoutDashboard,
  Lock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

          <div className="container mx-auto px-4 text-center md:px-6">
            <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm" variant="secondary">
              🚀 v2.0 is now available
            </Badge>
            <h1 className="mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight md:text-6xl">
              The Modern Headless CMS <br className="hidden md:block" />
              for Growth Teams
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-muted-foreground text-xl">
              Empower your developers and content creators with a flexible, API-first CMS. Built for
              performance, scalability, and ease of use.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/sign-up">
                <Button className="h-12 px-8 text-base" size="lg">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button className="h-12 px-8 text-base" size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border bg-background shadow-2xl">
              <div className="absolute top-0 flex h-10 w-full items-center gap-2 border-b bg-muted/50 px-4">
                <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
                <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
                <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
              </div>
              <div className="bg-muted/10 p-1 pt-10">
                {/* Placeholder for dashboard image */}
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-background to-muted text-muted-foreground">
                  <div className="text-center">
                    <LayoutDashboard className="mx-auto mb-4 h-16 w-16 opacity-20" />
                    <p className="font-medium text-sm opacity-50">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-3xl tracking-tight">
                Everything you need to build faster
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                A complete toolkit for managing content across all your digital channels.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                description="Optimized for speed with edge caching and global CDN distribution."
                icon={<Zap className="h-6 w-6 text-yellow-500" />}
                title="Lightning Fast"
              />
              <FeatureCard
                description="Typed SDKs, comprehensive API documentation, and webhooks for everything."
                icon={<Code2 className="h-6 w-6 text-blue-500" />}
                title="Developer First"
              />
              <FeatureCard
                description="Role-based access control, SSO, and audit logs built-in."
                icon={<Lock className="h-6 w-6 text-green-500" />}
                title="Enterprise Security"
              />
              <FeatureCard
                description="Native support for localization and internationalization."
                icon={<Globe className="h-6 w-6 text-purple-500" />}
                title="Multi-language"
              />
              <FeatureCard
                description="Drag-and-drop page builder with real-time preview."
                icon={<LayoutDashboard className="h-6 w-6 text-orange-500" />}
                title="Visual Editor"
              />
              <FeatureCard
                description="Built-in content performance metrics and user engagement tracking."
                icon={<BarChart3 className="h-6 w-6 text-pink-500" />}
                title="Analytics"
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trusted By */}
        <section className="border-y py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <p className="mb-8 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
              Trusted by innovative teams
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
              {/* Placeholders for logos */}
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="h-6 w-6 rounded-full bg-foreground" /> Acme Corp
              </div>
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="h-6 w-6 rounded-full bg-foreground" /> Globex
              </div>
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="h-6 w-6 rounded-full bg-foreground" /> Soylent
              </div>
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="h-6 w-6 rounded-full bg-foreground" /> Initech
              </div>
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="h-6 w-6 rounded-full bg-foreground" /> Umbrella
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-3xl tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Start for free, scale as you grow. No credit card required.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <PricingCard
                description="Perfect for personal projects and prototypes."
                features={["1 Project", "1,000 Records", "2 Users", "Community Support"]}
                price="$0"
                title="Starter"
              />
              <PricingCard
                description="For growing teams and businesses."
                features={[
                  "5 Projects",
                  "100,000 Records",
                  "10 Users",
                  "Priority Support",
                  "Custom Roles",
                ]}
                highlighted
                price="$29"
                title="Pro"
              />
              <PricingCard
                description="For large-scale applications and organizations."
                features={[
                  "Unlimited Projects",
                  "Unlimited Records",
                  "SSO & SAML",
                  "Dedicated Success Manager",
                  "SLA",
                ]}
                price="Custom"
                title="Enterprise"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Ready to transform your content workflow?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
              Join thousands of developers and marketers building the future of the web.
            </p>
            <Link to="/sign-up">
              <Button className="h-12 px-8 font-semibold text-base" size="lg" variant="secondary">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-1">
              <div className="mb-4 flex items-center gap-2 font-bold text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <span>TanStack CMS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The modern headless CMS for building better digital experiences.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Features
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Resources</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Community
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Legal
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-muted-foreground text-sm md:flex-row">
            <p>© 2024 TanStack CMS. All rights reserved.</p>
            <div className="flex gap-6">
              <Link className="hover:text-foreground" to="/">
                Privacy Policy
              </Link>
              <Link className="hover:text-foreground" to="/">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  title,
  price,
  description,
  features,
  highlighted = false,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`flex flex-col ${highlighted ? "relative z-10 scale-105 border-primary shadow-lg" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4 mb-2">
          <span className="font-bold text-4xl">{price}</span>
          {price !== "Custom" && <span className="text-muted-foreground">/month</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="mb-6 space-y-3">
          {features.map((feature, i) => (
            <li className="flex items-center gap-2 text-sm" key={i}>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="mt-auto p-6 pt-0">
        <Button className="w-full" variant={highlighted ? "default" : "outline"}>
          {price === "Custom" ? "Contact Sales" : "Get Started"}
        </Button>
      </div>
    </Card>
  );
}
