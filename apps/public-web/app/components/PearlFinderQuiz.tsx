'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './PearlFinderQuiz.module.css'

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
      const response = await fetch('/api/pearl-finder/coupon', {
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
      className={styles.pearlFinderOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pearl-finder-title"
    >
      <div className={styles.pearlFinderModal}>
        <button type="button" className={styles.pearlFinderClose} onClick={closeQuiz} aria-label="Close pearl finder quiz">
          Close
        </button>

        {step === 'intro' && (
          <div className={styles.pearlFinderPanel}>
            <div className={styles.pearlFinderEyebrow}>Pearl Finder Quiz</div>
            <h2 id="pearl-finder-title">Find Your Perfect Pearl</h2>
            <p>
              Answer 3 quick questions and discover whether Akoya, South Sea, or Tahitian pearls match your
              everyday style best.
            </p>
            <p className={styles.pearlFinderZh}>回答 3 個小問題，找到最適合你的珍珠風格。</p>
            <div className={styles.pearlFinderActions}>
              <button type="button" className={styles.pearlFinderPrimary} onClick={() => setStep('quiz')}>
                Start Quiz
              </button>
              <button type="button" className={styles.pearlFinderSecondary} onClick={closeQuiz}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div className={styles.pearlFinderPanel}>
            <div className={styles.pearlFinderTopline}>
              <span>Question {progress} / {questions.length}</span>
              <span>{Math.round((progress / questions.length) * 100)}%</span>
            </div>
            <div className={styles.pearlFinderProgress} aria-hidden="true">
              <span style={{ width: `${(progress / questions.length) * 100}%` }} />
            </div>
            <h2 id="pearl-finder-title">{currentQuestion.question}</h2>
            <p className={styles.pearlFinderZh}>{currentQuestion.zhQuestion}</p>
            <div className={styles.pearlFinderOptions}>
              {currentQuestion.options.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  className={styles.pearlFinderOption}
                  onClick={() => handleSelectAnswer(option.match)}
                >
                  <span>{option.label}</span>
                  <small>{option.helper}</small>
                </button>
              ))}
            </div>
            <button type="button" className={styles.pearlFinderTextButton} onClick={handleBack}>
              Back
            </button>
          </div>
        )}

        {step === 'lead' && (
          <div className={styles.pearlFinderPanel}>
            <div className={styles.pearlFinderEyebrow}>Your Pearl Match</div>
            <h2 id="pearl-finder-title">{matchDetail.title}</h2>
            <p>{matchDetail.description}</p>
            <div className={styles.pearlFinderResultBox}>
              <strong>Unlock $20 off your pearl match</strong>
              <span>Leave your details and receive your one-time $20 off code by email or message.</span>
            </div>

            <form className={styles.pearlFinderForm} onSubmit={handleLeadSubmit}>
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
              {error && <div className={styles.pearlFinderError}>{error}</div>}
              <div className={`${styles.pearlFinderActions} ${styles.compact}`}>
                <button type="submit" className={styles.pearlFinderPrimary} disabled={loading}>
                  {loading ? 'Submitting...' : 'Send My $20 Off Code'}
                </button>
                <button type="button" className={styles.pearlFinderSecondary} onClick={handleBack}>
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.pearlFinderPanel}>
            <div className={styles.pearlFinderEyebrow}>Your Code Is Reserved</div>
            <h2 id="pearl-finder-title">Check your email or message us</h2>
            <p>
              Your {matchDetail.title} match and one-time $20 off code are saved. We only share the code through email
              or direct message, so it stays connected to your request.
            </p>
            <div className={styles.pearlFinderResultBox}>
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
            <div className={styles.pearlFinderActions}>
              <a className={`${styles.pearlFinderPrimary} ${styles.linkButton}`} href={matchDetail.collectionHref} onClick={closeQuiz}>
                Shop {matchDetail.title}
              </a>
              <a className={`${styles.pearlFinderSecondary} ${styles.linkButton}`} href={emailHref} onClick={closeQuiz}>
                Email Us
              </a>
              <a className={`${styles.pearlFinderSecondary} ${styles.linkButton}`} href={instagramHref} target="_blank" rel="noreferrer" onClick={closeQuiz}>
                Instagram
              </a>
              <a className={`${styles.pearlFinderSecondary} ${styles.linkButton}`} href={lineHref} target="_blank" rel="noreferrer" onClick={closeQuiz}>
                LINE
              </a>
              <button type="button" className={styles.pearlFinderSecondary} onClick={closeQuiz}>
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
