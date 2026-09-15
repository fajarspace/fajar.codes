import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { updateProfile } from '@/services'
import { getErrorMessage } from '@/utils/errors'
import { emptyToNull, profileSchema, type ProfileFormValues } from '@/utils/validation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Field, Input, Textarea } from '@/components/admin/Field'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Button } from '@/components/common/Button'

export default function ProfileAdminPage() {
  const { profile, refreshProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      username: '',
      headline: '',
      bio: '',
      avatarUrl: '',
      location: '',
      email: '',
    },
  })
  const { register, handleSubmit, control, reset, formState } = form

  useEffect(() => {
    if (!profile) return
    reset({
      fullName: profile.fullName,
      username: profile.username,
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      location: profile.location ?? '',
      email: profile.email ?? '',
    })
  }, [profile, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return
    try {
      await updateProfile(profile.id, {
        fullName: values.fullName,
        username: values.username,
        headline: emptyToNull(values.headline),
        bio: emptyToNull(values.bio),
        avatarUrl: emptyToNull(values.avatarUrl),
        location: emptyToNull(values.location),
        email: emptyToNull(values.email),
      })
      await refreshProfile()
      queryCache.invalidate('profile')
      toast({ title: 'Profile saved', tone: 'success' })
    } catch (error) {
      toast({ title: 'Could not save', description: getErrorMessage(error), tone: 'error' })
    }
  })

  return (
    <>
      <AdminPageHeader
        title="Profile"
        description="Public details shown on the home page."
        actions={
          <Button variant="primary" size="sm" onClick={() => void onSubmit()} loading={formState.isSubmitting} disabled={!formState.isDirty}>
            Save
          </Button>
        }
      />
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-12" noValidate>
        <div className="space-y-6 lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" error={formState.errors.fullName?.message}>
              <Input id="fullName" {...register('fullName')} />
            </Field>
            <Field label="Username" htmlFor="username" error={formState.errors.username?.message}>
              <Input id="username" {...register('username')} />
            </Field>
          </div>
          <Field label="Headline" htmlFor="headline" error={formState.errors.headline?.message}>
            <Input id="headline" {...register('headline')} />
          </Field>
          <Field label="Bio" htmlFor="bio" error={formState.errors.bio?.message}>
            <Textarea id="bio" rows={5} {...register('bio')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="location">
              <Input id="location" {...register('location')} />
            </Field>
            <Field label="Public email" htmlFor="email" error={formState.errors.email?.message}>
              <Input id="email" type="email" {...register('email')} />
            </Field>
          </div>
        </div>
        <aside className="lg:col-span-5">
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field }) => <ImageUpload label="Portrait" folder="avatar" value={field.value} onChange={field.onChange} ratio="4 / 5" />}
          />
        </aside>
      </form>
    </>
  )
}
