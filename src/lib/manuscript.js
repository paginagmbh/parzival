export const equal = (a, b) => {
  for (const k of ['leaf', 'page', 'column']) {
    if (a[k] === b[k]) {
      continue
    }
    return false
  }
  return true
}

export const pad = (num, length = 2) => {
  let str = num.toString()
  for (let p = 1; p <= length; p++) {
    const threshold = Math.pow(10, p)
    if (num < threshold) {
      str = '0' + str
    }
  }
  return str
}

export const parsePageSigil = (str) => {
  let [, leaf, page, column] = str.trim().match(/([0-9]{1,3})([rv])([ab])?/)
  leaf = parseInt(leaf, 10)
  if (!leaf || !page) {
    throw new Error(str)
  }
  return { leaf, page, column }
}

export const pageSigil = ({ leaf, page }, padLength = 2) => {
  return [pad(leaf, padLength), page].join('')
}

export const columnSigil = ({ leaf, page, column }, padLength = 2) => {
  return [pad(leaf, padLength), page, column].join('')
}

export const nextPage = ({ leaf, page }) => {
  if (page === 'r') {
    page = 'v'
  } else {
    leaf += 1
    page = 'r'
  }
  return { leaf, page }
}

export const pageRange = (start, end) => {
  const range = []
  for (let current = start; ; current = nextPage(current)) {
    range.push(current)
    if (equal(current, end)) {
      break
    }
  }
  return range
}

export const pageSeq = (start, length) => {
  const seq = []
  for (let current = start, pc = 0; pc < length; pc++) {
    seq.push(current)
    current = nextPage(current)
  }
  return seq
}