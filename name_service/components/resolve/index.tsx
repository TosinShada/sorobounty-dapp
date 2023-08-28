import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useDomain } from '@/hooks'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  })
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: Partial<FormValues> = {
  name: '',
}

export function ResolveName() {
  const { resolveDomain, domainAddress } = useDomain()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    await resolveDomain(data.name)
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Resolve Soroban Name Service</CardTitle>
        <CardDescription>
          Resolve a name to an address.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 my-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="search..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        {domainAddress && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{domainAddress}</span>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
