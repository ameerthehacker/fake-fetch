export interface FakeConfig {
  request: RequestInfo;
  delay?: number;
  response: Response;
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

export default function fakeFetch(config: Config) {
  window.fetch = (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    const fakeConfig = config.fakeConfigs.find((fakeConfig) => {
      const requestUrl = typeof input === 'object' ? input.url : input;
      const fakeConfigUrl =
        typeof fakeConfig.request === 'object'
          ? fakeConfig.request.url
          : fakeConfig.request;
      const fakeRequestMethod =
        typeof fakeConfig.request === 'object'
          ? fakeConfig.request.method
          : undefined;

      return fakeConfigUrl === requestUrl && init?.method === fakeRequestMethod;
    });

    if (fakeConfig) {
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
