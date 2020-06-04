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

export const compare = (a, b) => {
  a = np2p(a)
  b = np2p(b)
  return compareComponent(a.nums, b.nums, false) ||
    compareComponent(a.plus || [], b.plus || [], true)
}

export const within = ([startIncl, endIncl], v) => {
  return compare(startIncl, v) <= 0 && compare(endIncl, v) >= 0
}

export default { parse, toString, p, np, compare, within }
