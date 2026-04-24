"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Loader2 } from "lucide-react"

function LoginContent() {
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(true)
  const [googleInitError, setGoogleInitError] = useState("")
  const [buttonRendered, setButtonRendered] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptFailed, setScriptFailed] = useState(false)
  const [initAttempt, setInitAttempt] = useState(0)
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signInWithGoogle, signInAsGuest } = useAuth()
  
  // Get return URL from query params, default to /chat
  const returnUrl = searchParams.get("returnUrl") || "/chat"

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(returnUrl)
    }
  }, [user, router, returnUrl])

  const initializeGoogleButton = useCallback(async () => {
    if (hasInitializedRef.current || user || !scriptLoaded || scriptFailed) return

    hasInitializedRef.current = true
    setGoogleLoading(true)
    setGoogleInitError("")

    // @ts-expect-error - google is loaded from script
    if (!window.google?.accounts?.id) {
      hasInitializedRef.current = false
      setGoogleLoading(false)
      setGoogleInitError("Google Sign-In is still loading. Please try again.")
      return
    }

    try {
      await signInWithGoogle()
      setButtonRendered(true)
    } catch (err) {
      console.error("Failed to initialize Google Sign-In:", err)
      setGoogleInitError("Could not load Google Sign-In. Please try again.")
      hasInitializedRef.current = false
    } finally {
      setGoogleLoading(false)
    }
  }, [scriptFailed, scriptLoaded, signInWithGoogle, user])

  useEffect(() => {
    initializeGoogleButton()
  }, [initializeGoogleButton, initAttempt])

  const handleGuestSignIn = () => {
    signInAsGuest()
    router.push(returnUrl)
  }

  const handleScriptLoad = () => {
    setScriptLoaded(true)
    setScriptFailed(false)
  }

  useEffect(() => {
    // In client-side navigation, the Google script may already be loaded
    // and onLoad will not fire again for this page instance.
    // @ts-expect-error - google is loaded from script
    if (window.google?.accounts?.id) {
      setScriptLoaded(true)
      setScriptFailed(false)
    }
  }, [])

  const handleScriptError = () => {
    setScriptFailed(true)
    setGoogleLoading(false)
    setGoogleInitError("Could not load Google services. Check your connection and retry.")
  }

  const handleRetryGoogle = () => {
    hasInitializedRef.current = false
    setButtonRendered(false)
    setGoogleInitError("")
    setGoogleLoading(true)
    setInitAttempt((attempt) => attempt + 1)
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl text-center text-primary">Welcome to Pneumara</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Choose how you'd like to continue your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-5 sm:pb-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Container with fixed height to prevent layout shift */}
          <div className="w-full min-h-[44px] flex items-center justify-center relative">
            {/* Loading placeholder */}
            {googleLoading && !buttonRendered && !googleInitError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="outline"
                  className="w-full max-w-[300px] h-[44px] gap-3 cursor-wait animate-pulse"
                  disabled
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading Google Sign-In...</span>
                </Button>
              </div>
            )}
            {/* Google button container */}
            <div 
              ref={buttonContainerRef}
              id="google-signin-button" 
              className={`w-full max-w-[400px] flex justify-center transition-opacity duration-300 ${
                buttonRendered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ minHeight: '44px' }}
            />
          </div>

          {googleInitError && (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">{googleInitError}</p>
              <Button onClick={handleRetryGoogle} variant="outline" className="w-full h-11 bg-transparent">
                Retry Google Sign-In
              </Button>
            </div>
          )}
          
          {(error && error.includes("Google")) || googleInitError ? (
            <p className="text-xs text-center text-muted-foreground">
              Having trouble? Try the Guest login below
            </p>
          ) : null}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Guest Sign In */}
          <Button
            onClick={handleGuestSignIn}
            variant="secondary"
            className="w-full gap-3 h-12"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Guest sessions are temporary and your chat history won't be saved.
            Sign in with Google for a personalized experience.
          </p>

          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/" className="text-center block text-sm text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
