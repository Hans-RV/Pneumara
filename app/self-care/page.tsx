"use client"

import { AuthGuard } from "@/components/auth-guard"
import { BreathingExercise } from "@/components/breathing-exercise"
import { WellnessQuotes } from "@/components/wellness-quotes"
import { WellnessTips } from "@/components/wellness-tips"

export default function SelfCarePage() {
  return (
    <AuthGuard>
      <main className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background to-primary/5 py-5 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Self-Care Tools</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore guided exercises, inspirational quotes, and wellness tips to support your mental health
            </p>
          </div>

          {/* Main Tools */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BreathingExercise />
            <WellnessQuotes />
          </div>

          {/* Wellness Tips */}
          <div>
            <WellnessTips />
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
