import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  CalendarIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

// Add custom styles for circular motion
const customStyles = `
  @keyframes orbit {
    from {
      transform: rotate(0deg) translateX(60px) rotate(0deg);
    }
    to {
      transform: rotate(360deg) translateX(60px) rotate(-360deg);
    }
  }
  
  @keyframes orbitReverse {
    from {
      transform: rotate(0deg) translateX(80px) rotate(0deg);
    }
    to {
      transform: rotate(-360deg) translateX(80px) rotate(360deg);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .orbit-animation {
    animation: orbit 15s linear infinite;
  }
  
  .orbit-reverse {
    animation: orbitReverse 20s linear infinite;
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.innerHTML = customStyles;
  document.head.appendChild(styleElement);
}

// Hero Section Component
const HeroSection = ({ user }) => {
  return (
    <div className="relative overflow-hidden px-6 md:px-20 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-blue-600">
              Empower Your Health
              <br />
              <span className="text-blue-500">
                With Smart Care
              </span>
            </h1>
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 inline-block">
                <p className="text-blue-700 text-lg font-medium">Welcome back, {user.name}! 👋</p>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl">
              "Health is not just about the absence of illness. It's about finding balance, vitality, and joy in everyday life. Let's build that future together."
            </p>
            <p className="text-gray-600 text-base font-medium">
              AI-powered answers. Early intervention. All in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/appointments"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Book Appointment
              </Link>
              <Link
                to="/emergency"
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Emergency
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">50,000+</div>
                <div className="text-blue-500 text-sm font-medium">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">350+</div>
                <div className="text-blue-500 text-sm font-medium">Expert Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">98%</div>
                <div className="text-blue-500 text-sm font-medium">Success Rate</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 pt-6">
              <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-300">f</div>
              <div className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-300">t</div>
              <div className="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-300">in</div>
              <div className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-300">yt</div>
            </div>
          </div>

          {/* Right Content - Doctor Image */}
          <div className="relative lg:mt-0 mt-12 flex justify-center">
            {/* Main circular container with rotating border */}
            <div className="relative w-96 h-96">
              {/* Rotating gradient border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 animate-spin" style={{animationDuration: '8s'}}></div>
              
              {/* Inner white border */}
              <div className="absolute inset-2 rounded-full bg-white"></div>
              
              {/* Doctor image container */}
              <div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-blue-400 to-blue-600">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>

              {/* Floating animated icons around the circle */}
              {/* Orbiting icons layer 1 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="orbit-animation">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <HeartIcon className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '3s'}}>
                <div className="orbit-animation">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <UserCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '6s'}}>
                <div className="orbit-animation">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <CalendarIcon className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '9s'}}>
                <div className="orbit-animation">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <DocumentTextIcon className="h-5 w-5 text-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Orbiting icons layer 2 (reverse direction) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '2s'}}>
                <div className="orbit-reverse">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <PlusIcon className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '7s'}}>
                <div className="orbit-reverse">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '12s'}}>
                <div className="orbit-reverse">
                  <div className="bg-white p-3 rounded-full shadow-xl float-animation">
                    <ClockIcon className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Static positioned icons with bounce animation */}
              <div className="absolute top-4 right-12 bg-white p-4 rounded-full shadow-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
                <HeartIcon className="h-6 w-6 text-red-500" />
              </div>

              <div className="absolute bottom-4 left-8 bg-white p-4 rounded-full shadow-xl animate-pulse" style={{animationDelay: '1s', animationDuration: '2s'}}>
                <ChartBarIcon className="h-6 w-6 text-pink-500" />
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute -z-10 top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-ping" style={{animationDuration: '4s'}}></div>
            <div className="absolute -z-10 bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-60 animate-ping" style={{animationDuration: '3s', animationDelay: '1s'}}></div>
            <div className="absolute -z-10 top-1/2 left-0 w-12 h-12 bg-cyan-200 rounded-full opacity-60 animate-ping" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Row Component
const FeatureRow = ({ features }) => {
  return (
    <div className="px-6 md:px-20 py-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">Find by Specialty</h2>
        <p className="text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
          Simply browse through our extensive list of trusted doctors. Schedule your appointment hassle-free. 😊
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-blue-50 hover:bg-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-200"
            >
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-all">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-700 mb-2 text-lg">{feature.name}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// FAQ Section Component
const FAQSection = ({ faqSections, openFaq, toggleFaq }) => {
  return (
    <div className="px-6 md:px-20 py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Get answers to common questions about our healthcare services</p>
        </div>

        <div className="space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className={`text-xl font-bold mb-4 ${section.color} text-center`}>{section.title}</h3>
              <div className="space-y-4 max-w-4xl mx-auto">
                {section.questions.map((item, questionIndex) => (
                  <div key={questionIndex} className="bg-white rounded-xl shadow-lg border border-blue-100">
                    <button
                      onClick={() => toggleFaq(sectionIndex, questionIndex)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-50 transition-colors rounded-xl"
                    >
                      <span className="font-semibold text-blue-700 text-lg">{item.question}</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-blue-500 transition-transform ${
                          openFaq === `${sectionIndex}-${questionIndex}` ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === `${sectionIndex}-${questionIndex}` && (
                      <div className="px-6 pb-4 border-t border-blue-100">
                        <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Partners Section Component
const PartnersSection = () => {
  const partners = [
    { name: 'WBHS', logo: '🏥', color: 'bg-green-100 text-green-600' },
    { name: 'CGHS', logo: '⚕️', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'LIC', logo: '�️', color: 'bg-blue-100 text-blue-600' },
    { name: 'HDFCHS', logo: '🏦', color: 'bg-blue-100 text-blue-700' },
    { name: 'BOBHS', logo: '�️', color: 'bg-orange-100 text-orange-600' },
    { name: 'TCSHS', logo: '💻', color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="px-6 md:px-20 py-16 bg-gradient-to-br from-blue-50 to-white">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-12 text-center">
        We are attached with -
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 max-w-6xl mx-auto">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className={`w-20 h-20 ${partner.color} rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl transition-all duration-300`}>
              <span className="text-3xl">{partner.logo}</span>
            </div>
            <p className="text-lg font-bold text-blue-600 text-center group-hover:text-blue-800 transition-colors">
              {partner.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <div className="bg-white text-gray-700 py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* HealthCare+ */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6 text-blue-600">HealthCare+</h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-base">
              Empowering people through innovative digital health solutions, 
              we believe healthcare should be smart, simple, and seamless.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
              Discover More 
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">SERVICES</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Virtual Consultations
              </li>
              <li className="flex items-center text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                24/7 Assistance
              </li>
              <li className="flex items-center text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Health Analytics
              </li>
              <li className="flex items-center text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Emergency Support
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">CONTACT</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center text-base">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-pink-500" />
                support@Medify.com
              </div>
              <div className="flex items-center text-base">
                <PhoneIcon className="h-5 w-5 mr-3 text-blue-500" />
                +91 90070 09558
              </div>
              <div className="flex items-center text-base">
                <MapPinIcon className="h-5 w-5 mr-3 text-red-500" />
                Kolkata, India
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">NEWSLETTER</h3>
            <p className="text-gray-600 mb-4 text-base">Get weekly insights & tips.</p>
            <p className="text-gray-500 text-sm mb-6">No spam.</p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Your Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-300 w-full font-semibold text-white shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-base mb-4 md:mb-0">© 2025 HealthCare Platform. All rights reserved.</p>
          <div className="flex space-x-6">
            <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110">
              <span className="font-bold">in</span>
            </div>
            <div className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110">
              <span className="font-bold">ig</span>
            </div>
            <div className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110">
              <span className="font-bold">tw</span>
            </div>
            <div className="w-10 h-10 bg-gray-800 hover:bg-gray-900 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110">
              <span className="font-bold">gh</span>
            </div>
            <div className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110 relative">
              <span className="font-bold text-xs">yt</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientHome = () => {
  const [user, setUser] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('userName') || localStorage.getItem('username');
    if (username) {
      setUser({ name: username });
    }
  }, []);

  const features = [
    {
      name: 'Quick Checkup',
      description: 'AI-powered health assessment',
      icon: UserCircleIcon,
      link: '/quick-checkup',
    },
    {
      name: 'Health Metrics',
      description: 'Track your vital signs',
      icon: HeartIcon,
      link: '/health-metrics',
    },
    {
      name: 'Appointments',
      description: 'Book with verified doctors',
      icon: CalendarIcon,
      link: '/appointments',
    },
    {
      name: 'Emergency',
      description: 'Immediate assistance',
      icon: ExclamationTriangleIcon,
      link: '/emergency',
    },
    {
      name: 'Dashboard',
      description: 'Health overview',
      icon: ChartBarIcon,
      link: '/dashboard',
    },
  ];

  const faqSections = [
    {
      title: 'General Information',
      color: 'text-green-600',
      questions: [
        {
          question: 'What is the purpose of this platform?',
          answer: 'Our platform provides comprehensive healthcare services including AI-powered health assessments, doctor consultations, and emergency assistance.'
        },
        {
          question: 'Is the platform accessible 24/7?',
          answer: 'Yes, our platform is available 24/7 for your convenience. You can access health resources, book appointments, and get emergency help anytime.'
        }
      ]
    },
    {
      title: 'Appointments',
      color: 'text-blue-600',
      questions: [
        {
          question: 'How do I book an appointment?',
          answer: 'Simply go to the Appointments section, select a verified doctor, choose your preferred date and time, and confirm your booking.'
        },
        {
          question: 'Can I cancel or reschedule an appointment?',
          answer: 'Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time through your dashboard.'
        }
      ]
    },
    {
      title: 'Health Metrics',
      color: 'text-purple-600',
      questions: [
        {
          question: 'What are Health Metrics?',
          answer: 'Health Metrics allow you to track vital signs like blood pressure, heart rate, weight, and other important health indicators over time.'
        },
        {
          question: 'How do I input my health data?',
          answer: 'You can manually input your health data through the Health Metrics section or connect compatible health devices for automatic tracking.'
        }
      ]
    },
    {
      title: 'Emergencies',
      color: 'text-red-600',
      questions: [
        {
          question: 'What should I do during a health emergency?',
          answer: 'For immediate emergencies, call 911. For urgent health concerns, use our Emergency feature to get quick assistance and nearby hospital information.'
        },
        {
          question: 'Does the app alert nearby hospitals?',
          answer: 'Our emergency feature provides you with nearby hospital contacts and can help you connect with emergency services quickly.'
        }
      ]
    },
    {
      title: 'Technical Support',
      color: 'text-orange-600',
      questions: [
        {
          question: "I'm facing login issues, what do I do?",
          answer: 'Try clearing your browser cache and cookies. If the issue persists, contact our technical support team for assistance.'
        },
        {
          question: 'Can I access the platform from mobile?',
          answer: 'Yes, our platform is fully responsive and works seamlessly on all devices including smartphones and tablets.'
        }
      ]
    }
  ];

  const toggleFaq = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col">
      <HeroSection user={user} />
      <FeatureRow features={features} />
      <FAQSection faqSections={faqSections} openFaq={openFaq} toggleFaq={toggleFaq} />
      <PartnersSection />
      <Footer />
    </div>
  );
};

export default PatientHome;

