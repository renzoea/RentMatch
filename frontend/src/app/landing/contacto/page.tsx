"use client";

import Navbar from "@/components/navbar";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";

export default function ContactoPage() {
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    // TODO: mandalo a tu endpoint /action o API route
    // const form = new FormData(e.currentTarget);
    // await fetch("/api/contact", { method: "POST", body: form });
    setTimeout(() => setSending(false), 900);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-orange-500">Contacto</span>
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              ¿Tienes preguntas? Estamos aquí para ayudarte. Contáctanos y te
              responderemos lo antes posible.
            </p>
          </div>

          {/* Grid: Info + Form */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Col izquierda: info */}
            <Card className="border-gray-200">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ponte en contacto
                </h2>
                <p className="mt-2 text-gray-600">
                  Completa el formulario y nuestro equipo te responderá a la
                  brevedad. También puedes contactarnos directamente a través de
                  los siguientes medios:
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                      <Mail className="h-5 w-5 text-orange-500" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a
                        href="mailto:contacto@rentmatch.com"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        contacto@rentmatch.com
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                      <Phone className="h-5 w-5 text-orange-500" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Teléfono
                      </p>
                      <a
                        href="tel:+541155555555"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        +54 11 5555-5555
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dirección
                      </p>
                      <p className="text-gray-700">
                        Av. Corrientes 1234, CABA, Argentina
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Horario de atención
                      </p>
                      <div className="text-gray-700">
                        <div className="flex items-center justify-between max-w-xs">
                          <span>Lunes a Viernes</span>
                          <span>9:00 – 18:00</span>
                        </div>
                        <div className="flex items-center justify-between max-w-xs">
                          <span>Sábados</span>
                          <span>10:00 – 14:00</span>
                        </div>
                        <div className="flex items-center justify-between max-w-xs">
                          <span>Domingos y feriados</span>
                          <span>Cerrado</span>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Col derecha: formulario */}
            <Card className="border-gray-200">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Formulario de contacto
                </h2>
                <p className="mt-2 text-gray-600">
                  Completa el formulario y te responderemos a la brevedad
                  posible.
                </p>

                <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" name="name" placeholder="Tu nombre" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input id="phone" name="phone" placeholder="+54 11 xxx-xxxx" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" name="subject" placeholder="Asunto de tu mensaje" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Escribe tu mensaje aquí…"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {sending ? "Enviando…" : "Enviar mensaje"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
            Preguntas frecuentes
          </h2>

          <div className="mt-8 sm:mt-10">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="faq-1" className="border rounded-xl px-4">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                  ¿Cómo puedo registrarme en RentMatch?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Puedes registrarte desde la página principal. El proceso toma
                  menos de 5 minutos y es gratuito para inquilinos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border rounded-xl px-4">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                  ¿Los contratos son legalmente válidos?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Sí. Nuestros contratos digitales cumplen con el Código Civil y
                  Comercial de la Nación Argentina y tienen plena validez legal.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border rounded-xl px-4">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                  ¿Cómo funciona la protección del depósito?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  El depósito se retiene en una cuenta especial y se devuelve
                  automáticamente al finalizar el contrato, descontando
                  únicamente los daños comprobados según el inventario inicial.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border rounded-xl px-4">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                  ¿Puedo cancelar mi cuenta en cualquier momento?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Sí. Podés cancelar tu cuenta en cualquier momento desde tu
                  panel de usuario o contactándonos directamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RentMatch. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
