import { LandingFeatureList } from "@/components/landing/landing-feature-list";
import { LandingHero } from "@/components/landing/landing-hero";
import { SetupForm } from "@/components/landing/setup-form";
import { AmbientBackdrop, SiteFooter, SiteHeader } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <AmbientBackdrop variant="home" />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-14 lg:flex-row lg:items-start lg:gap-16 lg:py-20">
        <div className="flex-1 lg:sticky lg:top-24">
          <LandingHero />
          <LandingFeatureList />
        </div>
        <div className="w-full max-w-md shrink-0 lg:max-w-lg">
          <SetupForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
