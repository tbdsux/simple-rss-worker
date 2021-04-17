const parser = require('fast-xml-parser')

const fetcher = async () => {
	return await fetch("http://rss.cnn.com/rss/cnn_latest.rss", {
		method: "GET",
	})
		.then((r) => r.text())
		.then((data) => data);
};


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const r = await request.clone().json()
  console.log(r)


  let xmlData = await fetcher();

	let json = parser.parse(xmlData);

  return new Response(JSON.stringify(json.rss.channel), {
    headers: {
        "content-type": "application/json;charset=UTF-8"
      }
  })
}
