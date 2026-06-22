import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { GraduationCap, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 px-6 lg:py-32 overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                The Future of <span className="text-primary">Admissions</span> is Here
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Automated document verification, AI-powered fraud detection, and smart course recommendations. 
                Experience a seamless admission journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-8 text-lg gap-2">
                    Apply Now <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                    Admin Portal
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Smart Features for Smart Students</h2>
              <p className="text-muted-foreground">Everything you need to secure your academic future.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-10 w-10 text-yellow-500" />,
                  title: "AI OCR Verification",
                  description: "Instantly extract data from your certificates and marksheets with high accuracy."
                },
                {
                  icon: <ShieldCheck className="h-10 w-10 text-green-500" />,
                  title: "Fraud Detection",
                  description: "Our AI model identifies inconsistencies and suspicious patterns to ensure integrity."
                },
                {
                  icon: <CheckCircle2 className="h-10 w-10 text-blue-500" />,
                  title: "Instant Decisions",
                  description: "Get real-time feedback and admission decisions powered by our smart engine."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-background p-8 rounded-2xl border shadow-sm"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-background">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">MeritMatrix AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MeritMatrix AI Admission System. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
