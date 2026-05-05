import { Link } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  FileText, 
  MessageCircle, 
  ArrowRight,
  Star
} from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Algo Feedback</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Transform Your <span className="text-blue-600">Educational Feedback</span> Workflow
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Empower your teaching with automated feedbacks, smart attendance, and effortless student management. The all-in-one platform for modern educators.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center">
              Watch Demo
            </Link>
          </div>
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Preview" 
              className="relative rounded-2xl shadow-2xl border border-gray-200 max-w-5xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Streamline your educational management with our comprehensive set of tools.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Student Management', desc: "Keep track of every student's progress with intuitive dashboards and detailed profiles." },
              { icon: BookOpen, title: 'Course Planning', desc: 'Organize your curriculum effortlessly with modular tools and lesson scheduling.' },
              { icon: Calendar, title: 'Smart Attendance', desc: 'Digital attendance tracking for seamless classroom sessions and automated reporting.' },
              { icon: MessageSquare, title: 'Automated Feedbacks', desc: 'Generate personalized feedback with one click using our smart AI-powered engine.' },
              { icon: FileText, title: 'PDF Reports', desc: 'Professional PDF generation for student records, progress reports, and parent communication.' },
              { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Send feedbacks and updates directly via WhatsApp for instant engagement.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Three simple steps to transform your classroom efficiency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Setup Your Classes', desc: 'Import students, create groups, and organize your courses in minutes.' },
              { step: '02', title: 'Track Progress', desc: 'Take attendance and record session highlights effortlessly during your lessons.' },
              { step: '03', title: 'Generate & Share', desc: 'Create professional feedbacks and share them instantly via WhatsApp or PDF.' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="text-8xl font-black text-blue-50 mb-4 select-none">{item.step}</div>
                <div className="relative -mt-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-blue-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Educators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Head of Mathematics', quote: 'Algo Feedback has reduced my weekly admin time by over 5 hours. The automated feedbacks are a lifesaver.' },
              { name: 'David Chen', role: 'Coding Instructor', quote: 'The WhatsApp integration is what sets this apart. Parents love the instant feedback on their children progress.' },
            ].map((t, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-white">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xl italic mb-8">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-lg">{t.name}</div>
                  <div className="text-blue-200">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-white mb-6 block">Algo Feedback</span>
            <p className="max-w-sm leading-relaxed mb-6">
              Empowering the next generation of educators with smart, data-driven tools for classroom management and feedback.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholder */}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="hover:text-blue-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-500 transition-colors">How it Works</a></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} Algo Feedback. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Landing
