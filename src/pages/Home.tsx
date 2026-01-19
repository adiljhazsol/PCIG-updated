import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Building2, TrendingUp, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">TaxDeedInvest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link to="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Invest in Tax Deed Properties
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              with Confidence
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Access exclusive tax deed investment opportunities with comprehensive 
            research, transparent tracking, and professional management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Investing
              </Button>
            </Link>
            <Link to="/investor/properties">
              <Button variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800">
                View Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '$50M+', label: 'Assets Managed' },
              { value: '2,500+', label: 'Properties' },
              { value: '500+', label: 'Investors' },
              { value: '18%', label: 'Avg. Returns' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose TaxDeedInvest?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our platform provides everything you need to invest in tax deed properties successfully.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Building2,
                title: 'Curated Properties',
                description: 'Access pre-vetted tax deed properties with comprehensive due diligence.',
              },
              {
                icon: TrendingUp,
                title: 'High Returns',
                description: 'Target above-market returns through strategic property acquisition.',
              },
              {
                icon: Shield,
                title: 'Secure Platform',
                description: 'Bank-level security and regulatory compliance for peace of mind.',
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Professional management from industry-leading experts.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Investing?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join hundreds of investors who are building wealth through tax deed properties.
          </p>
          <Link to="/auth/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">TaxDeedInvest</span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} TaxDeedInvest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

