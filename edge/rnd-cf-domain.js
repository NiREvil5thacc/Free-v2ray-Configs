/**
 * We are all REvil
 * This script handles incoming HTTP requests and proxies them to a list of backend domains.
 * - It parses the request URL and initializes a default list of backend domains.
 * - If provided, it updates the backend domain list from an environment variable.
 * - It attempts to forward the request to a randomly selected backend domain.
 * - If the response from the backend domain matches the expected status code, it returns the response.
 * - If all backend domains fail, it returns a 404 response.
 * - It includes timeout functionality for backend requests and logs various details for debugging.
 */

export default {
  async fetch(request, env, ctx) {
    let url = new URL(request.url);
    const path = url.pathname;
    const params = url.search;
    // backend domain list
    let backendDomains = [
      "cdnjs.com",
      "creativecommons.org",
      "download.yunzhongzhuan.com",
      "fbi.gov",
      "go.inmobi.com",
      "gur.gov.ua",
      "icook.hk",
      "icook.tw",
      "ip.sb",
      "iplocation.io",
      "japan.com",
      "log.bpminecraft.com",
      "malaysia.com",
      "nginx-z.pages.dev",
      "russia.com",
      "singapore.com",
      "skk.moe",
      "sky.rethinkdns.com",
      "strawberry.victoriacross.workers.dev",
      "time.is",
      "whatismyipaddress.com",
      "www.boba88slot.com",
      "www.csgo.com",
      "www.glassdoor.com",
      "www.gov.ua",
      "www.iakeys.com",
      "www.ipaddress.my",
      "www.ipchicken.com",
      "www.ipget.net",
      "www.iplocation.net",
      "www.speedtest.net",
      "www.udacity.com",
      "www.visa.com",
      "www.wto.org",
      "www.whatismyip.com",
      "zula.ir"
    ];

    // If HOST exists in environment variables, get new backend domain list using ADD function
    if (env.HOST) backendDomains = await ADD(env.HOST);

    // Get test path, default is '/sub'
    let testPath = env.PATH || "/";
    // Ensure test path starts with '/'
    if (testPath.charAt(0) !== "/") testPath = "/" + testPath;
    let responseCode = env.CODE || "200";
    // Log number of backend domains and their list
    console.log(
      `Backend count: ${backendDomains.length}\nBackend domains: ${backendDomains}\nTest path: ${testPath}\nResponse code: ${responseCode}`,
    );

    // Store failed backend domains
    let failedBackends = [];

    // Function to wrap request logic with timeout functionality
    async function fetchWithTimeout(resource, options = {}) {
      const { timeout = 1618 } = options;

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(id));

      return response;
    }

    // Function to select backend domain and make request
    async function getValidResponse(request, backendDomains) {
      // Loop while backend domain list is not empty
      while (backendDomains.length > 0) {
        // Randomly select a backend domain
        const randomBackend =
          backendDomains[Math.floor(Math.random() * backendDomains.length)];
        // Remove selected domain from the list
        backendDomains = backendDomains.filter(
          (host) => host !== randomBackend,
        );

        url.hostname = randomBackend; // domain
        url.pathname = testPath.split("?")[0];
        url.search =
          testPath.split("?")[1] == "" ? "" : "?" + testPath.split("?")[1];
        try {
          // Make request with timeout
          const response = await fetchWithTimeout(new Request(url), {
            timeout: 1618,
          });
          // If response status is 200, request is successful
          if (response.status.toString() == responseCode) {
            if (path != "/") url.pathname = path;
            console.log(`Using backend: ${url.hostname}`);
            //console.log(`Failed backends: ${failedBackends}`);
            console.log(`Remaining backends: ${backendDomains}`);
            url.search = params;
            return await fetch(new Request(url, request));
          } else {
            console.log(`Failed backend: ${url.hostname}:${response.status}`);
          }
        } catch (error) {
          // Catch request errors, add failed backend to the failed list
          failedBackends.push(randomBackend);
        }
      }
      // If all backends fail, throw error
      return new Response("All backends are unavailable!", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    // Call getValidResponse function to get valid response
    return await getValidResponse(request, backendDomains);
  },
};

async function ADD(envadd) {
  // Replace tabs, double quotes, single quotes and newlines with commas
  // Then replace multiple consecutive commas with single comma
  var addtext = envadd.replace(/[ |"'\r\n]+/g, ",").replace(/,+/g, ",");

  // Remove leading and trailing commas (if any)
  if (addtext.charAt(0) == ",") addtext = addtext.slice(1);
  if (addtext.charAt(addtext.length - 1) == ",")
    addtext = addtext.slice(0, addtext.length - 1);

  // Split string by comma to get address array
  const add = addtext.split(",");

  return add;
}
