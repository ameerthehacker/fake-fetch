export interface FakeConfig {
  request: RequestInfo;
  delay?: number;
  response?: Response | ((request: RequestInfo) => Promise<Response>);
  error?: Error;
}

export interface Config {
  globalFakeConfig?: {
    _404Response?: Response;
    delay?: number;
  };
  fakeConfigs: FakeConfig[];
}

async function sendResponse(
  request: RequestInfo,
  delay: number | undefined,
  response: Response | ((request: RequestInfo) => Promise<Response>)
): Promise<Response> {
  let responseVal: Response;

  if (typeof response === 'function') {
    responseVal = await response(request);
  } else {
    responseVal = response;
  }

  if (delay) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(responseVal), delay);
    });
  } else {
    return Promise.resolve(responseVal);
  }
}

function getUrlFromRequest(request: RequestInfo): string {
  return typeof request === 'object' ? request.url : request;
}

export default function fakeFetch(config: Config | FakeConfig[]) {
  window.fetch = (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    let fakeConfigs: FakeConfig[];
    let globalDelay: number | undefined;
    let global404Response: Response | undefined;

    if (Array.isArray(config)) {
      fakeConfigs = config;
    } else {
      fakeConfigs = config.fakeConfigs;
      globalDelay = config.globalFakeConfig?.delay;
      global404Response = config.globalFakeConfig?._404Response;
    }

    const fakeConfig = fakeConfigs.find((fakeConfig) => {
      const requestUrl = getUrlFromRequest(input);
      const fakeConfigUrl = getUrlFromRequest(fakeConfig.request);
      const fakeRequestMethod =
        typeof fakeConfig.request === 'object'
          ? fakeConfig.request.method
          : undefined;

      return fakeConfigUrl === requestUrl && init?.method === fakeRequestMethod;
    });

    if (fakeConfig) {
      if (fakeConfig.error) {
        throw fakeConfig.error;
      }

      if (!fakeConfig.response) {
        const fakeConfigUrl = getUrlFromRequest(fakeConfig.request);

        throw new Error(
          `fake for request ${fakeConfigUrl} must either contain an error or response property`
        );
      }

      return sendResponse(
        fakeConfig.request,
        fakeConfig.delay || globalDelay,
        fakeConfig.response
      );
    } else {
      if (global404Response) {
        return sendResponse(input, globalDelay, global404Response);
      } else {
        return sendResponse(
          input,
          globalDelay,
          new Response(undefined, {
            status: 404,
            statusText: 'Not Found'
          })
        );
      }
    }
  };
}
