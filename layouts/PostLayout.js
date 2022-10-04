import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import Comments from '@/components/comments'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import moment from 'moment'

const editUrl = (fileName) => `${siteMetadata.siteRepo}/blob/master/data/blog/${fileName}`
const discussUrl = (slug) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `${siteMetadata.siteUrl}/blog/${slug}`
  )}`

const postDateTemplate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

export default function PostLayout({ frontMatter, authorDetails, next, prev, children }) {
  const { slug, fileName, date, title, images, tags } = frontMatter

  return (
    <SectionContainer>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/blog/${slug}`}
        authorDetails={authorDetails}
        {...frontMatter}
      />
      <ScrollTopAndComment />
      <article className="pt-6">
        <h1 className="text-rose mb-4 text-3xl font-bold md:text-5xl ">{title}</h1>
        <div className=" border-muted border-b-[1px] pb-4 ">
          <div className="mt-2 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
            <div className="flex items-center">
              <p className="text-subtle">
                {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {tags?.map((tag) => (
              <Tag key={tag} text={tag} />
            ))}
          </div>
        </div>
        <div className="prose mt-8 max-w-none">{children}</div>
        <div className="mt-3 rounded bg-slate-100 p-4">
          {(next || prev) && (
            <div className="flex justify-between py-4 xl:block xl:space-y-4 xl:py-4">
              {prev && (
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    이전글
                  </h2>
                  <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                    <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                  </div>
                </div>
              )}
              {next && (
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    다음글
                  </h2>
                  <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                    <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="pt-6 text-sm text-gray-700 dark:text-gray-300">
          <Link href={discussUrl(slug)} rel="nofollow">
            {'Discuss on Twitter'}
          </Link>
          {` • `}
          <Link href={editUrl(fileName)}>{'View on GitHub'}</Link>
        </div>
        <div className="mt-2">
          <Comments frontMatter={frontMatter} />
        </div>
      </article>
    </SectionContainer>
  )
}
