import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { getAllCategories } from '@/lib/categories'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import kebabCase from '@/lib/utils/kebabCase'

const root = process.cwd()

export async function getStaticPaths() {
  const categories = await getAllCategories('blog')

  return {
    paths: Object.keys(categories).map((category) => ({
      params: {
        category,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('blog')
  const filteredPosts = allPosts.filter(
    (post) =>
      post.draft !== true && post.categories?.map((t) => kebabCase(t)).includes(params.category)
  )

  return { props: { posts: filteredPosts, category: params.category } }
}

export default function Category({ posts, category }) {
  // Capitalize first letter and convert space to dash
  const title = category[0].toUpperCase() + category.split(' ').join('-').slice(1)
  return (
    <>
      <ListLayout posts={posts} title={title} />
    </>
  )
}
