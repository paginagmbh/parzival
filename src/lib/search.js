import { pageSigil } from './manuscript'
import verse from './verse'

/* https://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/ */
export const binarySearch = (arr, searchElement, compare) => {
  let minIndex = 0
  let maxIndex = arr.length - 1
  let currentIndex
  let currentElement

  while (minIndex <= maxIndex) {
    currentIndex = (minIndex + maxIndex) / 2 | 0
    currentElement = arr[currentIndex]

    const diff = compare(currentElement, searchElement)

    if (diff < 0) {
      minIndex = currentIndex + 1
    } else if (diff > 0) {
      maxIndex = currentIndex - 1
    } else {
      return currentIndex
    }
  }

  return -1
}

export const searchByVerse = ({ np, p }, query) => {
  const scope = verse.p(query) ? p : np
  const index = binarySearch(scope, query, (col, query) => {
    const { start, end } = col
    if (verse.compare(start, query) > 0) {
      return 1
    } else if (verse.compare(end, query) < 0) {
      return -1
    }
    return 0
  })
  return index >= 0 ? pageSigil(scope[index]) : undefined
}

export const searchPage = (manuscript, query) => {
  query = query.replace(/[^0-9rvs]/gi, '')

  let [ , prefix, leaf, page ] = /^(vs)?([0-9]+)([rv])?$/i.exec(query)
  prefix = prefix || ''
  leaf = leaf ? parseInt(leaf, 10) || undefined : undefined
  page = (page || 'r').toLowerCase()

  if (!leaf) {
    return undefined
  }

  leaf = Math.max(0, Math.min(999, leaf))
  page = pageSigil({ prefix, leaf, page })
  if (manuscript.pages.indexOf(page) < 0) {
    return undefined
  }

  return { page }
}

export const searchVerse = (manuscript, query) => {
  query = query.replace(/[^EpPr0-9.[\]]/gi, '')

  try {
    query = verse.parse(query)
  } catch (e) {
    query = undefined
  }

  if (!query) {
    return undefined
  }

  const page = searchByVerse(manuscript, query)
  if (!page) {
    return undefined
  }

  return { page, verse: verse.toString(query) }
}

export const search = (manuscript, query) => {
  return /[rv]$/i.test(query)
    ? searchPage(manuscript, query)
    : searchVerse(manuscript, query)
}

export default { binarySearch, search, searchPage, searchVerse }
