import SiteTabNav from '@/components/dashboard/SiteTabNav'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  return (
    <>
      <SiteTabNav siteId={siteId} />
      {children}
    </>
  )
}
