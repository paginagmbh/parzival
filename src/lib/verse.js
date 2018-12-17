export const parse = (str) => {
  const numsRe = /^([0-9.]+)/g
  const numsMatch = numsRe.exec(str)
  if (numsMatch === null) {
    throw new Error(str)
  }

  let [ , nums ] = numsMatch
  nums = nums.split('.').map(n => parseInt(n, 10))

  const plus = []
  const plusRe = /\[(\d+)]/g
  let plusMatch
  while ((plusMatch = plusRe.exec(str)) !== null) {
    let [ , plusVerse ] = plusMatch
    plus.push(parseInt(plusVerse, 10))
  }

  const extensionRe = /-a$/g
  const extension = extensionRe.exec(str) && true

  return { nums, plus, extension }
}

export const heading = (comp) => {
  const [ c0 ] = comp
  return comp.length === 1 && c0 === 0
}

export const p = ({ nums }) => {
  return nums.length === 2
}

export const np = ({ nums }) => {
  return nums.length === 1
}

export const p2np = (v) => {
  const { nums } = v
  if (nums.length === 2 && nums[0] === 733 && nums[1] >= 100000) {
    return { ...v, nums: [ nums[1] - 10000 ] }
  }
  return v
}

export const np2p = (v) => {
  const { nums } = v
  if (nums.length === 1) {
    return { ...v, nums: [ 733, nums[0] + 10000 ] }
  }
  return v
}

export const toString = ({ nums, plus, extension }) => {
  return [
    nums.map(n => n.toString()).join('.'),
    plus.map(n => `[${n}]`).join(''),
    extension ? '-a' : ''
  ].filter(c => c).join('')
}

export const type = ({ nums }) => {
  const prefixes = ['', 'Nuwer Parzifal', 'Parzival']
  return prefixes[nums.length]
}

export const title = ({ nums, plus, extension }) => {
  return [ type({ nums }), toString({ nums, plus, extension }) ]
    .filter(c => c)
    .join(' ')
}

const numCmp = (a, b) => a - b

const strCmp = (a, b) => a.localeCompare(b)

const compareComponent = (a, b, cmp = numCmp) => {
  if (heading(a)) {
    return -1
  } else if (heading(b)) {
    return 1
  }

  for (let nn = 0, nl = Math.min(a.length, b.length); nn < nl; nn++) {
    const diff = cmp(a[nn], b[nn])
    if (diff === 0) {
      continue
    }
    return diff < 0 ? -1 : 1
  }
  const diff = a.length - b.length
  return diff === 0 ? 0 : (diff < 0 ? -1 : 1)
}

export const compare = (a, b) => {
  a = np2p(a)
  b = np2p(b)

  let diff = compareComponent(a.nums, b.nums)
  if (diff !== 0) return diff

  diff = compareComponent(a.plus, b.plus)
  if (diff !== 0) return diff

  return compareComponent(a.extension || [], b.extension || [], strCmp)
}

export const within = ([startIncl, endIncl], v) => {
  return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0
}

export default { parse, toString, heading, p, np, type, compare, within }
