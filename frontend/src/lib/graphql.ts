import { Client, cacheExchange, fetchExchange, subscriptionExchange } from '@urql/core';

// ponytail: WS subscription buat real-time issue updates
const wsUrl =
  typeof window !== 'undefined'
    ? `ws://${window.location.hostname}:4000/graphql`
    : 'ws://localhost:4000/graphql';

export const client = new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || '' };
        return {
          subscribe(sink) {
            const ws = new WebSocket(wsUrl, 'graphql-transport-ws');
            let closed = false;

            ws.onopen = () => {
              ws.send(JSON.stringify({ type: 'subscribe', id: 1, payload: { query: input.query, variables: input.variables } }));
            };
            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'next' && !closed) {
                  sink.next(data.payload);
                } else if (data.type === 'error') {
                  sink.error(data.payload);
                } else if (data.type === 'complete') {
                  closed = true;
                  sink.complete();
                  ws.close();
                }
              } catch (e) {
                // ignore parse errors
              }
            };
            ws.onerror = () => {
              if (!closed) sink.error(new Error('WebSocket error'));
            };
            ws.onclose = () => {
              if (!closed) sink.complete();
            };

            return {
              unsubscribe: () => {
                closed = true;
                ws.close();
              },
            };
          },
        };
      },
    }),
  ],
  fetchOptions: () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
});
