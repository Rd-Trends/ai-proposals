import { BenefitsSection } from "@/components/home/benefits";
import { CTASection } from "@/components/home/cta";
import { FAQSection } from "@/components/home/faq";
import { FeaturesSection } from "@/components/home/features";
import { Footer } from "@/components/home/footer";
import { HeroSection } from "@/components/home/hero";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { Navbar } from "@/components/site-layout/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  //     <div className="container mx-auto px-4 py-16">
  //       <div className="text-center max-w-4xl mx-auto">
  //         {/* Hero Section */}
  //         <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
  //           AI-Powered
  //           <span className="text-indigo-600"> Proposal </span>
  //           Templates
  //         </h1>

  //         <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
  //           Create winning proposals faster with intelligent templates. Track
  //           your success, optimize your approach, and land more clients.
  //         </p>

  //         <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
  //           <Link href="/auth/signup">
  //             <Button size="lg" className="w-full sm:w-auto">
  //               Get Started Free
  //             </Button>
  //           </Link>
  //           <Link href="/auth/signin">
  //             <Button variant="outline" size="lg" className="w-full sm:w-auto">
  //               Sign In
  //             </Button>
  //           </Link>
  //         </div>

  //         {/* Features */}
  //         <div className="grid md:grid-cols-3 gap-8 mt-16">
  //           <div className="bg-white p-6 rounded-lg shadow-md">
  //             <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
  //               <svg
  //                 className="w-6 h-6 text-indigo-600"
  //                 fill="none"
  //                 stroke="currentColor"
  //                 viewBox="0 0 24 24"
  //                 role="presentation"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  //                 />
  //               </svg>
  //             </div>
  //             <h3 className="text-xl font-semibold mb-2">Smart Templates</h3>
  //             <p className="text-gray-600">
  //               Create customizable proposal templates with placeholders that
  //               adapt to any project.
  //             </p>
  //           </div>

  //           <div className="bg-white p-6 rounded-lg shadow-md">
  //             <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
  //               <svg
  //                 className="w-6 h-6 text-indigo-600"
  //                 fill="none"
  //                 stroke="currentColor"
  //                 viewBox="0 0 24 24"
  //                 role="presentation"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
  //                 />
  //               </svg>
  //             </div>
  //             <h3 className="text-xl font-semibold mb-2">Success Tracking</h3>
  //             <p className="text-gray-600">
  //               Monitor proposal outcomes from sent to viewed to job awarded.
  //               Optimize what works.
  //             </p>
  //           </div>

  //           <div className="bg-white p-6 rounded-lg shadow-md">
  //             <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
  //               <svg
  //                 className="w-6 h-6 text-indigo-600"
  //                 fill="none"
  //                 stroke="currentColor"
  //                 viewBox="0 0 24 24"
  //                 role="presentation"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M13 10V3L4 14h7v7l9-11h-7z"
  //                 />
  //               </svg>
  //             </div>
  //             <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
  //             <p className="text-gray-600">
  //               Generate personalized proposals in seconds, not hours. Focus on
  //               what matters most.
  //             </p>
  //           </div>
  //         </div>

  //         {/* Call to Action */}
  //         <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
  //           <h2 className="text-3xl font-bold text-gray-900 mb-4">
  //             Ready to Win More Proposals?
  //           </h2>
  //           <p className="text-gray-600 mb-6">
  //             Join thousands of freelancers who&apos;ve increased their success
  //             rate with AI Proposals.
  //           </p>
  //           <Link href="/auth">
  //             <Button size="lg">Start Creating Templates</Button>
  //           </Link>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
