// XML parser
const parser = require('fast-xml-parser')

const fetcher = async (url) => {
  return await fetch(url, {
    method: 'GET',
  })
    .then((r) => r.text())
    .then((data) => data)
}

/**
 * Get the `url` in the request object.
 * @param {Request} request
 */
const requestParser = async (request) => {
  const { url } = await request.clone().json()

  return url ? url : null
}

/**
 * Respond with the parsed RSS JSON Data
 * @param {Request} request
 */
async function handleRequest(request) {
  // check if not POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 405, message: 'Method Not Allowed' }),
      {
        status: 405,
        statusText: 'Method Not Allowed',
      },
    )
  }

  const rss_url = await requestParser(request)

  // `url` is not defined in request body
  if (!rss_url) {
    return new Response(
      JSON.stringify(
        {
          error: '400',
          message: 'Bad Request, please set the `url` in your body data.',
        },
        {
          status: 400,
          statusText: 'Bad Request',
        },
      ),
    )
  }

  let xmlData = await fetcher(rss_url)

  let json = parser.parse(xmlData)

  return new Response(JSON.stringify(json.rss.channel), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  })
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
