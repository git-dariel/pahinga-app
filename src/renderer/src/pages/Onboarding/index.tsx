import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ChevronLeft, HeartPulse } from 'lucide-react'
import { BREAK_REMINDER_OPTIONS, WATER_REMINDER_OPTIONS } from '@shared/reminderIntervals'
import type { WorkStyle } from '@shared/types'
import { WORK_STYLE_OPTIONS } from '@shared/workStyleLabels'
import type { OnboardingOutletContext } from '@renderer/components/OnboardingGate'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import {
  isValidWorkStyle,
  validateOnboardingReminders
} from '@renderer/lib/onboardingValidation'
import { pahingaApi } from '@renderer/services/pahingaApi'

const STEP_COUNT = 4

function StepToggle({
  label,
  description,
  pressed,
  onPressedChange
}: {
  label: string
  description: string
  pressed: boolean
  onPressedChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        aria-label={label}
        onClick={() => onPressedChange(!pressed)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          pressed ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            pressed ? 'right-1' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function Onboarding(): React.JSX.Element {
  const navigate = useNavigate()
  const { markOnboardingComplete } = useOutletContext<OnboardingOutletContext>()
  const { showToast } = useToast()

  const [step, setStep] = useState(0)
  const [workStyle, setWorkStyle] = useState<WorkStyle>('other')
  const [breakInterval, setBreakInterval] = useState<number>(25)
  const [waterInterval, setWaterInterval] = useState<number>(60)
  const [stretchOn, setStretchOn] = useState(true)
  const [eyeRestOn, setEyeRestOn] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void pahingaApi.getSettings().then((s) => {
      setWorkStyle(s.workStyle)
      setBreakInterval(s.breakInterval)
      setWaterInterval(s.waterInterval)
      setStretchOn(s.stretchRemindersEnabled)
      setEyeRestOn(s.eyeRestRemindersEnabled)
    })
  }, [])

  function goNext(): void {
    if (step === 1) {
      if (!isValidWorkStyle(workStyle)) {
        showToast('Please choose how you usually work.', 'error')
        return
      }
    }
    if (step === 2) {
      const v = validateOnboardingReminders({ breakInterval, waterInterval })
      if (!v.ok) {
        showToast(v.message, 'error')
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1))
  }

  function goBack(): void {
    setStep((s) => Math.max(s - 1, 0))
    setSubmitError(null)
  }

  async function completeOnboarding(): Promise<void> {
    if (!isValidWorkStyle(workStyle)) {
      showToast('Please choose how you usually work.', 'error')
      setStep(1)
      return
    }
    const v = validateOnboardingReminders({ breakInterval, waterInterval })
    if (!v.ok) {
      showToast(v.message, 'error')
      setStep(2)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await pahingaApi.updateSettings({
        workStyle,
        breakInterval,
        waterInterval,
        stretchRemindersEnabled: stretchOn,
        eyeRestRemindersEnabled: eyeRestOn,
        onboardingComplete: true
      })
      markOnboardingComplete()
      navigate('/dashboard', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.'
      setSubmitError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <p className="text-center text-xs font-medium text-muted mb-6">
            Step {step + 1} of {STEP_COUNT}
          </p>

          <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-10">
            {step === 0 ? (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <HeartPulse className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Take better care of yourself while working
                </h1>
                <p className="mt-3 text-sm text-muted leading-relaxed max-w-md mx-auto">
                  Pahinga helps you take breaks, drink water, and stay focused during long computer
                  sessions.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Get Started
                </button>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <h2 className="text-xl font-bold text-foreground">How do you usually work?</h2>
                <p className="mt-1 text-sm text-muted">This helps us tailor suggestions later.</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORK_STYLE_OPTIONS.map(({ value, label }) => {
                    const selected = workStyle === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setWorkStyle(value)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          selected
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border text-foreground hover:bg-background'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-xl font-bold text-foreground">Reminder preferences</h2>
                <p className="mt-1 text-sm text-muted">You can change these anytime in Settings.</p>

                <div className="mt-6 space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Break reminder interval</p>
                      <p className="text-xs text-muted">Nudge to stand and rest</p>
                    </div>
                    <select
                      value={breakInterval}
                      onChange={(e) => setBreakInterval(Number(e.target.value))}
                      className="text-sm border border-border rounded-lg px-3 py-2 text-foreground bg-background min-w-36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {BREAK_REMINDER_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Water reminder interval</p>
                      <p className="text-xs text-muted">Stay hydrated</p>
                    </div>
                    <select
                      value={waterInterval}
                      onChange={(e) => setWaterInterval(Number(e.target.value))}
                      className="text-sm border border-border rounded-lg px-3 py-2 text-foreground bg-background min-w-36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {WATER_REMINDER_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-border space-y-4">
                    <StepToggle
                      label="Stretch reminders"
                      description="Gentle stretch prompts with breaks"
                      pressed={stretchOn}
                      onPressedChange={setStretchOn}
                    />
                    <StepToggle
                      label="Eye rest reminders"
                      description="Rest your eyes on a steady rhythm"
                      pressed={eyeRestOn}
                      onPressedChange={setEyeRestOn}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">You&apos;re all set.</h2>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Pahinga will now help you build healthier work habits.
                </p>
                {submitError ? (
                  <p className="mt-4 text-sm text-danger" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void completeOnboarding()}
                  className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {submitting ? 'Saving…' : 'Go to Dashboard'}
                </button>
              </div>
            ) : null}

            {step > 0 && step < 3 ? (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
