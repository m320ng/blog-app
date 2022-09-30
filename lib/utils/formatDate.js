import siteMetadata from '@/data/siteMetadata'

const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }
  const now = new Date(date).toLocaleDateString(siteMetadata.locale, options)

  return now
}

export default formatDate
