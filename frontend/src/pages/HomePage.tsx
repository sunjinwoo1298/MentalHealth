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
    <div className="min-h-screen bg-hero-animated">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-gradient px-4 py-2 rounded z-50 focus-ring"
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <div className="bg-neutral-white py-2 px-4 border-b border-border-light shadow-soft" role="banner">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-accessibility font-medium">Accessibility Features Available</span>
            <button 
              className="text-primary-magenta hover:text-primary-magenta-dark underline focus-ring rounded px-2 py-1 font-medium transition-colors"
              onClick={() => document.body.classList.toggle('dyslexia-friendly')}
              aria-label="Toggle dyslexia-friendly font"
            >
              Dyslexia Font
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span className="font-medium">Crisis Hotline: <a href="tel:1860-2662-345" className="text-error font-bold hover:underline focus-ring rounded px-1">1860-2662-345</a></span>
          </div>
        </div>
      </div>

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
          <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/10 to-black/15" aria-hidden="true"></div>
          
          {/* Animated particles effect */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping animation-delay-1000 opacity-60"></div>
            <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-purple-300 rounded-full animate-ping animation-delay-2000 opacity-40"></div>
            <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping animation-delay-3000 opacity-50"></div>
            <div className="absolute top-1/6 right-1/4 w-2 h-2 bg-pink-300 rounded-full animate-ping animation-delay-4000 opacity-30"></div>
          </div>
          
          {/* Floating Shapes for Visual Interest - Enhanced */}
          <div className="hero-floating-shape hero-floating-shape-1 opacity-30 bg-gradient-to-br from-purple-500/20 to-pink-500/20" aria-hidden="true"></div>
          <div className="hero-floating-shape hero-floating-shape-2 opacity-30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" aria-hidden="true"></div>
          <div className="hero-floating-shape hero-floating-shape-3 opacity-30 bg-gradient-to-br from-green-500/20 to-emerald-500/20" aria-hidden="true"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center hero-content">
              {/* Enhanced Content Section */}
              <div>
                {/* Trust Badge */}
                {/* <div className="hero-trust-badge inline-flex items-center bg-white/95 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/10 shadow-2xl hover:shadow-white/10 hover:scale-105 transition-all duration-100">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse shadow-lg shadow-green-400/50"></span>
                  <span className="text-sm font-black text-black-9000 tracking-wide">Trusted by 10,000+ young people across India</span>
                </div> */}

                {/* Empathetic Headlines */}
                <h1 id="hero-heading" className="hero-title text-3xl lg:text-5xl font-black text-white leading-tight mb-8 drop-shadow-2xl">
                  <span className="bg-white/30 text-black font-black px-3 py-3 rounded-2xl  inline-block mb-4 transform hover:scale-105 transition-all duration-300 border-2 border-gray-800">
                    You're Not Alone. We Help You Heal.
                  </span>
                  <br />
                  {/* <span className="bg-white/30 text-black font-black text-4xl lg:text-6xl drop-shadow-2xl px-4 py-2 rounded-2xl border-2 border-gray-800 shadow-2xl backdrop-blur-sm">
                    We Understand.
                  </span> */}
                </h1>
                
                {/* Supportive Subheading */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-200 shadow-2xl">
                  <p className="hero-subtitle text-lg lg:text-xl text-black font-black leading-relaxed max-w-2xl">
                    Mental health support that honors your culture, respects your family values, and understands the unique pressures you face as a young person in India.
                  </p>
                </div>

                {/* Emotional Connection Point */}
                <div className="hero-subtitle bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-8 border-l-4 border-l-purple-600 shadow-2xl hover-lift transform hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
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
                <div className="hero-cta flex flex-col sm:flex-row gap-6 mb-8">
                  <button className="group relative bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 text-white px-10 py-5 rounded-2xl font-black text-base transition-all duration-300 hover-lift shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 overflow-hidden border-2 border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center drop-shadow-lg">
                      <span className="mr-2 text-2xl">🌟</span>
                      Start Your Healing Journey
                      <span className="ml-2 text-2xl">🌟</span>
                    </span>
                  </button>
                  <button className="group bg-white/98 text-black border-3 border-gray-800 px-10 py-5 rounded-2xl font-black text-base transition-all duration-300 hover-scale shadow-2xl hover:bg-white hover:shadow-xl transform hover:scale-105">
                    <span className="flex items-center justify-center">
                      Learn How We Help
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Safety & Privacy Assurance */}
                <div className="flex items-center space-x-6 text-sm text-text-secondary">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-tertiary-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-black font-semibold">100% Confidential</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-secondary-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-black font-semibold">Licensed Therapists</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-magenta" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-black font-semibold">Available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Inspirational Quote Section - Enhanced with stunning visuals */}
              <div className={`relative transform transition-all duration-1200 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} flex items-center justify-center min-h-96`}>
                {/* Floating orbs background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-400/30 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-pink-400/30 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
                  <div className="absolute top-2/3 left-1/2 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse animation-delay-3000"></div>
                </div>
                
                {/* Enhanced Inspirational Quote Card */}
                <div 
                  className="relative bg-white/98 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-gray-800 inspiration-quote max-w-lg transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30"
                  role="region"
                  aria-label="Daily inspiration"
                  aria-live="polite"
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  
                  <div className="relative text-center">
                    {/* Quote icon */}
                    <div className="mb-4">
                      <span className="text-4xl drop-shadow-lg">✨</span>
                    </div>
                    
                    <p className="text-lg font-black text-black leading-relaxed mb-6 inspiration-text transition-opacity duration-500">
                      "{inspirationalQuotes[currentQuoteIndex]}"
                    </p>
                    
                    {/* Enhanced separator */}
                    <div className="w-20 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full mx-auto mb-4 shadow-lg shadow-purple-500/50"></div>
                    
                    {/* Progress indicators */}
                    <div className="flex justify-center mt-4 space-x-3">
                      {inspirationalQuotes.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all duration-500 ${
                            index === currentQuoteIndex 
                              ? 'bg-purple-600 shadow-lg shadow-purple-600/50 scale-125' 
                              : 'bg-gray-400 hover:bg-gray-600'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Cultural Elements with interactive effects */}
                <div className="absolute top-1/2 -left-12 text-6xl opacity-40 animate-pulse drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer" aria-hidden="true">🪷</div>
                <div className="absolute bottom-1/4 -right-12 text-5xl opacity-45 animate-pulse animation-delay-2000 drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer" aria-hidden="true">🕉️</div>
                <div className="absolute top-1/4 -right-8 text-4xl opacity-35 animate-pulse animation-delay-3000 drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer" aria-hidden="true">☮️</div>
                
                {/* Additional floating elements for visual richness */}
                <div className="absolute top-3/4 -left-8 text-3xl opacity-25 animate-bounce animation-delay-4000 hover:scale-125 transition-transform cursor-pointer" aria-hidden="true">🌸</div>
                <div className="absolute bottom-1/2 right-0 text-4xl opacity-30 animate-pulse animation-delay-5000 hover:scale-110 transition-transform cursor-pointer" aria-hidden="true">✨</div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve Section */}
      {/* Who We Serve Section */}
      <section 
        className="who-we-serve-section" 
        id="who-we-serve"
        role="region" 
        aria-labelledby="who-we-serve-heading"
      >
        <div className="who-we-serve-decorative-blob" aria-hidden="true"></div>
        <div className="who-we-serve-decorative-blob-2" aria-hidden="true"></div>
        <div className="who-we-serve-floating-circle-1" aria-hidden="true"></div>
        <div className="who-we-serve-floating-circle-2" aria-hidden="true"></div>
        <div className="who-we-serve-floating-blob-1" aria-hidden="true"></div>
        <div className="who-we-serve-floating-blob-2" aria-hidden="true"></div>
        <div className="container">
          <h2 id="who-we-serve-heading" className="who-we-serve-heading">
            Tailored Support for Every Stage
          </h2>
          <p className="who-we-serve-subheading">
            Our platform adapts to the unique needs and challenges at every stage of youth development, 
            providing age-appropriate resources and culturally relevant support.
          </p>
          
          <div className="audience-cards-grid relative z-10">
            <div 
              className={`audience-card ${audienceCardsVisible ? 'animate-slide-in' : ''}`}
              style={{animationDelay: audienceCardsVisible ? '0ms' : ''}}
              role="article"
              aria-labelledby="children-title"
              tabIndex={0}
            >
              <span className="audience-card-icon" aria-hidden="true">🌱</span>
              <h3 id="children-title" className="audience-card-title">Children</h3>
              <span className="audience-card-ages">Ages 8-12</span>
              <p className="audience-card-description">
                Building emotional awareness through interactive stories, simple coping strategies, 
                and safe expression tools designed for developing minds.
              </p>
            </div>
            
            <div 
              className={`audience-card ${audienceCardsVisible ? 'animate-slide-in' : ''}`}
              style={{animationDelay: audienceCardsVisible ? '150ms' : ''}}
              role="article"
              aria-labelledby="teens-title"
              tabIndex={0}
            >
              <span className="audience-card-icon" aria-hidden="true">🌸</span>
              <h3 id="teens-title" className="audience-card-title">Teens</h3>
              <span className="audience-card-ages">Ages 13-17</span>
              <p className="audience-card-description">
                Navigating identity, relationships, and academic pressure with peer support, 
                stress management tools, and confidential guidance.
              </p>
            </div>
            
            <div 
              className={`audience-card ${audienceCardsVisible ? 'animate-slide-in' : ''}`}
              style={{animationDelay: audienceCardsVisible ? '300ms' : ''}}
              role="article"
              aria-labelledby="young-adults-title"
              tabIndex={0}
            >
              <span className="audience-card-icon" aria-hidden="true">🌳</span>
              <h3 id="young-adults-title" className="audience-card-title">Young Adults</h3>
              <span className="audience-card-ages">Ages 18-25</span>
              <p className="audience-card-description">
                Transitioning to independence with career guidance, relationship counseling, 
                and mental health resources for life's major decisions.
              </p>
            </div>
          </div>
          
          {/* Main CTA Button */}
          <div className="text-center mt-12 relative z-10">
            <button
              className="who-we-serve-cta-button"
              onClick={() => navigate('/resources')}
              aria-label="Explore mental health resources tailored to your needs"
            >
              <span className="cta-button-text">Explore Resources</span>
              <span className="cta-button-icon" aria-hidden="true">→</span>
            </button>
            <p className="cta-button-subtitle">
              Discover personalized support for your mental wellness journey
            </p>
          </div>
        </div>
      </section>        {/* Enhanced Services Section */}
        <section id="services" className="py-20 lg:py-32 bg-neutral-50 relative overflow-hidden" role="region" aria-labelledby="services-heading">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div className="absolute inset-0 bg-pattern-dots"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-neutral-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-border-light shadow-soft">
                <span className="w-2 h-2 bg-tertiary-green rounded-full mr-3 animate-pulse"></span>
                <span className="text-sm font-medium text-text-primary">Evidence-based • Culturally Informed • Accessible</span>
              </div>
              
              <h2 id="services-heading" className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                Comprehensive Care,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-hero">
                  Your Way
                </span>
              </h2>
              <p className="text-lg lg:text-xl text-text-body max-w-4xl mx-auto leading-relaxed">
                From individual therapy to family support, we offer a full spectrum of mental health services designed specifically for the Indian youth experience.
              </p>
            </div>
            
            {/* Enhanced Service Cards - Horizontal Scrolling with Accessibility */}
            <div 
              className="features-section horizontal-scroll-container mb-20"
              role="region"
              aria-labelledby="services-heading"
              aria-describedby="services-description"
            >
              <div 
                id="services-description" 
                className="sr-only"
              >
                Horizontally scrollable service cards. Use arrow keys or swipe to navigate between services.
              </div>
              
              <div className="horizontal-scroll-track">
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
                      className="service-card-horizontal group"
                      role="article"
                      aria-labelledby={`service-title-${arrayIndex}-${serviceIndex}`}
                      tabIndex={arrayIndex === 0 ? 0 : -1}
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
                          className="absolute top-4 right-4 bg-gradient-to-r from-accent-orange to-primary-magenta text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                          role="img"
                          aria-label="Most popular service"
                        >
                          Most Popular
                        </div>
                      )}
                      
                      <div className="service-card-content">
                        {/* Icon with Animation */}
                        <div 
                          className="w-16 h-16 bg-gradient-to-br from-primary-magenta/20 to-tertiary-green/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                          role="img"
                          aria-label={`${service.title} service icon`}
                        >
                          <span className="text-4xl">{service.icon}</span>
                        </div>
                        
                        {/* Content */}
                        <h3 
                          id={`service-title-${arrayIndex}-${serviceIndex}`}
                          className="service-card-content h3 text-text-primary mb-4 group-hover:text-primary-magenta transition-colors"
                        >
                          {service.title}
                        </h3>
                        <p className="service-card-content p text-text-body leading-relaxed mb-6">
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
                              className="flex items-center text-sm text-text-muted"
                              role="listitem"
                            >
                              <svg 
                                className="w-4 h-4 mr-2 text-tertiary-green flex-shrink-0" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {/* CTA Button */}
                        <button 
                          className="w-full btn-gradient py-3 rounded-xl font-semibold transition-all duration-300 hover-lift focus-ring"
                          aria-label={`Learn more about ${service.title}`}
                        >
                          Learn More
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* Process Visualization Section */}
            <div className="bg-neutral-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-border-light p-8 lg:p-12 mb-20">
              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Your Journey to Wellness
                </h3>
                <p className="text-lg text-text-body max-w-3xl mx-auto leading-relaxed">
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
        <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-blue-50 via-white to-secondary-green-50 relative overflow-hidden" role="region" aria-labelledby="testimonials-heading">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-20 left-10 w-40 h-40 bg-primary-blue rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-secondary-green rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-primary-blue/20 shadow-soft">
                <span className="text-yellow-500 mr-2">⭐⭐⭐⭐⭐</span>
                <span className="text-sm font-medium text-text-primary">4.8/5 rating from 2,000+ reviews</span>
              </div>
              
              <h2 id="testimonials-heading" className="text-4xl lg:text-6xl font-bold text-text-primary mb-6">
                Real Stories,{' '}
                <span className="bg-gradient-to-r from-primary-blue to-secondary-green bg-clip-text text-transparent">
                  Real Healing
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
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
                <article key={index} className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:scale-105 transition-all duration-500 overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-blue to-secondary-green text-white text-xs font-bold px-3 py-1 rounded-full">
                    {testimonial.category}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-transparent to-secondary-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative">
                    {/* Quote */}
                    <div className="mb-6">
                      <svg className="w-8 h-8 text-primary-blue/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                      <blockquote className="text-text-primary leading-relaxed text-lg italic">
                        "{testimonial.quote}"
                      </blockquote>
                    </div>

                    {/* Profile */}
                    <footer className="border-t border-neutral-200 pt-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-secondary-green/20 rounded-full flex items-center justify-center text-2xl mr-4">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <cite className="not-italic">
                            <div className="font-bold text-text-primary">
                              {testimonial.name}, {testimonial.age}
                            </div>
                            <div className="text-sm text-text-muted">{testimonial.location}</div>
                          </cite>
                        </div>
                      </div>
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="trust-badges grid md:grid-cols-4 gap-8 mb-16">
              {[
                { icon: "🏆", title: "Award Winning", subtitle: "Top Mental Health Platform 2024" },
                { icon: "🔒", title: "100% Confidential", subtitle: "HIPAA Compliant & Secure" },
                { icon: "👨‍⚕️", title: "Licensed Professionals", subtitle: "Verified & Experienced Therapists" },
                { icon: "🇮🇳", title: "Made for India", subtitle: "Cultural Context & Local Understanding" }
              ].map((badge, index) => (
                <div key={index} className="text-center group scroll-reveal">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg hover-scale smooth-transition border border-primary-blue/20">
                    {badge.icon}
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">{badge.title}</h3>
                  <p className="text-sm text-text-muted">{badge.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Cultural Sensitivity & Emergency Support */}
            <div className="bg-gradient-to-br from-accent-teal-50 to-primary-blue-50 rounded-3xl p-8 lg:p-12 scroll-reveal">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Cultural Understanding */}
                <div className="cultural-understanding">
                  <h3 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6">
                    Understanding Your Cultural Context
                  </h3>
                  <div className="space-y-4 text-text-secondary">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 mt-1">🏠</span>
                      <div>
                        <h4 className="font-semibold text-text-primary">Family-Centered Approach</h4>
                        <p>We understand the importance of family in Indian culture and work to build bridges, not walls.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 mt-1">📚</span>
                      <div>
                        <h4 className="font-semibold text-text-primary">Academic Pressure Support</h4>
                        <p>Navigate competitive education systems and career expectations with healthy coping strategies.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 mt-1">🕉️</span>
                      <div>
                        <h4 className="font-semibold text-text-primary">Spiritual Integration</h4>
                        <p>Blend traditional Indian wellness practices with modern psychological approaches.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Support */}
                <div className="emergency-support bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-crisis-red/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                      🆘
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Need Immediate Support?</h3>
                    <p className="text-text-muted">We're here for you 24/7, especially during crisis moments.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <a 
                      href="tel:1860-2662-345" 
                      className="block w-full bg-crisis-red hover:bg-crisis-red-dark text-white text-center py-4 rounded-xl font-semibold transition-colors hover-lift button-press focus-ring"
                      aria-label="Call crisis hotline at 1860-2662-345"
                    >
                      🚨 Crisis Hotline: 1860-2662-345
                    </a>
                    <button className="w-full bg-primary-blue hover:bg-primary-blue-dark text-white py-3 rounded-xl font-medium transition-colors hover-scale button-press focus-ring">
                      Chat with Crisis Counselor
                    </button>
                    <p className="text-xs text-text-muted text-center">
                      Available in Hindi, English, and regional languages
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="final-cta-section text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 lg:p-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Ready to Start Your Story?
              </h3>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of young people who've found their path to better mental health with culturally sensitive, professional support.
              </p>
              <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 shadow-xl relative overflow-hidden">
                  <span className="relative z-10">Begin Your Healing Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-green to-primary-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="group border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-30">
                  <span className="flex items-center">
                    Schedule Free Consultation
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <footer className="bg-text-primary text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <span className="text-2xl font-bold">MindCare</span>
              </div>
              <p className="text-neutral-300">Mental health support for Indian youth.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {['Services', 'About', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-neutral-300 hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {['Blog', 'Self-Help', 'Crisis Help'].map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-neutral-300 hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Help</h3>
              <p className="text-neutral-300">Crisis Hotline:</p>
              <a href="tel:1860-2662-345" className="text-crisis-red font-semibold text-lg">1860-2662-345</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
