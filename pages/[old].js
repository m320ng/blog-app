import path from 'path'
import { useRouter } from 'next/router'
import { formatSlug, getAllFilesFrontMatter, getFiles } from '@/lib/mdx'

export async function getStaticPaths() {
  const posts = getFiles('blog')
  const paths = posts
    .filter((p) => ['.md', '.mdx'].indexOf(path.extname(p)) != -1)
    .map((p) => ({
      params: {
        old: formatSlug(p).split('/').pop(),
      },
    }))
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('blog')
  const postIndex = allPosts.findIndex((post) => post.slug.split('/').pop() === params.old)
  const post = allPosts[postIndex]
  return { props: { _layout: false, slug: post.slug, old: params.old } }
}

export default function OldPost({ slug, old }) {
  const router = useRouter()
  if (typeof window !== 'undefined') {
    router.push('/blog/' + slug)
  }
  return <>[/blog/{slug}] 으로 이동합니다</>
}
