import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Beam</h1>
          <p className="mt-2 text-lg text-gray-600">Your modern web platform, simplified.</p>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow">
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to Beam 🚀</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Beam helps you build and scale web experiences faster than ever. Start creating with ease and flexibility.
            </p>
            <div className="mt-8">
              <a href="#features" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow transition">
                Get Started
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h4>
                <p className="text-gray-600">Optimized for speed with the latest tools and frameworks.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Fully Responsive</h4>
                <p className="text-gray-600">Looks great on every device, from phones to desktops.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Developer Friendly</h4>
                <p className="text-gray-600">Built with modern devs in mind. Simple, powerful, flexible.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Beam Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
