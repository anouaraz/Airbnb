"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import SignatureCanvas from "./signature-canvas"
import DropzoneComponent from "./DropzoneComponent"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const guestSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom complet doit comporter au moins 2 caractères" }),
  sex: z.enum(["male", "female"], { required_error: "Veuillez sélectionner un sexe" }),
  nationality: z.string().min(1, { message: "Veuillez sélectionner une nationalité" }),
})

const formSchema = z.object({
  numberOfGuests: z.string().min(1, { message: "Veuillez sélectionner le nombre d'invités" }),
  guests: z.array(guestSchema),
  identification: z.array(z.any()).refine((files) => files.length > 0, "L'identification est requise"),
  marriageCertificate: z.array(z.any()).optional(),
  termsAccepted: z.enum(["accepted"], { required_error: "Vous devez accepter les conditions générales" }),
  signature: z.string().min(1, { message: "Veuillez fournir votre signature" }),
})

export function AirbnbMoroccoForm() {
  const [requiresMarriageCertificate, setRequiresMarriageCertificate] = useState(false)
  const [signature, setSignature] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfGuests: "1",
      guests: [{ fullName: "", sex: "male", nationality: "" }],
      identification: [],
      marriageCertificate: [],
      termsAccepted: undefined,
      signature: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "guests",
    control: form.control,
  })

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "numberOfGuests" || name?.startsWith("guests")) {
        const numGuests = Number.parseInt(value.numberOfGuests as string, 10)
        const currentGuests = value.guests || []

        if (currentGuests.length < numGuests) {
          for (let i = currentGuests.length; i < numGuests; i++) {
            append({ fullName: "", sex: "male", nationality: "" })
          }
        } else if (currentGuests.length > numGuests) {
          for (let i = currentGuests.length - 1; i >= numGuests; i--) {
            remove(i)
          }
        }

        const hasMoroccanFemale = currentGuests.some(
          (guest) => guest.nationality === "Moroccan" && guest.sex === "female",
        )
        const hasMoroccanMale = currentGuests.some((guest) => guest.nationality === "Moroccan" && guest.sex === "male")
        const hasNonMoroccanFemale = currentGuests.some(
          (guest) => guest.nationality !== "Moroccan" && guest.sex === "female",
        )
        const hasNonMoroccanMale = currentGuests.some(
          (guest) => guest.nationality !== "Moroccan" && guest.sex === "male",
        )

        setRequiresMarriageCertificate(
          (hasMoroccanFemale && hasMoroccanMale) ||
            (hasMoroccanFemale && hasNonMoroccanMale) ||
            (hasMoroccanMale && hasNonMoroccanFemale),
        )
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch, append, remove])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Here you would typically send the form data to your server
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-8">
      <Card className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Formulaire d&apos;inscription Airbnb Maroc
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-700">Nombre d&apos;invités</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Sélectionnez le nombre d'invités" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-white/70 backdrop-blur-sm shadow-md rounded-lg overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Invité {index + 1}</h3>
                      <FormField
                        control={form.control}
                        name={`guests.${index}.fullName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guests.${index}.sex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sexe</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/50">
                                  <SelectValue placeholder="Sélectionnez le sexe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Homme</SelectItem>
                                <SelectItem value="female">Femme</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guests.${index}.nationality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationalité</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/50">
                                  <SelectValue placeholder="Sélectionnez votre nationalité" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Moroccan">Marocaine</SelectItem>
                                <SelectItem value="French">Française</SelectItem>
                                <SelectItem value="American">Américaine</SelectItem>
                                <SelectItem value="Other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="identification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Identification (CIN ou Passeport)
                            </FormLabel>
                            <FormControl>
                              <DropzoneComponent />
                            </FormControl>
                            <FormDescription>
                              Veuillez télécharger une copie de votre CIN ou passeport (recto et verso). Taille maximale du
                              fichier : 5 Mo par image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-8" />

              

              {requiresMarriageCertificate && (
                <FormField
                  control={form.control}
                  name="marriageCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Certificat de mariage</FormLabel>
                      <FormControl>
                        <DropzoneComponent />
                      </FormControl>
                      <FormDescription>
                        Comme il y a des invités masculins et féminins, dont une femme marocaine, veuillez télécharger
                        votre certificat de mariage. Taille maximale du fichier : 5 Mo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold text-gray-700">Conditions générales</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="accepted" />
                          </FormControl>
                          <FormLabel className="font-normal">J&apos;accepte les conditions générales</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-700">Signature</FormLabel>
                    <FormControl>
                      <SignatureCanvas
                        onChange={(sig) => {
                          setSignature(sig)
                          field.onChange(sig)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="flex items-center justify-center">
              <Button
                type="submit"
                className="w-[50%] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Soumettre
              </Button>
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

