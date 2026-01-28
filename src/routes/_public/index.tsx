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
import { useEffect, useState } from "react";
import CateImage from "@/assets/cate.png";
import HomeImage from "@/assets/home.png";
import ListImage from "@/assets/list.png";
import logo from "@/assets/logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const Route = createFileRoute("/_public/")({
  component: LandingPage,
});

function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    { src: HomeImage, alt: "Dashboard Home" },
    { src: CateImage, alt: "Category Management" },
    { src: ListImage, alt: "Content List" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

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
              🚀 v2.0 现已发布
            </Badge>
            <h1 className="mb-6 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight md:text-6xl">
              专为快速增长团队打造的 <br className="hidden md:block" />
              现代化 Headless CMS
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-muted-foreground text-xl">
              为开发者与内容创作者提供灵活、API
              优先的内容管理体验。专为高性能、可扩展性及易用性而生。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/sign-up">
                <Button className="h-12 px-8 text-base" size="lg">
                  免费开始使用 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button className="h-12 px-8 text-base" size="lg" variant="outline">
                  查看演示
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="group relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border bg-background shadow-2xl">
              <div className="absolute top-0 z-20 flex h-10 w-full items-center gap-2 border-b bg-muted/50 px-4">
                <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
                <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
                <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
                <div className="ml-4 flex gap-1.5">
                  {images.map((img, idx) => (
                    <button
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        currentImageIndex === idx
                          ? "w-4 bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      key={img.src}
                      onClick={() => setCurrentImageIndex(idx)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <div className="relative bg-muted/10 p-1 pt-10">
                <div className="aspect-video overflow-hidden rounded-lg">
                  {images.map((img, idx) => (
                    <div
                      className={`absolute inset-0 top-10 transition-opacity duration-1000 ease-in-out ${
                        currentImageIndex === idx ? "z-10 opacity-100" : "z-0 opacity-0"
                      }`}
                      key={img.src}
                    >
                      <img
                        alt={img.alt}
                        className="h-full w-full object-cover object-top"
                        src={img.src}
                      />
                    </div>
                  ))}
                  {/* Fallback pattern when images are loading or missing */}
                  <div className="flex aspect-video items-center justify-center bg-linear-to-br from-background to-muted text-muted-foreground">
                    <div className="text-center opacity-20">
                      <LayoutDashboard className="mx-auto mb-4 h-16 w-16" />
                      <p className="font-medium text-sm">加载中...</p>
                    </div>
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
              <h2 className="mb-4 font-bold text-3xl tracking-tight">助力快速构建所需的一切</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                一套完整的工具集，助您跨全渠道轻松管理内容。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                description="通过边缘缓存与全球 CDN 分发，实现极致加载速度。"
                icon={<Zap className="h-6 w-6 text-yellow-500" />}
                title="极速响应"
              />
              <FeatureCard
                description="提供类型完备的 SDK、详尽的 API 文档以及全方位的 Webhook 支持。"
                icon={<Code2 className="h-6 w-6 text-blue-500" />}
                title="开发者至上"
              />
              <FeatureCard
                description="内置基于角色的访问控制 (RBAC)、单点登录 (SSO) 及审计日志。"
                icon={<Lock className="h-6 w-6 text-green-500" />}
                title="企业级安全"
              />
              <FeatureCard
                description="原生支持本地化与国际化，轻松实现多语言适配。"
                icon={<Globe className="h-6 w-6 text-purple-500" />}
                title="多语言支持"
              />
              <FeatureCard
                description="拖拽式页面构建器，支持实时预览，所见即所得。"
                icon={<LayoutDashboard className="h-6 w-6 text-orange-500" />}
                title="可视化编辑器"
              />
              <FeatureCard
                description="内置内容性能指标与用户参与度追踪功能。"
                icon={<BarChart3 className="h-6 w-6 text-pink-500" />}
                title="数据分析"
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trusted By */}
        <section className="border-y py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <p className="mb-8 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
              深受创新团队信赖
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
              <h2 className="mb-4 font-bold text-3xl tracking-tight">简单透明的价格体系</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                免费起步，随需扩展。无需信用卡。
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <PricingCard
                description="非常适合个人项目与原型展示。"
                features={["1 个项目", "1,000 条记录", "2 个用户", "社区支持"]}
                price="免费"
                title="入门版"
              />
              <PricingCard
                description="助力成长型团队与企业业务。"
                features={["5 个项目", "100,000 条记录", "10 个用户", "优先支持", "自定义角色"]}
                highlighted
                price="$29"
                title="专业版"
              />
              <PricingCard
                description="专为大规模应用与组织机构打造。"
                features={[
                  "无限项目",
                  "无限记录",
                  "SSO & SAML",
                  "专属客户经理",
                  "服务等级协议 (SLA)",
                ]}
                price="定制价格"
                title="企业版"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">准备好升级您的内容工作流了吗？</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
              加入成千上万的开发者与市场人员，共同构建 Web 的未来。
            </p>
            <Link to="/sign-up">
              <Button className="h-12 px-8 font-semibold text-base" size="lg" variant="secondary">
                免费开始使用
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
                <img alt="TanStack CMS Logo" className="h-8 w-8" src={logo} />
                <span>TanStack CMS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                打造卓越数字体验的现代化 Headless CMS。
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">产品</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    功能特性
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    集成方案
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    价格体系
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    更新日志
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">资源</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    文档中心
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    API 参考
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    社区交流
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    博客
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">公司</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link className="hover:text-foreground" to="/">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    人才招聘
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    法律条款
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" to="/">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-muted-foreground text-sm md:flex-row">
            <p>© 2024 TanStack CMS. 保留所有权利。</p>
            <div className="flex gap-6">
              <Link className="hover:text-foreground" to="/">
                隐私政策
              </Link>
              <Link className="hover:text-foreground" to="/">
                服务条款
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
          {price !== "定制价格" && price !== "免费" && (
            <span className="text-muted-foreground">/月</span>
          )}
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
          {price === "定制价格" ? "联系销售" : "立即开始"}
        </Button>
      </div>
    </Card>
  );
}
