// XML parser
const parser = require('fast-xml-parser')

const json = (obj) => JSON.stringify(obj)
const RequestError = (error, message) => {
  return { error, message }
}
const res = (response, init = {}) => {
  return new Response(response, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
    },
    ...init,
  })
}

// website fetcher
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
  return await request
    .clone()
    .json()
    .then((r) => {
      return r.url ? r.url : null
    })
    .catch(() => null)
}

/**
 * Respond with the parsed RSS JSON Data
 * @param {Request} request
 */
async function handleRequest(request) {
  // check if not POST
  if (request.method !== 'POST') {
    return res(json(RequestError(405, 'Method Not Allowed')), {
      status: 405,
      statusText: 'Method Not Allowed',
    })
  }

  const rss_url = await requestParser(request)

  // `url` is not defined in request body
  if (!rss_url) {
    return res(
      json(
        RequestError(
          400,
          'Bad Request, please set the `url` in your body data.',
        ),
      ),
      {
        status: 400,
        statusText: 'Bad Request',
      },
    )
  }

  try {
    let xmlData = await fetcher(rss_url)
    let rssJson = parser.parse(xmlData)
    // return parsed rss
    return res(json(rssJson))
  } catch {
    // if there was a problem, return 500 error
    return res(
      json(
        RequestError(
          500,
          'There was a problem with your request, please try again later.',
        ),
      ),
      { status: 500, statusText: 'Internal Server Error' },
    )
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
