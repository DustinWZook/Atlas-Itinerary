import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Middleware should only run on these pages
    "/signin",
    "/home",
    "/itineraryList",
    "/itineraryDetails",
  ],
}