"use client";

import { Mail, Phone, MapPin, Clock, Loader2, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputEnhanced } from "@/components/ui/input-enhanced";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/navbar";
import { contactSchema, type ContactFormData } from "@/lib/schemas";

// ======================================================
// NOTA: Se eliminaron todas las animaciones de F-M y CSS.
// El diseño es puramente estático para máxima ligereza.
// ======================================================

export default function ContactoPage() {
  const [sending, setSending] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormData) {
    setSending(true);
    // TODO: mandalo a tu endpoint /action o API route
    console.log('Contact form data:', data);
    setTimeout(() => {
      setSending(false);
      reset();
    }, 900);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      
      {/* Fondo decorativo estático (Solo color y desenfoque ligero) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-rose-300/15 via-orange-300/10 to-amber-200/10 blur-3xl" />
      </div>

      <Navbar />

      {/* ===== HEADER / HERO (Compacto y elegante) ===== */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
              ¿Hablamos?
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                {" "}Contáctanos
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Estamos aquí para ayudarte. Rellena el formulario o usa nuestros canales directos.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO PRINCIPAL: CONTACTO Y MAPA (Estructura moderna) ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            
            {/* COLUMNA 1-3: FORMULARIO (Se le da más peso a la acción principal) */}
            <div className="lg:col-span-3">
                <Card className="h-full border-orange-200/50 ring-1 ring-orange-100/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 md:p-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Envíanos un Mensaje
                    </h2>
                    
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-700 font-medium">Nombre completo</Label>
                          <InputEnhanced
                            id="name"
                            {...register("name")}
                            placeholder="Tu nombre"
                            className="rounded-xl h-12 bg-white/70 border-orange-100 ring-1 ring-orange-50 focus-visible:ring-orange-300 transition-all"
                            error={errors.name?.message}
                            disabled={sending}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                          <InputEnhanced
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="tu@email.com"
                            className="rounded-xl h-12 bg-white/70 border-orange-100 ring-1 ring-orange-50 focus-visible:ring-orange-300 transition-all"
                            error={errors.email?.message}
                            disabled={sending}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-gray-700 font-medium">Asunto</Label>
                        <InputEnhanced
                          id="subject"
                          {...register("subject")}
                          placeholder="Consulta sobre…"
                          className="rounded-xl h-12 bg-white/70 border-orange-100 ring-1 ring-orange-50 focus-visible:ring-orange-300 transition-all"
                          error={errors.subject?.message}
                          disabled={sending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700 font-medium">Mensaje</Label>
                        <Textarea
                          id="message"
                          {...register("message")}
                          placeholder="Escribe tu mensaje aquí…"
                          className="min-h-[160px] rounded-xl bg-white/70 border-orange-100 ring-1 ring-orange-50 focus-visible:ring-orange-300 transition-all"
                          disabled={sending}
                        />
                        {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={sending}
                          className="group w-full h-14 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 px-7 text-white font-semibold text-lg shadow-xl transition-all hover:from-orange-700 hover:to-amber-600 hover:-translate-y-0.5 hover:shadow-2xl"
                        >
                          {sending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando…
                            </>
                          ) : (
                            <>
                              Enviar mensaje <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                </Card>
            </div>

            {/* COLUMNA 4-5: INFO + MAPA (Compacto y vertical) */}
            <div className="lg:col-span-2 flex flex-col gap-10">
                {/* Info de Contacto */}
                <Card className="border-orange-200/50 ring-1 ring-orange-100/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 md:p-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Datos de Contacto
                    </h2>
                    
                    <ul className="space-y-6">
                      {[
                        { Icon: Mail, title: "Email", value: "contacto@rentmatch.com", href: "mailto:contacto@rentmatch.com" },
                        { Icon: Phone, title: "Teléfono", value: "+54 11 5555-5555", href: "tel:+541155555555" },
                        { Icon: MapPin, title: "Dirección", value: "Av. Corrientes 1234, CABA, Argentina" },
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-4 border-b border-orange-50 pb-5 last:border-b-0 last:pb-0">
                          <span className="flex-shrink-0 mt-1 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md ring-2 ring-orange-200">
                            <item.Icon className="h-6 w-6" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{item.title}</p>
                            <a
                              href={item.href || "#"}
                              className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                            >
                              {item.value}
                            </a>
                          </div>
                        </li>
                      ))}

                      {/* Horarios de Atención */}
                      <li className="flex items-start gap-4 pt-4">
                        <span className="flex-shrink-0 mt-1 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md ring-2 ring-orange-200">
                          <Clock className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Horario de atención</p>
                          <div className="text-sm text-gray-700 mt-1 space-y-0.5">
                            <p className="flex justify-between items-center max-w-[200px]"><span>Lun a Vie</span> <span className="font-semibold">9:00 – 18:00</span></p>
                            <p className="flex justify-between items-center max-w-[200px]"><span>Sábados</span> <span className="font-semibold">10:00 – 14:00</span></p>
                            <p className="text-xs text-red-500 pt-1">Dom y Feriados: Cerrado</p>
                          </div>
                        </div>
                      </li>
                    </ul>
                </Card>

                {/* Mapa */}
                <div id="map" className="w-full">
                  <div className="h-72 w-full bg-gray-200 rounded-3xl overflow-hidden shadow-xl ring-1 ring-orange-200/50">
                    {/* Placeholder de Mapa */}
                    <iframe 
                      title="Ubicación de RentMatch"
                      src="https://maps.google.com/maps?q=Av.%20Corrientes%201234,%20CABA,%20Argentina&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="opacity-70"
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQs (Estilizado) ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Respuestas Rápidas
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Explora nuestra sección de preguntas frecuentes (FAQs).
            </p>
          </div>

          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                { 
                  q: "¿Cómo puedo registrarme en RentMatch?", 
                  a: "El proceso es rápido y gratuito para inquilinos. Puedes registrarte desde la página principal en menos de 5 minutos y empezar a crear tu perfil de inmediato." 
                },
                { 
                  q: "¿Los contratos son legalmente válidos?", 
                  a: "Sí. Todos nuestros contratos digitales están diseñados para cumplir con el Código Civil y Comercial de la Nación Argentina, ofreciendo plena validez legal a ambas partes." 
                },
                { 
                  q: "¿Cómo funciona la protección del depósito?", 
                  a: "El depósito se administra en una cuenta especial de garantía y se devuelve automáticamente al finalizar el contrato, con total transparencia sobre posibles descuentos por daños comprobados." 
                },
                { 
                  q: "¿Puedo cancelar mi cuenta en cualquier momento?", 
                  a: "Sí. Tienes total flexibilidad. Puedes cancelar tu cuenta en cualquier momento desde tu panel de usuario sin penalizaciones." 
                },
              ].map((faq, index) => (
                <AccordionItem 
                  key={index}
                  value={`faq-${index}`} 
                  className="rounded-2xl border border-orange-200/50 bg-white/95 px-6 ring-1 ring-orange-100/60 shadow-md transition-all hover:shadow-lg data-[state=open]:ring-orange-300"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline text-gray-800 data-[state=open]:text-orange-700">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-gray-700">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">RentMatch</span>
            </div>
          <p className="text-gray-400 mt-2">
            © {new Date().getFullYear()} RentMatch. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}