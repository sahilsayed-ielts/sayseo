import { FaqList } from "@/components/shared/faq-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqItems } from "@/content/site";

export function FaqPreview() {
  return (
    <section className="section-space">
      <Container className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="Answers to the questions that typically come up before a first conversation."
            description="The goal is to make the buying decision feel clearer, lower-friction, and grounded in how real teams evaluate SEO support."
          />
          <div className="mt-8">
            <ButtonLink href="/contact" variant="secondary">
              Ask a specific question
            </ButtonLink>
          </div>
        </div>
        <div className="lg:pt-4">
          <FaqList items={faqItems.slice(0, 4)} />
        </div>
      </Container>
    </section>
  );
}
