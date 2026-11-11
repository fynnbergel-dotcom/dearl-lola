import { Experience } from "@/components/experience/experience";
import { Faq, HowItWorks, Samples } from "@/components/marketing/sections";

export default function Home() {
  return (
    <>
      <Experience />
      <div className="via-border-strong mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent to-transparent" />
      <HowItWorks />
      <Samples />
      <Faq />
    </>
  );
}
