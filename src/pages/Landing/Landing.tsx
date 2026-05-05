import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  FileText,
  MessageCircle,
  ArrowRight,
  Star,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const Landing = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-500">Algo Feedback</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-8">
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</a>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Login</Link>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <Link to="/register" className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Transform Your <span className="text-blue-600 dark:text-blue-500">Educational Feedback</span> Workflow
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Empower your teaching with automated feedbacks, smart attendance, and effortless student management. The all-in-one platform for modern educators.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-500 transition-all flex items-center justify-center">
              Watch Demo
            </Link>
          </div>

          <div className="mt-16 sm:mt-20 relative px-4">
            <div className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-5xl mx-auto aspect-[16/10] sm:aspect-auto">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2000"
                alt="Dashboard Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-32 bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Everything you need to succeed</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg sm:text-xl">
              Streamline your educational management with our comprehensive set of tools.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, title: 'Student Management', desc: "Keep track of every student's progress with intuitive dashboards and detailed profiles." },
              { icon: BookOpen, title: 'Course Planning', desc: 'Organize your curriculum effortlessly with modular tools and lesson scheduling.' },
              { icon: Calendar, title: 'Smart Attendance', desc: 'Digital attendance tracking for seamless classroom sessions and automated reporting.' },
              { icon: MessageSquare, title: 'Automated Feedbacks', desc: 'Generate personalized feedback with one click using our smart AI-powered engine.' },
              { icon: FileText, title: 'PDF Reports', desc: 'Professional PDF generation for student records, progress reports, and parent communication.' },
              { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Send feedbacks and updates directly via WhatsApp for instant engagement.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">How it Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg sm:text-xl">
              Three simple steps to transform your classroom efficiency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-20">
            {[
              { step: '01', title: 'Setup Your Classes', desc: 'Import students, create groups, and organize your courses in minutes.' },
              { step: '02', title: 'Track Progress', desc: 'Take attendance and record session highlights effortlessly during your lessons.' },
              { step: '03', title: 'Generate & Share', desc: 'Create professional feedbacks and share them instantly via WhatsApp or PDF.' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="text-9xl font-black text-blue-600/5 dark:text-blue-500/5 mb-4 select-none group-hover:text-blue-600/10 transition-colors duration-300">
                  {item.step}
                </div>
                <div className="relative -mt-20 sm:-mt-24">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32 bg-blue-600 dark:bg-blue-700 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Trusted by Educators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {[
              { name: 'Sarah Johnson', role: 'Head of Mathematics', quote: 'Algo Feedback has reduced my weekly admin time by over 5 hours. The automated feedbacks are a lifesaver.' },
              { name: 'David Chen', role: 'Coding Instructor', quote: 'The WhatsApp integration is what sets this apart. Parents love the instant feedback on their children progress.' },
            ].map((t, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 text-white hover:bg-white/15 transition-colors">
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xl sm:text-2xl italic mb-10 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xl">{t.name}</div>
                    <div className="text-blue-100">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl sm:text-3xl font-bold text-white mb-8 block">Algo Feedback</span>
            <p className="max-w-md leading-relaxed mb-10 text-lg">
              Empowering the next generation of educators with smart, data-driven tools for classroom management and feedback.
            </p>
            <div className="flex gap-6">
              {/* Social icons could go here */}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-8 text-lg">Product</h4>
            <ul className="space-y-4 text-lg">
              <li><a href="#features" className="hover:text-blue-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-500 transition-colors">How it Works</a></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-8 text-lg">Legal</h4>
            <ul className="space-y-4 text-lg">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 sm:mt-24 pt-8 border-t border-gray-800 text-center text-base">
          &copy; {new Date().getFullYear()} Algo Feedback. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Landing
