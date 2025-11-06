import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rutas protegidas
  const protectedRoutes = [
    '/home/inquilino',
    '/home/propietario',
  ];

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Obtener token del cookie (más seguro que localStorage en el server)
    const token = request.cookies.get('access_token')?.value;
    const userCookie = request.cookies.get('user')?.value;

    // Si no hay token o usuario, redirigir a login
    if (!token || !userCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Validar que el rol coincida con la ruta
    try {
      const user = JSON.parse(userCookie);
      
      if (pathname.startsWith('/home/inquilino') && user.role !== 'inquilino') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      
      if (pathname.startsWith('/home/propietario') && user.role !== 'propietario') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    // Excluir rutas públicas
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ],
};
