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

  return { nums, plus }
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

export const toString = ({ nums, plus }) => {
  return [
    nums.map(n => n.toString()).join('.'),
    plus.map(n => `[${n}]`).join('')
  ].filter(c => c).join('')
}

export const type = ({ nums }) => {
  const prefixes = ['', 'Nuwer Parzifal', 'Parzival']
  return prefixes[nums.length]
}

export const title = ({ nums, plus }) => {
  return [ type({ nums }), toString({ nums, plus }) ]
    .filter(c => c)
    .join(' ')
}

const compareComponent = (a, b) => {
  if (heading(a)) {
    return -1
  } else if (heading(b)) {
    return 1
  }

  for (let nn = 0, nl = Math.min(a.length, b.length); nn < nl; nn++) {
    const diff = a[nn] - b[nn]
    if (diff === 0) {
      continue
    }
    return diff < 0 ? -1 : 1
  }
  const diff = a.length - b.length
  return diff === 0 ? 0 : (diff < 0 ? -1 : 1)
}

export const compare = (a, b) => {
  const diff = compareComponent(a.nums, b.nums)
  return diff === 0 ? compareComponent(a.plus, b.plus) : diff
}

export const within = ([startIncl, endIncl], v) => {
  return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0
}

export default { parse, toString, heading, p, np, type, compare, within }
