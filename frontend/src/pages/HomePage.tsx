import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [audienceCardsVisible, setAudienceCardsVisible] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  
  // Inspirational quotes state
  const inspirationalQuotes = [
    "Breathe in peace. Breathe out stress.",
    "You are worthy of support and understanding.",
    "Every sunrise is a new beginning.",
    "Your mental health matters. You matter.",
    "Healing is not linear, and that's okay.",
    "Be gentle with yourself. You're doing the best you can."
  ]
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  
  useEffect(() => {
    setIsLoaded(true)
    
    // Preload critical resources
    const linkElement = document.createElement('link')
    linkElement.rel = 'preload'
    linkElement.as = 'image'
    linkElement.href = '/meditative-sunset-scene-by-lake.jpg'
    document.head.appendChild(linkElement)
    
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)
    
    // Audience cards intersection observer
    const audienceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !audienceCardsVisible) {
          setAudienceCardsVisible(true)
        }
      })
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    })
    
    // Observe all scroll reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal')
    scrollElements.forEach((el) => observer.observe(el))
    
    // Observe audience section
    const audienceSection = document.querySelector('.who-we-serve-section')
    if (audienceSection) {
      audienceObserver.observe(audienceSection)
    }
    
    return () => {
      observer.disconnect()
      audienceObserver.disconnect()
    }
  }, [audienceCardsVisible])

  // Quote rotation effect
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        (prevIndex + 1) % inspirationalQuotes.length
      )
    }, 5000) // Change quote every 5 seconds

    return () => clearInterval(quoteInterval)
  }, [inspirationalQuotes.length])

  const handleLogout = async () => {
    await logout()
    // User will be redirected automatically when isAuthenticated changes
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, rgba(233, 30, 99, 0.1), rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1), rgba(233, 30, 99, 0.05))',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
      }}
    >
      {/* Keyframe animations style tag */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-15px) translateX(10px) rotate(2deg); }
          50% { transform: translateY(-8px) translateX(-5px) rotate(-1deg); }
          75% { transform: translateY(5px) translateX(8px) rotate(1deg); }
        }
        @keyframes slideInFromBottom {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconGentlePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 4px rgba(149, 117, 205, 0.2)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 4px 8px rgba(149, 117, 205, 0.3)); }
        }
        .homepage-hero-title {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 800ms ease-out 300ms forwards;
        }
        .homepage-hero-subtitle {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 800ms ease-out 500ms forwards;
        }
        .homepage-hero-cta {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 800ms ease-out 700ms forwards;
        }
        .homepage-audience-card {
          background: #FFFFFF;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(34, 44, 58, 0.08);
          border: 1px solid rgba(34, 44, 58, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          min-height: 280px;
          width: 100%;
          max-width: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          opacity: 0;
          transform: translateY(60px);
        }
        .homepage-audience-card.animate-slide-in {
          animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .homepage-audience-card:hover {
          transform: translateY(-8px) scale(1.035);
          box-shadow: 0 20px 40px rgba(34, 44, 58, 0.15);
        }
        .homepage-audience-card-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: block;
          line-height: 1;
          background: linear-gradient(135deg, rgba(149, 117, 205, 0.8) 0%, rgba(233, 30, 99, 0.8) 35%, rgba(33, 150, 243, 0.8) 70%, rgba(76, 175, 80, 0.8) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 2px 4px rgba(149, 117, 205, 0.2));
          animation: iconGentlePulse 4s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .homepage-audience-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .homepage-audience-card-ages {
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          background: linear-gradient(135deg, rgba(149, 117, 205, 0.9) 0%, rgba(233, 30, 99, 0.9) 50%, rgba(33, 150, 243, 0.9) 100%);
          padding: 0.5rem 1.2rem;
          border-radius: 2rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(149, 117, 205, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
      `}</style>
      
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 rounded z-50"
        style={{
          background: 'linear-gradient(135deg, #E91E63 0%, #2196F3 50%, #4CAF50 100%)',
          color: 'white',
          textDecoration: 'none'
        }}
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar
      <div 
        className="py-2 px-4 border-b shadow-sm" 
        role="banner"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomColor: '#E0E0E0',
          boxShadow: '0 2px 8px rgba(33, 33, 33, 0.08)'
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium" style={{ color: '#757575' }}>Accessibility Features Available</span>
            <button 
              className="underline rounded px-2 py-1 font-medium transition-colors"
              style={{ 
                color: '#E91E63',
                border: 'none',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#C2185B';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#E91E63';
              }}
              onClick={() => document.body.classList.toggle('dyslexia-friendly')}
              aria-label="Toggle dyslexia-friendly font"
            >
              Dyslexia Font
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm" style={{ color: '#757575' }}>
            <span className="font-medium">Crisis Hotline: <a href="tel:1860-2662-345" className="font-bold hover:underline rounded px-1" style={{ color: '#F44336' }}>1860-2662-345</a></span>
          </div>
        </div>
      </div> */}

      {/* Navigation */}
      <Navigation 
        isAuthenticated={isAuthenticated}
        user={user || undefined}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Enhanced Hero Section with Nature Background and Stunning Effects */}
        <section 
          className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center bg-no-repeat" 
          role="banner" 
          aria-labelledby="hero-heading"
          style={{
            backgroundImage: 'url(/assests/nature_scene.jpg)',
            minHeight: '100vh'
          }}
        >
          {/* Very light overlay for maximum background brightness */}
          <div 
            className="absolute inset-0" 
            aria-hidden="true"
            style={{
              background: 'linear-gradient(to bottom right, rgba(0,0,0,0.15), rgba(0,0,0,0.1), rgba(0,0,0,0.15))'
            }}
          ></div>
          
          {/* Animated particles effect */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60"
              style={{ 
                top: '25%', 
                left: '25%',
                animationDelay: '1000ms'
              }}
            ></div>
            <div 
              className="absolute w-1 h-1 rounded-full animate-ping opacity-40"
              style={{ 
                top: '75%', 
                left: '75%',
                backgroundColor: '#D8B4FE',
                animationDelay: '2000ms'
              }}
            ></div>
            <div 
              className="absolute w-1.5 h-1.5 rounded-full animate-ping opacity-50"
              style={{ 
                top: '50%', 
                left: '16.666667%',
                backgroundColor: '#93C5FD',
                animationDelay: '3000ms'
              }}
            ></div>
            <div 
              className="absolute w-2 h-2 rounded-full animate-ping opacity-30"
              style={{ 
                top: '16.666667%', 
                right: '25%',
                backgroundColor: '#F9A8D4',
                animationDelay: '4000ms'
              }}
            ></div>
          </div>
          
          {/* Floating Shapes for Visual Interest */}
          <div 
            className="absolute rounded-full opacity-30 pointer-events-none"
            aria-hidden="true"
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #E91E63, #2196F3)',
              top: '15%',
              right: '10%',
              animation: 'floatGentle 25s ease-in-out infinite',
              zIndex: 1
            }}
          ></div>
          <div 
            className="absolute rounded-full opacity-30 pointer-events-none"
            aria-hidden="true"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #2196F3, #4CAF50)',
              top: '60%',
              left: '5%',
              animation: 'floatGentle 30s ease-in-out infinite reverse',
              zIndex: 1
            }}
          ></div>
          <div 
            className="absolute rounded-full opacity-30 pointer-events-none"
            aria-hidden="true"
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #4CAF50, #E91E63)',
              top: '30%',
              left: '15%',
              animation: 'floatGentle 35s ease-in-out infinite',
              zIndex: 1
            }}
          ></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Enhanced Content Section */}
              <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Empathetic Headlines */}
                <h1 
                  id="hero-heading" 
                  className="homepage-hero-title text-3xl lg:text-5xl font-black text-white leading-tight mb-8"
                  style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                >
                  <span 
                    className="inline-block mb-4 transform transition-all duration-300 px-3 py-3 rounded-2xl font-black"
                    style={{
                      background: 'rgba(255,255,255,0.3)',
                      color: 'black',
                      border: '2px solid #374151'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1)';
                    }}
                  >
                    You're Not Alone. We Help You Heal.
                  </span>
                </h1>
                
                {/* Supportive Subheading */}
                <div 
                  className="homepage-hero-subtitle rounded-2xl p-6 mb-8 border shadow-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderColor: '#D1D5DB'
                  }}
                >
                  <p className="text-lg lg:text-xl text-black font-black leading-relaxed max-w-2xl">
                    Mental health support that honors your culture, respects your family values, and understands the unique pressures you face as a young person in India.
                  </p>
                </div>

                {/* Emotional Connection Point */}
                <div 
                  className="homepage-hero-subtitle rounded-2xl p-6 mb-8 shadow-2xl transform transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderLeft: '4px solid #7C3AED'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                      style={{
                        background: 'linear-gradient(to bottom right, #8B5CF6, #EC4899)'
                      }}
                    >
                      <span className="text-white text-xl">💬</span>
                    </div>
                    <div>
                      <p className="text-black font-black italic text-base leading-relaxed">
                        "Finally, someone who gets what it's like to balance family expectations with my own dreams. The support feels like talking to an understanding older sibling."
                      </p>
                      <cite className="text-sm text-black font-black not-italic mt-2 block">- Priya, 19, Delhi University</cite>
                    </div>
                  </div>
                </div>

                {/* Enhanced CTA Section */}
                <div className="homepage-hero-cta flex flex-col sm:flex-row gap-6 mb-8">
                  <button 
                    className="group relative text-white px-10 py-5 rounded-2xl font-black text-base transition-all duration-300 shadow-2xl transform overflow-hidden border-2"
                    style={{
                      background: 'linear-gradient(to right, #7C3AED, #EC4899, #2563EB)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1.05)';
                      target.style.boxShadow = '0 25px 50px -12px rgba(139, 92, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1)';
                      target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, #2563EB, #7C3AED, #EC4899)'
                      }}
                    ></div>
                    <span 
                      className="relative z-10 flex items-center justify-center"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    >
                      <span className="mr-2 text-2xl">🌟</span>
                      Start Your Healing Journey
                      <span className="ml-2 text-2xl">🌟</span>
                    </span>
                  </button>
                  <button 
                    className="group px-10 py-5 rounded-2xl font-black text-base transition-all duration-300 shadow-2xl transform border-3"
                    style={{
                      background: 'rgba(255,255,255,0.98)',
                      color: 'black',
                      borderColor: '#374151',
                      borderWidth: '3px'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1.05)';
                      target.style.background = '#FFFFFF';
                      target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'scale(1)';
                      target.style.background = 'rgba(255,255,255,0.98)';
                    }}
                  >
                    <span className="flex items-center justify-center">
                      Learn How We Help
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Safety & Privacy Assurance */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#4CAF50' }}>
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-black font-semibold">100% Confidential</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#2196F3' }}>
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-black font-semibold">Licensed Therapists</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#E91E63' }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-black font-semibold">Available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Inspirational Quote Section - Enhanced with stunning visuals */}
              <div 
                className={`relative transform transition-all duration-1200 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} flex items-center justify-center min-h-96`}
              >
                {/* Floating orbs background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute w-20 h-20 rounded-full blur-xl animate-pulse"
                    style={{
                      top: '25%',
                      left: '25%',
                      backgroundColor: 'rgba(168, 85, 247, 0.3)',
                      animationDelay: '1000ms'
                    }}
                  ></div>
                  <div 
                    className="absolute w-16 h-16 rounded-full blur-xl animate-pulse"
                    style={{
                      bottom: '33.333333%',
                      right: '33.333333%',
                      backgroundColor: 'rgba(251, 113, 133, 0.3)',
                      animationDelay: '2000ms'
                    }}
                  ></div>
                  <div 
                    className="absolute w-24 h-24 rounded-full blur-xl animate-pulse"
                    style={{
                      top: '66.666667%',
                      left: '50%',
                      backgroundColor: 'rgba(96, 165, 250, 0.2)',
                      animationDelay: '3000ms'
                    }}
                  ></div>
                </div>
                
                {/* Enhanced Inspirational Quote Card */}
                <div 
                  className="relative max-w-lg transform transition-all duration-300 rounded-3xl p-8 shadow-2xl border-2"
                  role="region"
                  aria-label="Daily inspiration"
                  aria-live="polite"
                  style={{
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(24px)',
                    borderColor: '#374151'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.05)';
                    target.style.boxShadow = '0 25px 50px -12px rgba(168, 85, 247, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                    target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                >
                  {/* Glowing border effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl blur opacity-20 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, #8B5CF6, #EC4899, #3B82F6)'
                    }}
                  ></div>
                  
                  <div className="relative text-center">
                    {/* Quote icon */}
                    <div className="mb-4">
                      <span 
                        className="text-4xl"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                      >✨</span>
                    </div>
                    
                    <p 
                      className="text-lg font-black text-black leading-relaxed mb-6 transition-opacity duration-500"
                    >
                      "{inspirationalQuotes[currentQuoteIndex]}"
                    </p>
                    
                    {/* Enhanced separator */}
                    <div 
                      className="w-20 h-1 rounded-full mx-auto mb-4"
                      style={{
                        background: 'linear-gradient(to right, #A78BFA, #F472B6, #60A5FA)',
                        boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.5)'
                      }}
                    ></div>
                    
                    {/* Progress indicators */}
                    <div className="flex justify-center mt-4 space-x-3">
                      {inspirationalQuotes.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all duration-500 ${
                            index === currentQuoteIndex 
                              ? 'scale-125' 
                              : 'hover:bg-gray-600'
                          }`}
                          style={{
                            backgroundColor: index === currentQuoteIndex ? '#7C3AED' : '#9CA3AF',
                            boxShadow: index === currentQuoteIndex ? '0 4px 6px -1px rgba(124, 58, 237, 0.5)' : 'none'
                          }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Cultural Elements with interactive effects */}
                <div 
                  className="absolute text-6xl opacity-40 animate-pulse transition-transform cursor-pointer"
                  aria-hidden="true"
                  style={{
                    top: '50%',
                    left: '-48px',
                    textShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >🪷</div>
                <div 
                  className="absolute text-5xl opacity-45 animate-pulse transition-transform cursor-pointer"
                  aria-hidden="true"
                  style={{
                    bottom: '25%',
                    right: '-48px',
                    animationDelay: '2000ms',
                    textShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >🕉️</div>
                <div 
                  className="absolute text-4xl opacity-35 animate-pulse transition-transform cursor-pointer"
                  aria-hidden="true"
                  style={{
                    top: '25%',
                    right: '-32px',
                    animationDelay: '3000ms',
                    textShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >☮️</div>
                
                {/* Additional floating elements for visual richness */}
                <div 
                  className="absolute text-3xl opacity-25 animate-bounce transition-transform cursor-pointer"
                  aria-hidden="true"
                  style={{
                    top: '75%',
                    left: '-32px',
                    animationDelay: '4000ms'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.25)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >🌸</div>
                <div 
                  className="absolute text-4xl opacity-30 animate-pulse transition-transform cursor-pointer"
                  aria-hidden="true"
                  style={{
                    bottom: '50%',
                    right: '0px',
                    animationDelay: '5000ms'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >✨</div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve Section */}
        
        {/* Enhanced Services Section */}
        <section 
          id="services" 
          className="py-20 lg:py-32 relative overflow-hidden" 
          role="region" 
          aria-labelledby="services-heading"
          style={{
            backgroundColor: '#F9FAFB'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div 
              style={{
                backgroundImage: 'radial-gradient(circle, #6B7280 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
              className="absolute inset-0"
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header */}
            <div className="text-center mb-20">
              <div 
                className="inline-flex items-center rounded-full px-6 py-3 mb-6 border"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 2px 8px rgba(33, 33, 33, 0.08)'
                }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-sm font-medium" style={{ color: '#111827' }}>Evidence-based • Culturally Informed • Accessible</span>
              </div>
              
              <h2 
                id="services-heading" 
                className="text-4xl lg:text-5xl font-bold mb-6"
                style={{ color: '#111827' }}
              >
                Comprehensive Care,{' '}
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #E91E63 0%, #2196F3 50%, #4CAF50 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Your Way
                </span>
              </h2>
              <p 
                className="text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed"
                style={{ color: '#374151' }}
              >
                From individual therapy to family support, we offer a full spectrum of mental health services designed specifically for the Indian youth experience.
              </p>
            </div>
            
            {/* Enhanced Service Cards - Horizontal Scrolling with Accessibility */}
            <div 
              className="mb-20 overflow-hidden"
              role="region"
              aria-labelledby="services-heading"
              aria-describedby="services-description"
              style={{
                mask: 'linear-gradient(90deg, transparent, white 20%, white 80%, transparent)',
                WebkitMask: 'linear-gradient(90deg, transparent, white 20%, white 80%, transparent)'
              }}
            >
              <div 
                id="services-description" 
                className="sr-only"
              >
                Horizontally scrollable service cards. Use arrow keys or swipe to navigate between services.
              </div>
              
              <div 
                className="flex gap-6 animate-scroll"
                style={{
                  width: 'fit-content',
                  animation: 'scroll 30s linear infinite'
                }}
              >
                <style>{`
                  @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-100% / 3)); }
                  }
                `}</style>
                {/* Create multiple copies for seamless infinite scroll */}
                {[...Array(3)].map((_, arrayIndex) => 
                  [
                    { 
                      icon: "💬", 
                      title: "1-on-1 Therapy", 
                      description: "Confidential sessions with licensed therapists who understand cultural nuances and family dynamics.",
                      features: ["Video/Audio calls", "Hindi/English support", "Cultural sensitivity"],
                      popular: true
                    },
                    { 
                      icon: "👥", 
                      title: "Group Sessions", 
                      description: "Connect with peers facing similar challenges in a safe, supportive environment.",
                      features: ["Peer support groups", "Skill-building workshops", "Age-specific groups"],
                      popular: false
                    },
                    { 
                      icon: "🏠", 
                      title: "Family Therapy", 
                      description: "Strengthen family bonds and improve communication with culturally informed counseling.",
                      features: ["Multi-generational approach", "Cultural mediation", "Communication tools"],
                      popular: false
                    },
                    { 
                      icon: "🧘", 
                      title: "Mindfulness & Yoga", 
                      description: "Ancient practices meets modern psychology for stress reduction and emotional balance.",
                      features: ["Guided meditation", "Yoga therapy", "Breathing techniques"],
                      popular: true
                    },
                    { 
                      icon: "📚", 
                      title: "Academic Support", 
                      description: "Managing study stress, exam anxiety, and academic pressure with healthy coping strategies.",
                      features: ["Study strategies", "Exam preparation", "Career counseling"],
                      popular: false
                    },
                    { 
                      icon: "🚨", 
                      title: "Crisis Support", 
                      description: "24/7 crisis intervention and emergency mental health support when you need it most.",
                      features: ["24/7 hotline", "Emergency response", "Safety planning"],
                      popular: false
                    }
                  ].map((service, serviceIndex) => (
                    <article 
                      key={`${arrayIndex}-${serviceIndex}-${service.title}`} 
                      className="group relative rounded-2xl p-6 transition-all duration-300"
                      role="article"
                      aria-labelledby={`service-title-${arrayIndex}-${serviceIndex}`}
                      tabIndex={arrayIndex === 0 ? 0 : -1}
                      style={{
                        minWidth: '320px',
                        maxWidth: '320px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = 'translateY(-4px)';
                        target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = 'translateY(0)';
                        target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          // Focus the Learn More button
                          const button = e.currentTarget.querySelector('button');
                          button?.focus();
                        }
                      }}
                    >
                      {/* Popular Badge */}
                      {service.popular && (
                        <div 
                          className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                          role="img"
                          aria-label="Most popular service"
                          style={{
                            background: 'linear-gradient(to right, #F59E0B, #E91E63)'
                          }}
                        >
                          Most Popular
                        </div>
                      )}
                      
                      <div>
                        {/* Icon with Animation */}
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                          role="img"
                          aria-label={`${service.title} service icon`}
                          style={{
                            background: 'linear-gradient(to bottom right, rgba(233, 30, 99, 0.2), rgba(76, 175, 80, 0.2))'
                          }}
                        >
                          <span className="text-4xl">{service.icon}</span>
                        </div>
                        
                        {/* Content */}
                        <h3 
                          id={`service-title-${arrayIndex}-${serviceIndex}`}
                          className="text-xl font-bold mb-4 group-hover:transition-colors transition-colors duration-300"
                          style={{ 
                            color: '#111827'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.color = '#E91E63';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.color = '#111827';
                          }}
                        >
                          {service.title}
                        </h3>
                        <p 
                          className="leading-relaxed mb-6"
                          style={{ color: '#374151' }}
                        >
                          {service.description}
                        </p>
                        
                        {/* Features List */}
                        <ul 
                          className="space-y-2 mb-6"
                          role="list"
                          aria-label={`${service.title} features`}
                        >
                          {service.features.map((feature, idx) => (
                            <li 
                              key={`${arrayIndex}-${serviceIndex}-${idx}`} 
                              className="flex items-center text-sm"
                              role="listitem"
                              style={{ color: '#6B7280' }}
                            >
                              <svg 
                                className="w-4 h-4 mr-2 flex-shrink-0" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                                style={{ color: '#4CAF50' }}
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {/* CTA Button */}
                        <button 
                          className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                          aria-label={`Learn more about ${service.title}`}
                          style={{
                            background: 'linear-gradient(135deg, #E91E63 0%, #2196F3 50%, #4CAF50 100%)',
                            color: 'white',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.transform = 'translateY(-2px)';
                            target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.transform = 'translateY(0)';
                            target.style.boxShadow = 'none';
                          }}
                          onClick={() => {
                            // Context-specific navigation for Academic Support and Family Therapy
                            if (service.title === 'Academic Support') {
                              navigate('/chat?context=academic')
                            } else if (service.title === 'Family Therapy') {
                              navigate('/chat?context=family')
                            } else {
                              // For other services, just navigate to chat without context
                              navigate('/chat')
                            }
                          }}
                        >
                          {service.title === 'Academic Support' || service.title === 'Family Therapy' ? 'Start Chat' : 'Learn More'}
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* Process Visualization Section */}
            <div 
              className="rounded-3xl shadow-xl border p-8 lg:p-12 mb-20"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderColor: '#E5E7EB'
              }}
            >
              <div className="text-center mb-12">
                <h3 
                  className="text-3xl lg:text-4xl font-bold mb-4"
                  style={{ color: '#111827' }}
                >
                  Your Journey to Wellness
                </h3>
                <p 
                  className="text-lg max-w-3xl mx-auto leading-relaxed"
                  style={{ color: '#374151' }}
                >
                  A simple, supportive process designed to make getting help as comfortable as possible
                </p>
              </div>
              
              {/* Process Steps */}
              <div 
                className="grid md:grid-cols-4 gap-8 relative"
                role="list"
                aria-label="Four-step wellness journey process"
              >
                {/* Connection Lines */}
                <div className="hidden md:block absolute top-16 left-0 w-full h-0.5 bg-gradient-hero opacity-30" aria-hidden="true"></div>
                
                {[
                  { 
                    step: "01", 
                    title: "Take Assessment", 
                    description: "5-minute confidential questionnaire",
                    icon: "📝",
                    color: "secondary-blue"
                  },
                  { 
                    step: "02", 
                    title: "Get Matched", 
                    description: "Connected with your ideal therapist",
                    icon: "🤝",
                    color: "tertiary-green"
                  },
                  { 
                    step: "03", 
                    title: "Start Sessions", 
                    description: "Begin your personalized therapy",
                    icon: "💬",
                    color: "primary-magenta"
                  },
                  { 
                    step: "04", 
                    title: "Track Progress", 
                    description: "Monitor your growth journey",
                    icon: "📈",
                    color: "secondary-blue"
                  }
                ].map((step, index) => (
                  <div 
                    key={step.step} 
                    className="text-center relative group focus-within:scale-105 transition-transform duration-300"
                    role="listitem"
                    tabIndex={0}
                    aria-labelledby={`step-title-${index}`}
                    aria-describedby={`step-description-${index}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Add visual feedback or action here
                        e.currentTarget.classList.add('scale-110');
                        setTimeout(() => {
                          e.currentTarget.classList.remove('scale-110');
                        }, 200);
                      }
                    }}
                  >
                    {/* Step Circle */}
                    <div 
                      className={`w-16 h-16 bg-${step.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 group-hover:scale-110 group-focus-within:scale-110 transition-all duration-300 shadow-lg relative z-10`}
                      role="img"
                      aria-label={`Step ${step.step}: ${step.title}`}
                    >
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div 
                      className="text-4xl mb-4 group-hover:animate-bounce"
                      role="img"
                      aria-label={`${step.title} icon`}
                    >
                      {step.icon}
                    </div>
                    
                    {/* Content */}
                    <h4 
                      id={`step-title-${index}`}
                      className="process-step-title text-text-primary mb-2"
                    >
                      {step.title}
                    </h4>
                    <p 
                      id={`step-description-${index}`}
                      className="process-step-description text-text-body"
                    >
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators Section */}
            <div 
              className="grid md:grid-cols-3 gap-8"
              role="region"
              aria-label="Trust indicators and statistics"
            >
              {/* Stats Card */}
              <div 
                className="bg-gradient-to-br from-secondary-blue/10 to-tertiary-green/10 rounded-2xl p-8 text-center border border-secondary-blue/20 focus-within:ring-2 focus-within:ring-secondary-blue transition-all duration-300"
                tabIndex={0}
                role="article"
                aria-labelledby="stats-heading"
              >
                <div 
                  className="text-4xl lg:text-5xl font-bold text-secondary-blue mb-2"
                  aria-label="Ten thousand plus"
                >
                  10,000+
                </div>
                <div 
                  id="stats-heading"
                  className="text-lg text-text-primary font-semibold mb-2"
                >
                  Young People Helped
                </div>
                <div className="text-text-muted">Across India since 2020</div>
              </div>

              {/* Certification Card */}
              <div className="bg-gradient-to-br from-secondary-green/10 to-warm-orange/10 rounded-2xl p-8 text-center border border-secondary-green/20">
                <div className="text-4xl lg:text-5xl font-bold text-secondary-green mb-2">95%</div>
                <div className="text-lg text-text-primary font-semibold mb-2">Success Rate</div>
                <div className="text-text-secondary">Report improved mental health</div>
              </div>

              {/* Availability Card */}
              <div className="bg-gradient-to-br from-warm-orange/10 to-primary-blue/10 rounded-2xl p-8 text-center border border-warm-orange/20">
                <div className="text-4xl lg:text-5xl font-bold text-warm-orange mb-2">24/7</div>
                <div className="text-lg text-text-primary font-semibold mb-2">Always Available</div>
                <div className="text-text-secondary">Crisis support when needed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section 
          className="py-20 lg:py-32 relative overflow-hidden" 
          role="region" 
          aria-labelledby="testimonials-heading"
          style={{
            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), white, rgba(34, 197, 94, 0.05))'
          }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0" style={{ opacity: 0.1 }} aria-hidden="true">
            <div 
              className="absolute w-40 h-40 rounded-full"
              style={{
                top: '80px',
                left: '40px',
                background: '#3b82f6',
                filter: 'blur(48px)'
              }}
            ></div>
            <div 
              className="absolute w-60 h-60 rounded-full"
              style={{
                bottom: '80px',
                right: '40px',
                background: '#22c55e',
                filter: 'blur(48px)'
              }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-20">
              <div 
                className="inline-flex items-center rounded-full px-6 py-3 mb-6 border shadow-soft"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderColor: 'rgba(59, 130, 246, 0.2)'
                }}
              >
                <span style={{ color: '#eab308', marginRight: '8px' }}>⭐⭐⭐⭐⭐</span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: '#111827' }}
                >
                  4.8/5 rating from 2,000+ reviews
                </span>
              </div>
              
              <h2 
                id="testimonials-heading" 
                className="text-4xl lg:text-6xl font-bold mb-6"
                style={{ color: '#111827' }}
              >
                Real Stories,{' '}
                <span 
                  style={{
                    background: 'linear-gradient(to right, #3b82f6, #22c55e)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Real Healing
                </span>
              </h2>
              <p 
                className="text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed"
                style={{ color: '#6b7280' }}
              >
                Hear from young people across India who found their path to better mental health with our culturally sensitive support
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  quote: "I was drowning in academic pressure and family expectations. MindCare helped me understand that asking for help isn't weakness. My therapist really got my family situation and helped me communicate better with my parents.",
                  name: "Priya",
                  age: "17",
                  location: "Mumbai",
                  avatar: "👩‍🎓",
                  category: "Academic Stress"
                },
                {
                  quote: "The transition to college was overwhelming me. Through therapy here, I learned healthy coping strategies and my grades actually improved because I wasn't constantly anxious about everything.",
                  name: "Arjun",
                  age: "20", 
                  location: "Bangalore",
                  avatar: "👨‍💻",
                  category: "Life Transitions"
                },
                {
                  quote: "I was struggling with my identity and felt like I couldn't talk to anyone in my family. MindCare provided a safe space where I could be myself and work through my feelings without judgment.",
                  name: "Anonymous",
                  age: "19",
                  location: "Delhi",
                  avatar: "🎭",
                  category: "Identity & Self-Acceptance"
                },
                {
                  quote: "The family therapy sessions changed everything. My parents now understand my anxiety isn't just 'being weak' and we've learned to communicate so much better. Our whole family dynamic improved.",
                  name: "Kavya",
                  age: "16",
                  location: "Chennai",
                  avatar: "👨‍👩‍👧",
                  category: "Family Relationships"
                },
                {
                  quote: "Starting my career felt impossible with my social anxiety. The group sessions helped me realize I wasn't alone, and now I'm confident in interviews and workplace interactions.",
                  name: "Rohit",
                  age: "23",
                  location: "Pune",
                  avatar: "🤝",
                  category: "Career & Social Anxiety"
                },
                {
                  quote: "The crisis support team literally saved my life during my darkest moment. The 24/7 availability and immediate, compassionate response showed me that there's always hope and help available.",
                  name: "Meera",
                  age: "21",
                  location: "Hyderabad", 
                  avatar: "🌅",
                  category: "Crisis Support"
                }
              ].map((testimonial, index) => (
                <article 
                  key={index} 
                  className="group relative rounded-2xl p-8 transition-all duration-500 overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'scale(1)';
                  }}
                >
                  {/* Category Badge */}
                  <div 
                    className="absolute text-white text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      top: '16px',
                      right: '16px',
                      background: 'linear-gradient(to right, #3b82f6, #22c55e)'
                    }}
                  >
                    {testimonial.category}
                  </div>

                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), transparent, rgba(34, 197, 94, 0.05))'
                    }}
                  ></div>

                  <div className="relative">
                    {/* Quote */}
                    <div className="mb-6">
                      <svg 
                        className="w-8 h-8 mb-4" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: 'rgba(59, 130, 246, 0.3)' }}
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                      <blockquote 
                        className="leading-relaxed text-lg italic"
                        style={{ color: '#111827' }}
                      >
                        "{testimonial.quote}"
                      </blockquote>
                    </div>

                    {/* Profile */}
                    <footer 
                      className="border-t pt-6"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                          style={{
                            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.2))'
                          }}
                        >
                          {testimonial.avatar}
                        </div>
                        <div>
                          <cite className="not-italic">
                            <div 
                              className="font-bold"
                              style={{ color: '#111827' }}
                            >
                              {testimonial.name}, {testimonial.age}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: '#9ca3af' }}
                            >
                              {testimonial.location}
                            </div>
                          </cite>
                        </div>
                      </div>
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {[
                { icon: "🏆", title: "Award Winning", subtitle: "Top Mental Health Platform 2024" },
                { icon: "🔒", title: "100% Confidential", subtitle: "HIPAA Compliant & Secure" },
                { icon: "👨‍⚕️", title: "Licensed Professionals", subtitle: "Verified & Experienced Therapists" },
                { icon: "🇮🇳", title: "Made for India", subtitle: "Cultural Context & Local Understanding" }
              ].map((badge, index) => (
                <div key={index} className="text-center group">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg transition-all duration-300 border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      borderColor: 'rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'scale(1)';
                    }}
                  >
                    {badge.icon}
                  </div>
                  <h3 
                    className="font-bold mb-1"
                    style={{ color: '#111827' }}
                  >
                    {badge.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: '#9ca3af' }}
                  >
                    {badge.subtitle}
                  </p>
                </div>
              ))}
            </div>

            {/* Cultural Sensitivity & Emergency Support */}
            <div 
              className="rounded-3xl p-8 lg:p-12"
              style={{
                background: 'linear-gradient(to bottom right, rgba(20, 184, 166, 0.05), rgba(59, 130, 246, 0.05))'
              }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Cultural Understanding */}
                <div>
                  <h3 
                    className="text-2xl lg:text-3xl font-bold mb-6"
                    style={{ color: '#111827' }}
                  >
                    Understanding Your Cultural Context
                  </h3>
                  <div 
                    className="space-y-4"
                    style={{ color: '#6b7280' }}
                  >
                    <div className="flex items-start">
                      <span 
                        className="text-2xl mt-1"
                        style={{ marginRight: '12px' }}
                      >
                        🏠
                      </span>
                      <div>
                        <h4 
                          className="font-semibold"
                          style={{ color: '#111827' }}
                        >
                          Family-Centered Approach
                        </h4>
                        <p>We understand the importance of family in Indian culture and work to build bridges, not walls.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span 
                        className="text-2xl mt-1"
                        style={{ marginRight: '12px' }}
                      >
                        📚
                      </span>
                      <div>
                        <h4 
                          className="font-semibold"
                          style={{ color: '#111827' }}
                        >
                          Academic Pressure Support
                        </h4>
                        <p>Navigate competitive education systems and career expectations with healthy coping strategies.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span 
                        className="text-2xl mt-1"
                        style={{ marginRight: '12px' }}
                      >
                        🕉️
                      </span>
                      <div>
                        <h4 
                          className="font-semibold"
                          style={{ color: '#111827' }}
                        >
                          Spiritual Integration
                        </h4>
                        <p>Blend traditional Indian wellness practices with modern psychological approaches.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Support */}
                <div 
                  className="rounded-2xl p-8 shadow-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <div className="text-center mb-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)'
                      }}
                    >
                      🆘
                    </div>
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{ color: '#111827' }}
                    >
                      Need Immediate Support?
                    </h3>
                    <p style={{ color: '#9ca3af' }}>
                      We're here for you 24/7, especially during crisis moments.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <a 
                      href="tel:1860-2662-345" 
                      className="block w-full text-white text-center py-4 rounded-xl font-semibold transition-colors"
                      aria-label="Call crisis hotline at 1860-2662-345"
                      style={{
                        background: '#ef4444'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = '#dc2626';
                        target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = '#ef4444';
                        target.style.transform = 'translateY(0)';
                      }}
                    >
                      🚨 Crisis Hotline: 1860-2662-345
                    </a>
                    <button 
                      className="w-full text-white py-3 rounded-xl font-medium transition-colors"
                      style={{
                        background: '#3b82f6'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = '#2563eb';
                        target.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = '#3b82f6';
                        target.style.transform = 'scale(1)';
                      }}
                    >
                      Chat with Crisis Counselor
                    </button>
                    <p 
                      className="text-xs text-center"
                      style={{ color: '#9ca3af' }}
                    >
                      Available in Hindi, English, and regional languages
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div 
              className="text-center rounded-3xl shadow-xl border p-8 lg:p-12"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <h3 
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: '#111827' }}
              >
                Ready to Start Your Story?
              </h3>
              <p 
                className="text-xl mb-8 max-w-2xl mx-auto"
                style={{ color: '#6b7280' }}
              >
                Join thousands of young people who've found their path to better mental health with culturally sensitive, professional support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="group relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'scale(1.05)';
                    target.style.background = 'linear-gradient(to right, #22c55e, #3b82f6)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'scale(1)';
                    target.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)';
                  }}
                  onFocus={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.outline = '4px solid rgba(59, 130, 246, 0.5)';
                  }}
                  onBlur={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.outline = 'none';
                  }}
                >
                  <span className="relative z-10">Begin Your Healing Journey</span>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, #22c55e, #3b82f6)'
                    }}
                  ></div>
                </button>
                <button 
                  className="group border-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                  style={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.background = '#3b82f6';
                    target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.background = 'transparent';
                    target.style.color = '#3b82f6';
                  }}
                  onFocus={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.outline = '4px solid rgba(59, 130, 246, 0.3)';
                  }}
                  onBlur={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.outline = 'none';
                  }}
                >
                  <span className="flex items-center">
                    Schedule Free Consultation
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ marginLeft: '8px' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Footer */}
      <footer 
        className="text-white py-16" 
        role="contentinfo"
        style={{ background: '#111827' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4" style={{ gap: '12px' }}>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: '#3b82f6' }}
                >
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <span className="text-2xl font-bold">MindCare</span>
              </div>
              <p style={{ color: '#d1d5db' }}>Mental health support for Indian youth.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Services', 'About', 'Contact'].map((link) => (
                  <li key={link} style={{ marginBottom: '8px' }}>
                    <Link 
                      to="/" 
                      className="transition-colors"
                      style={{ color: '#d1d5db' }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.color = '#d1d5db';
                      }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Blog', 'Self-Help', 'Crisis Help'].map((link) => (
                  <li key={link} style={{ marginBottom: '8px' }}>
                    <Link 
                      to="/" 
                      className="transition-colors"
                      style={{ color: '#d1d5db' }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.color = '#d1d5db';
                      }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Help</h3>
              <p style={{ color: '#d1d5db' }}>Crisis Hotline:</p>
              <a 
                href="tel:1860-2662-345" 
                className="font-semibold text-lg"
                style={{ color: '#ef4444' }}
              >
                1860-2662-345
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
