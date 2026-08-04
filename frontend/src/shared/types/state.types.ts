// ponytail: StateData — generic wrapper untuk form/fetch state di seluruh app
export interface StateMeta {
  loading: boolean;
  message: string;
}

export interface StateData<TData = unknown, TParams = Record<string, unknown>> {
  meta: StateMeta;
  data: TData;
  params?: TParams;
}
