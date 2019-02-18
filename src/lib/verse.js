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
    return { ...v, nums: [ nums[1] - 100000 ] }
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

export const parse = (str) => {
  const components = str.replace(/^NP /, '').split(/(?:-|\[|\])+/g).filter(c => c)

  let nums = components.shift()
  if (!nums.match(/^[0-9.]+/g)) throw new Error(nums)
  nums = nums.split('.').map(n => parseInt(n, 10))

  const isHeading = heading(nums)
  const subscript = components.map(c => parseInt(c, 10)).filter(n => !isNaN(n))

  const plus = isHeading ? subscript : subscript.slice(0, 1)
  const para = isHeading ? [] : subscript.slice(1, 2)

  const parsed = { nums }
  if (plus.length) parsed.plus = plus
  if (para.length) parsed.para = para

  return parsed
}

export const toString = ({ nums, plus, para }) => {
  return [
    nums.map(n => n.toString()).join('.'),
    (plus || []).map(n => `[${n}]`).join(''),
    (para || []).map(n => `[0${n}]`).join('')
  ].join('')
}

export const type = ({ nums }) => {
  const prefixes = ['', 'Nuwer Parzifal', 'Parzival']
  return prefixes[nums.length]
}

export const title = ({ nums, plus, para }) => {
  return [ type({ nums }), toString({ nums, plus, para }) ]
    .filter(c => c)
    .join(' ')
}

const compareComponent = (a, b, lengthFactor) => {
  if (heading(a)) {
    return -1
  } else if (heading(b)) {
    return 1
  }

  for (let nn = 0, nl = Math.min(a.length, b.length); nn < nl; nn++) {
    const an = a[nn]
    const bn = b[nn]
    if (an === bn) {
      continue
    }
    return an - bn
  }

  return lengthFactor * (a.length - b.length)
}

export const compare = (a, b) => {
  a = np2p(a)
  b = np2p(b)

  return compareComponent(a.nums, b.nums, 1) ||
    compareComponent(a.plus || [], b.plus || [], -1) ||
    compareComponent(a.para || [], b.para || [], 1)
}

export const within = ([startIncl, endIncl], v) => {
  return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0
}

export default { parse, toString, heading, p, np, type, compare, within }
