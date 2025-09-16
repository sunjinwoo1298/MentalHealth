import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'

// Modern Age Group Card Component with enhanced animations
function AgeGroupCard({ icon, title, description, ages, link, index }: {
  icon: string
  title: string
  description: string
  ages: string
  link: string
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150) // Staggered animation
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div 
      ref={cardRef}
      className={`relative bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 hover:border-blue-300 group cursor-pointer backdrop-blur-sm transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 group-hover:from-blue-500/5 group-hover:to-green-500/5 rounded-2xl transition-all duration-500"></div>
      
      {/* Floating icon with modern animation */}
      <div className="relative z-10">
        <div className="text-5xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 filter drop-shadow-lg">
          {icon}
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full inline-block">
            {ages}
          </p>
          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
            {description}
          </p>
          <a href={link} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm group-hover:translate-x-1 transition-all duration-300">
            Learn more 
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

// Modern Service Card Component with enhanced animations
function ServiceCard({ icon, title, description, index }: {
  icon: string
  title: string
  description: string
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div 
      ref={cardRef}
      className={`relative bg-gradient-to-br from-white via-green-50/20 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 border border-green-100/50 hover:border-green-300 group overflow-hidden transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="text-5xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 filter drop-shadow-lg">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
        
        {/* Hover reveal button */}
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

// Modern Treatment Card Component
function TreatmentCard({ condition, index }: { condition: string; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), index * 50)
  }, [index])

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-4 rounded-2xl border border-blue-200/50 hover:border-blue-400 hover:shadow-lg transition-all duration-500 cursor-pointer group transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-300">
        {condition}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-green-500/0 group-hover:from-blue-500/5 group-hover:to-green-500/5 rounded-2xl transition-all duration-300"></div>
    </div>
  )
}

// Modern Testimonial Card Component
function TestimonialCard({ quote, attribution, role, index }: {
  quote: string
  attribution: string
  role: string
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div 
      ref={cardRef}
      className={`relative bg-gradient-to-br from-white to-purple-50/30 p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-purple-100/50 hover:border-purple-300 transition-all duration-700 group overflow-hidden transform ${
        isVisible ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-8 opacity-0 rotate-1'
      }`}
    >
      {/* Quote decoration */}
      <div className="absolute top-4 left-4 text-6xl text-purple-200 group-hover:text-purple-300 transition-colors duration-300 font-serif">"</div>
      
      <div className="relative z-10 pt-8">
        <p className="text-gray-700 leading-relaxed mb-6 italic text-lg group-hover:text-gray-800 transition-colors duration-300">
          {quote}
        </p>
        <div className="border-t border-purple-100 pt-4">
          <p className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
            {attribution}
          </p>
          <p className="text-sm text-purple-600 mt-1">{role}</p>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
    </div>
  )
}

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  
  useEffect(() => {
    setIsLoaded(true)
    
    // Mouse tracking for parallax effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogout = async () => {
    await logout()
    // User will be redirected automatically when isAuthenticated changes
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full filter blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '10%',
            left: '10%'
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full filter blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)`,
            bottom: '10%',
            right: '10%'
          }}
        />
      </div>

      {/* Navigation */}
      <Navigation 
        isAuthenticated={isAuthenticated}
        user={user || undefined}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
        onLogout={handleLogout}
      />

      {/* Enhanced Hero Section */}
      <section className={`relative pt-20 pb-24 px-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Floating elements */}
          <div className="absolute -top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute -top-16 right-16 w-32 h-32 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full filter blur-xl animate-pulse delay-1000"></div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight">
            Mental health care for{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-pulse">
                Indian youth
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 blur-lg -z-10 animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-5xl mx-auto leading-relaxed font-light">
            Culturally sensitive mental health support designed specifically for young Indians. 
            Connect with licensed therapists who understand your background, access AI-powered tools, 
            and find 24/7 crisis support in a safe, confidential environment.
          </p>

          {/* Enhanced Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold text-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden">
              <span className="relative z-10">Get Support Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
            </button>
            <button className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-10 py-4 rounded-full font-semibold text-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <span className="relative z-10">Take Our Assessment</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            {[
              { icon: '🚨', text: '24/7 Crisis Support', color: 'green' },
              { icon: '👨‍⚕️', text: 'Licensed Therapists', color: 'blue' },
              { icon: '🔒', text: 'Complete Privacy', color: 'purple' },
              { icon: '🇮🇳', text: 'Cultural Understanding', color: 'orange' }
            ].map((item, index) => (
              <div 
                key={item.text}
                className={`flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section id="who-we-serve" className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">WHO WE SERVE</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              For every young Indian—and every stage of life. Mental health support tailored to your unique cultural background and experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AgeGroupCard 
              icon="🎓"
              title="Students (16-22)"
              ages="High School & College"
              description="Navigate academic stress, career pressure, and social challenges with culturally aware support."
              link="#students"
              index={0}
            />
            <AgeGroupCard 
              icon="💼"
              title="Young Professionals (23-28)"
              ages="Early Career"
              description="Handle workplace stress, relationship challenges, and family expectations in your career journey."
              link="#professionals"
              index={1}
            />
            <AgeGroupCard 
              icon="💑"
              title="Young Adults (25-30)"
              ages="Life Transitions"
              description="Support through marriage decisions, family planning, and major life transitions."
              link="#adults"
              index={2}
            />
            <AgeGroupCard 
              icon="👨‍👩‍👧‍👦"
              title="Families & Parents"
              ages="Supporting Loved Ones"
              description="Resources for families supporting young adults with mental health challenges."
              link="#families"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* What We Treat Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">WHAT WE TREAT</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive mental health support addressing the unique challenges faced by Indian youth
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              "Academic Stress", "Career Anxiety", "Family Pressure", "Relationship Issues", 
              "Depression", "Anxiety Disorders", "Social Anxiety", "Cultural Identity Conflicts",
              "Marriage Pressure", "Career Confusion", "Workplace Stress", "Financial Anxiety",
              "Body Image Issues", "Eating Disorders", "Self-Harm", "Substance Use",
              "LGBTQ+ Identity", "Gender Dysphoria", "Bullying", "Trauma & PTSD"
            ].map((condition, index) => (
              <TreatmentCard key={condition} condition={condition} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Results Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full filter blur-xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full filter blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center text-white relative z-10">
          <h2 className="text-5xl font-bold mb-6">OUR RESULTS</h2>
          <p className="text-2xl mb-16 opacity-90">Measurable results that young Indians feel</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  85%
                </div>
                <div className="text-blue-100 text-lg font-medium">Show improvement in 8 sessions</div>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-300 to-orange-300 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Stat 2 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-blue-100 text-lg font-medium">Young Indians helped</div>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-8 bg-gradient-to-t from-green-300 to-blue-300 rounded animate-bounce-gentle" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stat 3 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-blue-100 text-lg font-medium">Crisis Support</div>
                <div className="mt-4 flex justify-center">
                  <div className="w-12 h-12 border-4 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
            
            {/* Stat 4 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  92%
                </div>
                <div className="text-blue-100 text-lg font-medium">Feel culturally understood</div>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-300 to-pink-300 h-2 rounded-full animate-pulse" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <p className="text-xl opacity-90 mb-8">Join thousands of young Indians on their journey to better mental health</p>
            <button className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/30 hover:border-white/50 px-10 py-4 rounded-full font-bold text-lg transition-all duration-500 hover:scale-105">
              <span className="flex items-center gap-3">
                <span>View Success Stories</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-green-100/20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">HOW IT WORKS</h2>
            <p className="text-xl text-gray-600">What to expect when you start your mental health journey with us</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 items-center">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110">
                  1
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                
                {/* Connecting line */}
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-green-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Tell us about yourself
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Complete our culturally-aware assessment to help us understand your background, challenges, and goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl group-hover:shadow-green-500/25 transition-all duration-500 group-hover:scale-110">
                  2
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                
                {/* Connecting line */}
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-green-300 to-purple-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors duration-300">
                Get matched & start care
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Connect with a licensed therapist who understands Indian culture. Begin your first session within 24 hours.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-110">
                  3
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Track progress & grow
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Use our AI-powered tools, track your progress, and access 24/7 support whenever you need it.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-12 py-4 rounded-full font-bold text-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden">
              <span className="relative z-10">Start Your Journey Today</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">OUR SERVICES</h2>
            <p className="text-xl text-gray-600">Comprehensive mental health support designed for Indian youth</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon="💬"
              title="AI-Powered Chat Therapy"
              description="24/7 conversational AI that understands Indian culture, provides personalized support, and escalates to human therapists when needed."
              index={0}
            />
            <ServiceCard 
              icon="👨‍⚕️"
              title="Licensed Therapist Sessions"
              description="Video and chat sessions with licensed mental health professionals trained in Indian cultural contexts and family dynamics."
              index={1}
            />
            <ServiceCard 
              icon="🚨"
              title="Crisis Intervention"
              description="Immediate support for mental health emergencies with AI-powered risk assessment and instant human intervention when needed."
              index={2}
            />
            <ServiceCard 
              icon="📱"
              title="Digital Wellness Tools"
              description="Mood tracking, meditation guides, breathing exercises, and personalized coping strategies available anytime on your phone."
              index={3}
            />
            <ServiceCard 
              icon="👥"
              title="Peer Support Groups"
              description="Safe, moderated online communities where young Indians can share experiences and support each other anonymously."
              index={4}
            />
            <ServiceCard 
              icon="📚"
              title="Cultural Resources"
              description="Mental health education tailored to Indian families, addressing stigma, and helping navigate cultural expectations."
              index={5}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">TESTIMONIALS</h2>
            <p className="text-xl text-gray-600">Trusted by 10,000+ young Indians</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Finally found someone who understands the pressure from my family about marriage and career. The therapist gets our culture."
              attribution="Priya S."
              role="Software Engineer, Age 26"
              index={0}
            />
            <TestimonialCard 
              quote="The AI chat was there for me at 2 AM when anxiety hit. It helped me calm down and connected me with a real therapist the next day."
              attribution="Arjun M."
              role="College Student, Age 20"
              index={1}
            />
            <TestimonialCard 
              quote="I was struggling with coming out to my traditional family. The support here helped me navigate this journey with care and understanding."
              attribution="Anonymous"
              role="Young Professional, Age 24"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">WHY MINDCARE</h2>
            <p className="text-xl text-gray-600">What makes us different for Indian youth mental health</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🇮🇳 Cultural Understanding</h3>
              <p className="text-gray-600">Therapists trained in Indian family dynamics, cultural expectations, and generational differences.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🤖 AI-Powered Support</h3>
              <p className="text-gray-600">Advanced AI that provides immediate support and intelligently escalates to human care when needed.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🔒 Complete Privacy</h3>
              <p className="text-gray-600">End-to-end encryption and anonymous options to protect your privacy from family and social pressures.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚡ Immediate Access</h3>
              <p className="text-gray-600">No waiting lists. Get support when you need it, day or night, with instant AI and 24-hour human matching.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">💰 Affordable Care</h3>
              <p className="text-gray-600">Sliding scale pricing and insurance acceptance to make mental health care accessible to all young Indians.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Progress Tracking</h3>
              <p className="text-gray-600">Data-driven insights into your mental health journey with transparent progress reports and goal tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-12 px-4 bg-red-50 border-t-4 border-red-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">🚨 Need Immediate Help?</h2>
          <p className="text-red-700 mb-6">If you're in crisis or having thoughts of self-harm, reach out immediately:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300">
              Chat Now - Crisis Support
            </button>
            <div className="text-red-800">
              <p className="font-semibold">Crisis Helpline: <span className="text-2xl">1860-2662-345</span></p>
              <p className="text-sm">Available 24/7 for immediate support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <span className="text-2xl font-bold">MindCare</span>
              </div>
              <p className="text-gray-400 mb-4">
                Mental health support designed specifically for Indian youth, with cultural understanding and 24/7 accessibility.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">📱</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">📧</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">🔗</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Youth</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Students (16-22)</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Young Professionals (23-28)</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Young Adults (25-30)</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGBTQ+ Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Chat Therapy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licensed Therapists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crisis Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Peer Groups</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mental Health Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cultural Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Family Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy & Safety</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MindCare. All rights reserved. | Privacy Policy | Terms of Service | Crisis Resources</p>
            <p className="mt-2 text-sm">Licensed mental health platform for Indian youth mental wellness</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
