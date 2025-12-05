import * as linkify from 'linkifyjs'

export default ({ Vue }) => {
  return {
    bind (el, binding) {
      updateLinkified(el, binding)
    },
    update (el, binding) {
      updateLinkified(el, binding)
    },
    componentUpdated (el, binding) {
      updateLinkified(el, binding)
    }
  }
}

function updateLinkified (el, binding) {
  // Handle v-linkify:options syntax where binding.arg is 'options' and binding.value is the options object
  const options = binding.arg === 'options' ? (binding.value || {}) : (binding.value?.options || binding.value || {})
  const target = options.target || '_blank'

  // Check if element already has HTML content (from v-html)
  const hasHtmlContent = el.innerHTML !== el.textContent

  if (hasHtmlContent) {
    // Element has HTML structure, process text nodes while preserving HTML
    processHtmlContent(el, target)
  } else {
    // Plain text content, process normally
    processPlainText(el, target)
  }
}

function processPlainText (el, target) {
  // Get the text content
  const originalText = el.textContent || el.innerText || ''

  if (!originalText.trim()) {
    return
  }

  // Find all links in the text
  const links = linkify.find(originalText)

  if (links.length === 0) {
    return
  }

  // Build HTML by iterating through text and inserting links at correct positions
  let html = ''
  let lastIndex = 0

  // Sort links by start position
  const sortedLinks = [...links].sort((a, b) => a.start - b.start)

  sortedLinks.forEach(link => {
    // Add text before the link
    const beforeText = originalText.substring(lastIndex, link.start)
    html += escapeHtml(beforeText)

    // Add the link
    const linkText = originalText.substring(link.start, link.end)
    const href = link.href || link.value
    const escapedLinkText = escapeHtml(linkText)
    html += `<a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapedLinkText}</a>`

    lastIndex = link.end
  })

  // Add remaining text after last link
  if (lastIndex < originalText.length) {
    html += escapeHtml(originalText.substring(lastIndex))
  }

  // Update the element's innerHTML
  el.innerHTML = html
}

function processHtmlContent (el, target) {
  // Clone the element to work with
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = el.innerHTML

  // Get all text nodes and process them
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  // Collect all text nodes first (to avoid modifying tree while walking)
  const textNodes = []
  let node = walker.nextNode()
  while (node) {
    if (node.textContent.trim()) {
      textNodes.push({
        node: node,
        text: node.textContent
      })
    }
    node = walker.nextNode()
  }

  // Process each text node
  textNodes.forEach(({ node: textNode, text }) => {
    const links = linkify.find(text)

    if (links.length === 0) {
      return
    }

    // Build HTML with links
    let html = ''
    let lastIndex = 0

    const sortedLinks = [...links].sort((a, b) => a.start - b.start)

    sortedLinks.forEach(link => {
      // Add text before the link
      const beforeText = text.substring(lastIndex, link.start)
      html += escapeHtml(beforeText)

      // Add the link
      const linkText = text.substring(link.start, link.end)
      const href = link.href || link.value
      const escapedLinkText = escapeHtml(linkText)
      html += `<a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapedLinkText}</a>`

      lastIndex = link.end
    })

    // Add remaining text after last link
    if (lastIndex < text.length) {
      html += escapeHtml(text.substring(lastIndex))
    }

    // Replace text node with HTML
    const tempSpan = document.createElement('span')
    tempSpan.innerHTML = html

    // Replace the text node with the new content
    const fragment = document.createDocumentFragment()
    while (tempSpan.firstChild) {
      fragment.appendChild(tempSpan.firstChild)
    }

    textNode.parentNode.replaceChild(fragment, textNode)
  })

  // Update the original element with processed content
  el.innerHTML = tempDiv.innerHTML
}

function escapeHtml (text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
