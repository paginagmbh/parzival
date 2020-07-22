export const compare = (a, b) => {
  a = np2p(a)
  b = np2p(b)
  return compareComponent(a.nums, b.nums, false) ||
    compareComponent(a.plus || [], b.plus || [], true)
}

const compareComponent = (a, b, plus) => {
  // HACK: a single '0' always comes first
  if (plus) {
    if (a.length === 1 && a[0] === 0) return -1
    if (b.length === 1 && b[0] === 0) return 1
  }

  for (let nn = 0, nl = Math.max(a.length, b.length); nn < nl; nn++) {
    let an = nn < a.length ? a[nn] : 0
    let bn = nn < b.length ? b[nn] : 0
    if (an === bn) {
      continue
    }
    if ((an < 0 && bn < 0) || (an > 0 && bn > 0)) {
      an = Math.abs(an)
      bn = Math.abs(bn)
    }
    return an - bn
  }
  return 0
}

const firstLineForManuscript = (html, manuscript) => {
  return parseInt(Object.keys(html).find(k => html[k][manuscript]))
}

// determine preceding line which has an entry for the current manuscript, skipping over lines that only have
// entries for the other manuscript
const getPreviousLineForManuscriptLine = (html, manuscript, line) => {
  let offset = 1
  const lineNum = parseInt(line)
  let firstLine = manuscript === 'V' ? firstLineForManuscript(html, 'V') : firstLineForManuscript(html, 'VV')

  while (lineNum - offset > firstLine &&
    (!html[lineNum - offset] ||
    !html[lineNum - offset][manuscript] ||
    !html[lineNum - offset][manuscript].verse)) {
    offset++
  }

  return lineNum - offset
}

export const isGap = (html, manuscript, secondLine) => {
  const firstLine = getPreviousLineForManuscriptLine(html, manuscript, secondLine)
  const firstVerse = html[firstLine] && html[firstLine][manuscript] ? html[firstLine][manuscript].verse : undefined
  const secondVerse = html[secondLine] && html[secondLine][manuscript] ? html[secondLine][manuscript].verse : undefined

  if (bespokeGaps.find(g => g.verse === secondVerse && g.manuscript === manuscript)) {
    return true
  }

  const parsedFirstVerse = parse(firstVerse)
  const parsedSecondVerse = parse(secondVerse)
  const firstVerseNums = parsedFirstVerse.nums
  const secondVerseNums = parsedSecondVerse.nums
  const noGap = compare(parsedFirstVerse, parsedSecondVerse) > 0 || // we are not interested in transpositions or editorial comments, these are handled elsewhere
    (!(firstVerseNums.length && secondVerseNums)) || // when both verses are undefined, we consider this not a gap
    (firstVerseNums[firstVerseNums.length - 1] === secondVerseNums[secondVerseNums.length - 1]) || // we ignore so-called "plus" verses
    (firstVerseNums[firstVerseNums.length - 1] == 30 && secondVerseNums[secondVerseNums.length - 1] % 30 === 1) || // in Lachmann's scheme sub-numbers always run until 30, then restart at 1
    (firstVerseNums[0] === 733 && firstVerseNums[1] === 30) || // after 733.30 the Nieuwer Parzival numbering starts, so we don't consider this a gap
    ( // the normal case: second verse number is one higher than preceding verse number
      (
        (firstVerseNums.length === 1 && secondVerseNums.length === 1) ||
        (firstVerseNums.length > 1 && secondVerseNums.length > 1 && firstVerseNums[firstVerseNums.length - 2] === secondVerseNums[secondVerseNums.length - 2])
      ) &&
      (firstVerseNums[firstVerseNums.length - 1] === (secondVerseNums[secondVerseNums.length - 1] - 1))
    )

  return !noGap
}

export const isTranspositionStart = (html, manuscript, line) => {
  const currentVerse = html[line] && html[line][manuscript] ? html[line][manuscript].verse : undefined
  if (bespokeTranspositions.find(v => v.manuscript === manuscript && v.verse === currentVerse)) {
    return true
  }

  const previousLine = getPreviousLineForManuscriptLine(html, manuscript, line)
  const previousVerse = html[previousLine] && html[previousLine][manuscript] ? html[previousLine][manuscript].verse : undefined
  const parsedPreviousVerse = parse(previousVerse)
  const parsedCurrentVerse = parse(currentVerse)

  return parsedCurrentVerse &&
     parsedCurrentVerse.nums &&
     parsedCurrentVerse.nums.length &&
     compare(parsedPreviousVerse, parsedCurrentVerse) > 0
}

export const np = ({ nums }) => {
  return nums.length === 1
}

export const np2p = (v) => {
  const { nums } = v
  if (nums.length === 1) {
    return { ...v, nums: [ 733, nums[0] + 10000 ] }
  }
  return v
}

export const p = ({ nums }) => {
  return nums.length === 2
}

export const p2np = (v) => {
  const { nums } = v
  if (nums.length === 2 && nums[0] === 733 && nums[1] >= 100000) {
    return { ...v, nums: [ nums[1] - 100000 ] }
  }
  return v
}

export const parse = (str) => {
  try {
    if (!str) {
      return { nums: [] }
    }
    const components = str
      .replace(/Pr\s*([0-9]+)/i, '112.12[$1]')
      .replace(/Ep\s*([0-9]+)/i, '827.30[$1]')
      .replace(/^NP /i, '')
      .split(/(?:-|\[|\])+/g).filter(c => c)

    let nums = components.shift()
    if (!nums.match(/^[0-9.]+/g)) throw new Error(nums)
    nums = nums.split('.').map(n => parseInt(n, 10))

    const plus = []
    for (const c of components) {
      const n = parseInt(c, 10)
      if (isNaN(n)) continue
      plus.push(n * (c.startsWith('0') ? -1 : 1))
    }

    const parsed = { nums }
    if (plus.length) parsed.plus = plus

    return parsed
  } catch (error) {
    // console.error(error)
    return { nums: [] }
  }
}

export const toString = ({ nums, plus }) => {
  const str = [
    nums.length === 1 ? 'NP ' : '',
    nums.map(n => n.toString()).join('.'),
    (plus || []).map(n => `[${n < 0 ? '0' : ''}${Math.abs(n)}]`).join('')
  ].join('')

  return str
    .replace(/112.12\[([0-9]+)\]/, 'Pr $1')
    .replace(/827.30\[([0-9]+)\]/, 'Ep $1')
}

export const within = ([startIncl, endIncl], v) => {
  return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0
}

const bespokeGaps = [
  { manuscript: 'V', verse: '69.28' },
  { manuscript: 'V', verse: '70.8' },
  { manuscript: 'V', verse: '71.6' },
  { manuscript: 'V', verse: '70.1' }
]
const bespokeTranspositions = [{ manuscript: 'V', verse: '70.6' }, { manuscript: 'V', verse: '70.7' }, { manuscript: 'V', verse: '69.29' }]

export default { isGap, isTranspositionStart, parse, toString, p, np, compare, within }
