'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { colors, shadows, spacing, transitions, typography } from '../constants/design'

type PearlMatch = 'akoya' | 'south-sea' | 'tahitian'
type QuizStep = 'intro' | 'quiz' | 'lead' | 'success'

interface QuizOption {
  label: string
  helper: string
  match: PearlMatch
}

interface QuizQuestion {
  question: string
  zhQuestion: string
  options: QuizOption[]
}

const STORAGE_KEY = 'pearl33-finder'

const questions: QuizQuestion[] = [
  {
    question: 'What kind of style do you wear most often?',
    zhQuestion: '你平常最常穿搭的風格是？',
    options: [
      {
        label: 'Classic, clean, and elegant',
        helper: '經典、乾淨、簡約',
        match: 'akoya',
      },
      {
        label: 'Soft luxury, old money, and a refined glow',
        helper: '老錢風、溫柔高級、精緻有光澤',
        match: 'south-sea',
      },
      {
        label: 'Bold, modern, and distinctive',
        helper: '個性、摩登、有辨識度',
        match: 'tahitian',
      },
    ],
  },
  {
    question: 'What feeling do you want your pearls to give?',
    zhQuestion: '你希望珍珠帶給你什麼感覺？',
    options: [
      {
        label: 'Polished, graceful, and effortlessly put together',
        helper: '乾淨俐落、優雅、有精神',
        match: 'akoya',
      },
      {
        label: 'Quiet luxury with a calm, elevated presence',
        helper: '低調奢華、氣質沉穩、有份量',
        match: 'south-sea',
      },
      {
        label: 'Distinctive, artistic, and a little mysterious',
        helper: '獨特、有藝術感、帶一點神秘',
        match: 'tahitian',
      },
    ],
  },
  {
    question: 'What occasion are you shopping for?',
    zhQuestion: '你主要想在哪些場合配戴？',
    options: [
      {
        label: 'Daily elegance, work, and timeless gifting',
        helper: '日常、上班、經典送禮',
        match: 'akoya',
      },
      {
        label: 'Special occasions, bridal, or elevated looks',
        helper: '重要場合、婚禮、高級穿搭',
        match: 'south-sea',
      },
      {
        label: 'Statement styling, dinners, or unique personal pieces',
        helper: '造型感、晚宴、獨特收藏',
        match: 'tahitian',
      },
    ],
  },
]

const matchDetails: Record<PearlMatch, { title: string; description: string; collectionHref: string }> = {
  akoya: {
    title: 'Akoya Pearl',
    description:
      'You are drawn to timeless elegance, clean lines, and luminous everyday beauty. Akoya pearls are perfect for refined daily wear and classic gifts.',
    collectionHref: '/products?pearlType=akoya',
  },
  'south-sea': {
    title: 'South Sea Pearl',
    description:
      'You love soft luxury, larger pearls, and a naturally elegant glow. South Sea pearls bring a refined presence to special moments and elevated looks.',
    collectionHref: '/products?pearlType=southsea',
  },
  tahitian: {
    title: 'Tahitian Pearl',
    description:
      'You are drawn to depth, contrast, and individuality. Tahitian pearls are perfect for a modern, distinctive look with natural mystery and edge.',
    collectionHref: '/products?pearlType=tahitian',
  },
}

function getPearlMatch(answers: PearlMatch[]): PearlMatch {
  const scores = answers.reduce<Record<PearlMatch, number>>(
    (acc, answer) => {
      acc[answer] += 1
      return acc
    },
    { akoya: 0, 'south-sea': 0, tahitian: 0 }
  )

  const topScore = Math.max(scores.akoya, scores['south-sea'], scores.tahitian)
  const winners = (Object.keys(scores) as PearlMatch[]).filter((match) => scores[match] === topScore)

  if (winners.length === 1) return winners[0]
  if (winners.includes('tahitian')) return 'tahitian'
  if (winners.includes('south-sea')) return 'south-sea'
  return 'akoya'
}

export default function PearlFinderQuiz() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<QuizStep>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<PearlMatch[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [couponDelivery, setCouponDelivery] = useState<'email_sent' | 'message_required'>('message_required')

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return
      const timer = window.setTimeout(() => setOpen(true), 850)
      return () => window.clearTimeout(timer)
    } catch {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const match = useMemo(() => getPearlMatch(answers), [answers])
  const matchDetail = matchDetails[match]
  const currentQuestion = questions[questionIndex]
  const progress = Math.min(questionIndex + 1, questions.length)

  const markSeen = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } catch {
      // localStorage can be unavailable in strict browser settings.
    }
  }

  const closeQuiz = () => {
    markSeen()
    setOpen(false)
  }

  const handleSelectAnswer = (answer: PearlMatch) => {
    const nextAnswers = [...answers, answer]
    setAnswers(nextAnswers)

    if (questionIndex >= questions.length - 1) {
      setStep('lead')
      return
    }

    setQuestionIndex((current) => current + 1)
  }

  const handleBack = () => {
    if (step === 'lead') {
      setStep('quiz')
      setQuestionIndex(questions.length - 1)
      setAnswers((current) => current.slice(0, -1))
      return
    }

    if (questionIndex === 0) {
      setStep('intro')
      return
    }

    setQuestionIndex((current) => current - 1)
    setAnswers((current) => current.slice(0, -1))
  }

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          inquiryType: 'pearl_finder_quiz',
          subject: `Pearl Finder Quiz - ${matchDetail.title}`,
          quizResult: matchDetail.title,
          quizAnswers: answers,
          message: [
            `Pearl Finder Quiz Result: ${matchDetail.title}`,
            'Coupon requested: Pearl Finder $20 off one-time code',
            `Phone: ${phone || 'Not provided'}`,
            `Answers: ${answers.join(', ')}`,
          ].join('\n'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data?.code === 'duplicate_coupon_claim') {
          throw new Error('This email or phone number has already requested this offer.')
        }
        throw new Error(data?.error || 'Unable to submit quiz lead.')
      }

      setCouponDelivery(data?.couponDelivery === 'email_sent' ? 'email_sent' : 'message_required')
      markSeen()
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your details right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactSubject = encodeURIComponent(`Pearl Finder Code Request - ${matchDetail.title}`)
  const contactBody = encodeURIComponent(
    [
      'Hi 33 Pearl Atelier,',
      '',
      `I completed the Pearl Finder Quiz and my match is ${matchDetail.title}.`,
      'Could you please send me my $20 off code?',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
    ].join('\n')
  )
  const emailHref = `mailto:hello@33pearlatelier.com?subject=${contactSubject}&body=${contactBody}`
  const instagramHref = 'https://www.instagram.com/33_pearl_atelier/'
  const lineHref = 'https://line.me/R/ti/p/~sandyhsiue0303'

  if (!open) return null

  return (
    <div
      className="pearlFinderOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pearl-finder-title"
    >
      <div className="pearlFinderModal">
        <button type="button" className="pearlFinderClose" onClick={closeQuiz} aria-label="Close pearl finder quiz">
          Close
        </button>

        {step === 'intro' && (
          <div className="pearlFinderPanel">
            <div className="pearlFinderEyebrow">Pearl Finder Quiz</div>
            <h2 id="pearl-finder-title">Find Your Perfect Pearl</h2>
            <p>
              Answer 3 quick questions and discover whether Akoya, South Sea, or Tahitian pearls match your
              everyday style best.
            </p>
            <p className="pearlFinderZh">回答 3 個小問題，找到最適合你的珍珠風格。</p>
            <div className="pearlFinderActions">
              <button type="button" className="pearlFinderPrimary" onClick={() => setStep('quiz')}>
                Start Quiz
              </button>
              <button type="button" className="pearlFinderSecondary" onClick={closeQuiz}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div className="pearlFinderPanel">
            <div className="pearlFinderTopline">
              <span>Question {progress} / {questions.length}</span>
              <span>{Math.round((progress / questions.length) * 100)}%</span>
            </div>
            <div className="pearlFinderProgress" aria-hidden="true">
              <span style={{ width: `${(progress / questions.length) * 100}%` }} />
            </div>
            <h2 id="pearl-finder-title">{currentQuestion.question}</h2>
            <p className="pearlFinderZh">{currentQuestion.zhQuestion}</p>
            <div className="pearlFinderOptions">
              {currentQuestion.options.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  className="pearlFinderOption"
                  onClick={() => handleSelectAnswer(option.match)}
                >
                  <span>{option.label}</span>
                  <small>{option.helper}</small>
                </button>
              ))}
            </div>
            <button type="button" className="pearlFinderTextButton" onClick={handleBack}>
              Back
            </button>
          </div>
        )}

        {step === 'lead' && (
          <div className="pearlFinderPanel">
            <div className="pearlFinderEyebrow">Your Pearl Match</div>
            <h2 id="pearl-finder-title">{matchDetail.title}</h2>
            <p>{matchDetail.description}</p>
            <div className="pearlFinderResultBox">
              <strong>Unlock $20 off your pearl match</strong>
              <span>Leave your details and receive your one-time $20 off code by email or message.</span>
            </div>

            <form className="pearlFinderForm" onSubmit={handleLeadSubmit}>
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label>
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label>
                Phone Number
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>
              {error && <div className="pearlFinderError">{error}</div>}
              <div className="pearlFinderActions compact">
                <button type="submit" className="pearlFinderPrimary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Send My $20 Off Code'}
                </button>
                <button type="button" className="pearlFinderSecondary" onClick={handleBack}>
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="pearlFinderPanel">
            <div className="pearlFinderEyebrow">Your Code Is Reserved</div>
            <h2 id="pearl-finder-title">Check your email or message us</h2>
            <p>
              Your {matchDetail.title} match and one-time $20 off code are saved. We only share the code through email
              or direct message, so it stays connected to your request.
            </p>
            <div className="pearlFinderResultBox">
              <strong>
                {couponDelivery === 'email_sent'
                  ? 'We sent the code to your email.'
                  : 'Message us and we will send your code.'}
              </strong>
              <span>
                {couponDelivery === 'email_sent'
                  ? 'Please check your inbox, then shop your recommended pearl match.'
                  : 'Use one of the contact buttons below to request your code.'}
              </span>
            </div>
            <div className="pearlFinderActions">
              <a className="pearlFinderPrimary linkButton" href={matchDetail.collectionHref} onClick={closeQuiz}>
                Shop {matchDetail.title}
              </a>
              <a className="pearlFinderSecondary linkButton" href={emailHref} onClick={closeQuiz}>
                Email Us
              </a>
              <a className="pearlFinderSecondary linkButton" href={instagramHref} target="_blank" rel="noreferrer" onClick={closeQuiz}>
                Instagram
              </a>
              <a className="pearlFinderSecondary linkButton" href={lineHref} target="_blank" rel="noreferrer" onClick={closeQuiz}>
                LINE
              </a>
              <button type="button" className="pearlFinderSecondary" onClick={closeQuiz}>
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pearlFinderOverlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${spacing.md};
          background: rgba(24, 24, 24, 0.42);
        }

        .pearlFinderModal {
          position: relative;
          width: min(94vw, 520px);
          max-height: min(760px, calc(100vh - 2rem));
          overflow-y: auto;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 246, 240, 0.98)),
            ${colors.white};
          border: 1px solid rgba(201, 169, 97, 0.28);
          border-radius: 8px;
          box-shadow: 0 22px 70px rgba(20, 20, 20, 0.24);
        }

        .pearlFinderPanel {
          padding: clamp(${spacing.lg}, 5vw, ${spacing.xl});
        }

        .pearlFinderClose {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          border: 1px solid rgba(44, 44, 44, 0.14);
          background: rgba(255, 255, 255, 0.86);
          color: ${colors.textSecondary};
          padding: 7px 10px;
          border-radius: 6px;
          font-size: ${typography.fontSize.xs};
          cursor: pointer;
          transition: ${transitions.fast};
        }

        .pearlFinderClose:hover {
          border-color: rgba(44, 44, 44, 0.32);
          color: ${colors.darkGray};
        }

        .pearlFinderEyebrow,
        .pearlFinderTopline {
          color: ${colors.gold};
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.semibold};
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .pearlFinderTopline {
          display: flex;
          justify-content: space-between;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.xs};
        }

        .pearlFinderProgress {
          height: 4px;
          overflow: hidden;
          background: rgba(44, 44, 44, 0.08);
          border-radius: 999px;
          margin-bottom: ${spacing.lg};
        }

        .pearlFinderProgress span {
          display: block;
          height: 100%;
          background: ${colors.gold};
          border-radius: inherit;
          transition: width ${transitions.normal};
        }

        h2 {
          margin: ${spacing.xs} 0 ${spacing.sm};
          color: ${colors.darkGray};
          font-size: clamp(${typography.fontSize['2xl']}, 4vw, ${typography.fontSize['4xl']});
          line-height: 1.14;
          letter-spacing: 0;
        }

        p {
          color: ${colors.textSecondary};
          font-size: ${typography.fontSize.base};
          line-height: 1.7;
        }

        .pearlFinderZh {
          margin-top: ${spacing.xs};
          color: ${colors.textLight};
          font-size: ${typography.fontSize.sm};
        }

        .pearlFinderActions {
          display: flex;
          gap: ${spacing.xs};
          flex-wrap: wrap;
          margin-top: ${spacing.lg};
        }

        .pearlFinderActions.compact {
          margin-top: ${spacing.sm};
        }

        .pearlFinderPrimary,
        .pearlFinderSecondary,
        .pearlFinderOption,
        .pearlFinderTextButton {
          border-radius: 6px;
          cursor: pointer;
          transition: ${transitions.fast};
        }

        .pearlFinderPrimary,
        .pearlFinderSecondary {
          min-height: 44px;
          padding: 11px 18px;
          border: 1px solid ${colors.darkGray};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.semibold};
        }

        .pearlFinderPrimary {
          background: ${colors.darkGray};
          color: ${colors.white};
          box-shadow: ${shadows.soft};
        }

        .pearlFinderPrimary:hover,
        .pearlFinderPrimary:focus-visible {
          background: ${colors.gold};
          border-color: ${colors.gold};
        }

        .pearlFinderPrimary:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .pearlFinderSecondary {
          background: rgba(255, 255, 255, 0.72);
          color: ${colors.darkGray};
        }

        .pearlFinderSecondary:hover,
        .pearlFinderSecondary:focus-visible {
          border-color: ${colors.gold};
          color: ${colors.gold};
        }

        .linkButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .pearlFinderOptions {
          display: grid;
          gap: ${spacing.xs};
          margin-top: ${spacing.lg};
        }

        .pearlFinderOption {
          width: 100%;
          border: 1px solid rgba(44, 44, 44, 0.14);
          background: rgba(255, 255, 255, 0.72);
          padding: ${spacing.sm};
          text-align: left;
        }

        .pearlFinderOption:hover,
        .pearlFinderOption:focus-visible {
          border-color: rgba(201, 169, 97, 0.72);
          background: ${colors.white};
          box-shadow: ${shadows.soft};
        }

        .pearlFinderOption span,
        .pearlFinderOption small {
          display: block;
        }

        .pearlFinderOption span {
          color: ${colors.darkGray};
          font-size: ${typography.fontSize.base};
          line-height: 1.35;
        }

        .pearlFinderOption small {
          margin-top: 4px;
          color: ${colors.textLight};
          font-size: ${typography.fontSize.sm};
          line-height: 1.45;
        }

        .pearlFinderTextButton {
          margin-top: ${spacing.sm};
          border: 0;
          background: transparent;
          color: ${colors.textSecondary};
          font-size: ${typography.fontSize.sm};
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .pearlFinderResultBox {
          display: grid;
          gap: 4px;
          margin: ${spacing.md} 0;
          padding: ${spacing.sm};
          border: 1px solid rgba(201, 169, 97, 0.34);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.66);
          color: ${colors.darkGray};
        }

        .pearlFinderResultBox span {
          color: ${colors.textSecondary};
          font-size: ${typography.fontSize.sm};
        }

        .pearlFinderForm {
          display: grid;
          gap: ${spacing.sm};
        }

        .pearlFinderForm label {
          display: grid;
          gap: 6px;
          color: ${colors.darkGray};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.semibold};
        }

        .pearlFinderForm input {
          width: 100%;
          border: 1px solid rgba(44, 44, 44, 0.18);
          border-radius: 6px;
          background: ${colors.white};
          color: ${colors.darkGray};
          padding: 11px 12px;
          outline: none;
          transition: ${transitions.fast};
        }

        .pearlFinderForm input:focus {
          border-color: ${colors.gold};
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.14);
        }

        .pearlFinderError {
          color: #b42318;
          font-size: ${typography.fontSize.sm};
        }

        @media (max-width: 640px) {
          .pearlFinderOverlay {
            align-items: stretch;
            padding: 0;
          }

          .pearlFinderModal {
            width: 100vw;
            max-height: none;
            min-height: 100vh;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
          }

          .pearlFinderPanel {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: ${spacing.xl} ${spacing.md};
          }

          .pearlFinderActions,
          .pearlFinderActions.compact {
            display: grid;
          }
        }
      `}</style>
    </div>
  )
}
