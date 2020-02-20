export interface FakeConfig {
  request: RequestInfo;
  delay?: number;
  response?: Response;
  error?: Error;
}

export interface Config {
  globalFakeConfig?: {
    _404Response?: Response;
    delay?: number;
  };
  fakeConfigs: FakeConfig[];
}

function sendResponse(
  delay: number | undefined,
  response: Response
): Promise<Response> {
  if (delay) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(response), delay);
    });
  } else {
    return Promise.resolve(response);
  }
}

function getUrlFromRequest(request: RequestInfo): string {
  return typeof request === 'object' ? request.url : request;
}

export default function fakeFetch(config: Config) {
  window.fetch = (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    const fakeConfig = config.fakeConfigs.find((fakeConfig) => {
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
        fakeConfig.delay || config.globalFakeConfig?.delay,
        fakeConfig.response
      );
    } else {
      if (config.globalFakeConfig?._404Response) {
        return sendResponse(
          config.globalFakeConfig?.delay,
          config.globalFakeConfig._404Response
        );
      } else {
        return sendResponse(
          config.globalFakeConfig?.delay,
          new Response(undefined, {
            status: 404,
            statusText: 'Not Found'
          })
        );
      }
    }
  };
}
