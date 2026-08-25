import React, { useMemo, useState } from 'react'
import {
  BookOpen,
  Search,
  X,
  Info,
  CheckCircle2,
  ChevronDown,
  Mail,
  ArrowUp,
  Rocket,
  LayoutDashboard,
  Users,
  UsersRound,
  GraduationCap,
  CalendarDays,
  LineChart,
  UserCog,
  UserCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { useLanguage } from '../../contexts/LanguageContext'
import { guideContent, GuideSection } from './guideContent'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  LayoutDashboard,
  Users,
  UsersRound,
  GraduationCap,
  CalendarDays,
  LineChart,
  UserCog,
  UserCircle,
  Sparkles,
}

const normalize = (value: string) => value.toLowerCase()

const sectionMatchesQuery = (section: GuideSection, query: string): boolean => {
  if (!query) return true
  const haystack: string[] = [section.title, section.intro, section.tip ?? '']
  if (section.bullets) haystack.push(...section.bullets)
  if (section.steps) haystack.push(...section.steps)
  if (section.subsections) {
    section.subsections.forEach((sub) => {
      haystack.push(sub.title)
      if (sub.bullets) haystack.push(...sub.bullets)
      if (sub.steps) haystack.push(...sub.steps)
    })
  }
  return haystack.some((text) => normalize(text).includes(query))
}

const Guide: React.FC = () => {
  const { language } = useLanguage()
  const langCode = language === 'Indonesia' ? 'id' : language === 'English' ? 'en' : 'ru'
  const { ui, sections, faq } = guideContent[langCode]

  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const query = normalize(search.trim())

  const filteredSections = useMemo(
    () => sections.filter((section) => sectionMatchesQuery(section, query)),
    [sections, query]
  )

  const filteredFaq = useMemo(
    () =>
      query
        ? faq.filter((item) => normalize(item.q + ' ' + item.a).includes(query))
        : faq,
    [faq, query]
  )

  const hasResults = filteredSections.length > 0 || filteredFaq.length > 0
  const isSearching = query.length > 0

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div id="guide-top" className="transition-colors duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{ui.pageTitle}</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl">
              {ui.pageSubtitle}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={ui.clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
        {/* Table of contents */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            {ui.tocTitle}
          </p>
          <ul className="space-y-0.5">
            {sections.map((section) => {
              const Icon = iconMap[section.icon] ?? BookOpen
              const dimmed = isSearching && !filteredSections.includes(section)
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      dimmed
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </a>
                </li>
              )
            })}
            <li>
              <a
                href="#guide-faq"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{ui.faqTitle}</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Content */}
        <div className="min-w-0">
          {!hasResults && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-10 text-center">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{ui.noResults}</p>
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {ui.clearSearch}
              </button>
            </div>
          )}

          <div className="space-y-6">
            {filteredSections.map((section) => {
              const Icon = iconMap[section.icon] ?? BookOpen
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                    {section.badge && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {section.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{section.intro}</p>

                  {section.bullets && (
                    <div className="mb-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
                        {ui.featuresLabel}
                      </h3>
                      <ul className="space-y-2">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 dark:text-green-400 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.steps && (
                    <div className="mb-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
                        {ui.stepsLabel}
                      </h3>
                      <ol className="space-y-3">
                        {section.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {section.subsections && (
                    <div className="space-y-5 mb-5">
                      {section.subsections.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="pl-4 border-l-2 border-gray-100 dark:border-gray-700"
                        >
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2.5">{sub.title}</h3>
                          {sub.steps && (
                            <ol className="space-y-2.5 mb-3">
                              {sub.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                          {sub.bullets && (
                            <ul className="space-y-2">
                              {sub.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 dark:text-green-400 shrink-0" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.tip && (
                    <div className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>
                        <strong>{ui.tipLabel}:</strong> {section.tip}
                      </p>
                    </div>
                  )}
                </section>
              )
            })}
          </div>

          {/* FAQ */}
          {filteredFaq.length > 0 && (
            <section id="guide-faq" className="scroll-mt-24 mt-6">
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {ui.faqTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{ui.faqSubtitle}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden transition-colors duration-200">
                {filteredFaq.map((item, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</span>
                        <ChevronDown
                          className={clsx(
                            'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Contact footer */}
          <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/15 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{ui.contactTitle}</h3>
                <p className="text-blue-100 text-sm mt-1 max-w-md">{ui.contactDesc}</p>
              </div>
            </div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-colors shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
              {ui.backToTop}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Guide
