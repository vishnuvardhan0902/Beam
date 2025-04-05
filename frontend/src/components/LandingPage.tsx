import React from 'react';
import Navbar from './Navbar';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-blue-700 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to Beam</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl">
            The modern platform for seamless communication and collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-full text-lg transition-colors duration-300">
              Get Started
            </button>
            <button className="bg-transparent hover:bg-blue-600 border-2 border-white font-semibold py-3 px-8 rounded-full text-lg transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Beam?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Seamless Communication" 
            description="Connect with your team in real-time with crystal-clear audio and video."
            icon="💬"
          />
          <FeatureCard 
            title="Smart Collaboration" 
            description="Work together on documents, projects, and ideas with intuitive tools."
            icon="🤝"
          />
          <FeatureCard 
            title="Enhanced Security" 
            description="Your data is protected with enterprise-grade encryption and privacy controls."
            icon="🔒"
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-blue-800 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Beam has revolutionized how our team communicates. It's intuitive and powerful!"
              author="Sarah Johnson"
              position="Product Manager at TechCorp"
            />
            <TestimonialCard 
              quote="The collaboration features are game-changing. We've boosted our productivity by 35%."
              author="Michael Chen"
              position="CTO at StartupX"
            />
            <TestimonialCard 
              quote="Security was our primary concern, and Beam exceeded all our expectations."
              author="Elena Rodriguez"
              position="Security Engineer at DataSafe"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            title="Basic" 
            price="Free"
            features={[
              "Up to 5 team members",
              "Basic video calls",
              "Chat messaging",
              "File sharing up to 1GB",
              "24/7 support"
            ]}
            cta="Get Started"
            popular={false}
          />
          <PricingCard 
            title="Pro" 
            price="$12"
            period="per user / month"
            features={[
              "Up to 50 team members",
              "HD video calls",
              "Screen sharing",
              "File sharing up to 10GB",
              "Advanced collaboration tools",
              "24/7 priority support"
            ]}
            cta="Start Free Trial"
            popular={true}
          />
          <PricingCard 
            title="Enterprise" 
            price="Custom"
            features={[
              "Unlimited team members",
              "4K video calls",
              "Advanced security features",
              "Unlimited file sharing",
              "Custom integrations",
              "Dedicated account manager"
            ]}
            cta="Contact Sales"
            popular={false}
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-blue-800 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Get in Touch</h2>
          <p className="text-xl text-center mb-12 max-w-2xl mx-auto">
            Have questions about Beam? Our team is here to help.
          </p>
          <div className="max-w-xl mx-auto bg-white rounded-xl p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of teams already using Beam to transform their communication.
        </p>
        <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-10 rounded-full text-lg transition-colors duration-300">
          Start Free Trial
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Beam</h2>
              <p className="text-blue-300">© 2023 Beam Inc. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-blue-300 hover:text-white transition-colors duration-300">Terms</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors duration-300">Privacy</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors duration-300">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard: React.FC<{title: string; description: string; icon: string}> = ({title, description, icon}) => {
  return (
    <div className="bg-blue-800 bg-opacity-50 p-8 rounded-xl">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-blue-100">{description}</p>
    </div>
  );
};

const TestimonialCard: React.FC<{quote: string; author: string; position: string}> = ({quote, author, position}) => {
  return (
    <div className="bg-blue-700 p-6 rounded-xl">
      <p className="text-lg italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-blue-300">{position}</p>
      </div>
    </div>
  );
};

const PricingCard: React.FC<{
  title: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  popular: boolean;
}> = ({title, price, period, features, cta, popular}) => {
  return (
    <div className={`relative rounded-xl overflow-hidden ${popular ? 'shadow-xl transform scale-105 z-10' : ''}`}>
      {popular && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-indigo-900 text-center py-1 font-semibold">
          Most Popular
        </div>
      )}
      <div className={`p-8 ${popular ? 'bg-white text-indigo-900' : 'bg-blue-800 bg-opacity-50 text-white'}`}>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-sm opacity-80 ml-2">{period}</span>}
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className={`w-5 h-5 mr-2 mt-0.5 ${popular ? 'text-green-500' : 'text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
          popular 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
            : 'bg-white text-indigo-900 hover:bg-blue-50'
        }`}>
          {cta}
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 