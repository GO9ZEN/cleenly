// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value),
//           );
//           supabaseResponse = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options),
//           );
//         },
//       },
//     },
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const isAuthPage =
//     request.nextUrl.pathname.startsWith("/login") ||
//     request.nextUrl.pathname.startsWith("/register");

//   const isCustomerPage = request.nextUrl.pathname.startsWith("/customer");
//   const isCleanerPage = request.nextUrl.pathname.startsWith("/cleaner");
//   const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
//   const isProtected = isCustomerPage || isCleanerPage || isAdminPage;

//   // Not logged in trying to access protected page
//   if (!user && isProtected) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // Logged in — get role from DB and redirect
//   if (user && isAuthPage) {
//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     const role = profile?.role;

//     if (role === "customer") {
//       return NextResponse.redirect(new URL("/customer/dashboard", request.url));
//     }
//     if (role === "cleaner") {
//       return NextResponse.redirect(new URL("/cleaner/dashboard", request.url));
//     }
//     if (role === "admin") {
//       return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//     }
//   }

//   // Wrong dashboard for role — redirect to correct one
//   if (user && isProtected) {
//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     const role = profile?.role;

//     if (role === "customer" && !isCustomerPage) {
//       return NextResponse.redirect(new URL("/customer/dashboard", request.url));
//     }
//     if (role === "cleaner" && !isCleanerPage) {
//       return NextResponse.redirect(new URL("/cleaner/dashboard", request.url));
//     }
//     if (role === "admin" && !isAdminPage) {
//       return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//     }
//   }

//   return supabaseResponse;
// }

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
